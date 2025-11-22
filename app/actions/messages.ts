'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Message, { MessageSender } from '@/models/Message';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import { sendRealtimeMessage } from '@/lib/services/pusher.service';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get messages for a project
export async function getMessages(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const messages = await Message.find({ projectId })
            .sort({ createdAt: 1 })
            .lean();

        const serializedMessages = messages.map(msg =>
            toSerializedObject(msg)
        );

        return { success: true, data: { messages: serializedMessages, currentUserId: user._id.toString() } };
    } catch (error) {
        logError(error as Error, { context: 'getMessages', projectId });
        return { success: false, error: 'Failed to fetch messages' };
    }
}

// Send a message
export async function sendMessage(
    projectId: string,
    message: string
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        if (!message.trim()) {
            return { success: false, error: 'Message cannot be empty' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const newMessage = await Message.create({
            projectId,
            userId: user._id,
            clerkUserId,
            sender: MessageSender.CLIENT,
            message: message.trim(),
            isRead: false,
        });

        // Get project details for Pusher payload
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .lean();

        const userPopulated = populatedMessage?.userId as any;
        const project = populatedMessage?.projectId as any;

        const serializedMessage = {
            ...toSerializedObject(newMessage),
            _id: newMessage._id.toString(),
            projectId: newMessage.projectId.toString(),
            userId: newMessage.userId.toString(),
            clientName: userPopulated ? `${userPopulated.firstName || ''} ${userPopulated.lastName || ''}`.trim() || userPopulated.email : '',
            clientEmail: userPopulated?.email || '',
            projectName: project?.projectName || '',
        };

        // Trigger real-time notification via Pusher
        try {
            await sendRealtimeMessage(projectId, serializedMessage);
        } catch (error) {
            // Log but don't fail if Pusher fails (graceful degradation)
            logError(error as Error, { context: 'sendMessage-pusher', projectId });
        }

        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/admin/messages`);

        return {
            success: true,
            data: serializedMessage,
        };
    } catch (error) {
        logError(error as Error, { context: 'sendMessage', projectId });
        return { success: false, error: 'Failed to send message' };
    }
}

// Mark messages as read (client reading admin messages)
export async function markMessagesAsRead(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Get IDs of messages being marked as read
        const unreadMessages = await Message.find(
            { projectId, isRead: false, sender: MessageSender.ADMIN },
            { _id: 1 }
        );

        const messageIds = unreadMessages.map(m => m._id.toString());

        if (messageIds.length === 0) {
            return { success: true };
        }

        // Update messages to read
        await Message.updateMany(
            { projectId, isRead: false, sender: MessageSender.ADMIN },
            { isRead: true, readAt: new Date() }
        );

        // Notify via Pusher BEFORE revalidatePath
        try {
            await sendRealtimeMessage(projectId, {
                type: 'read',
                messageIds: messageIds,
            });
        } catch (error) {
            logError(error as Error, { context: 'markMessagesAsRead-pusher' });
        }

        revalidatePath(`/dashboard/projects/${projectId}`);

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'markMessagesAsRead', projectId });
        return { success: false, error: 'Failed to mark messages as read' };
    }
}

// Add reaction to message (client side)
export async function addClientMessageReaction(
    messageId: string,
    emoji: string
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return { success: false, error: 'Invalid message ID' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions?.find(
            r => r.emoji === emoji && r.userId.toString() === user._id.toString()
        );

        if (existingReaction) {
            // Remove reaction if already exists
            message.reactions = message.reactions?.filter(
                r => !(r.emoji === emoji && r.userId.toString() === user._id.toString())
            );
        } else {
            // Add new reaction
            if (!message.reactions) message.reactions = [];
            message.reactions.push({
                emoji,
                userId: user._id,
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                createdAt: new Date()
            } as any);
        }

        await message.save();

        // Serialize reactions to remove MongoDB ObjectIds and prevent circular references
        const serializedReactions = message.reactions?.map(r => ({
            emoji: r.emoji,
            userId: r.userId.toString(),
            userName: r.userName,
            createdAt: r.createdAt.toISOString ? r.createdAt.toISOString() : r.createdAt
        })) || [];

        // Notify via Pusher BEFORE revalidatePath to prevent connection abort
        try {
            await sendRealtimeMessage(message.projectId.toString(), {
                type: 'reaction',
                messageId: message._id.toString(),
                reactions: serializedReactions
            });
        } catch (error) {
            logError(error as Error, { context: 'addClientMessageReaction-pusher' });
        }

        // Revalidate paths after Pusher completes
        revalidatePath(`/dashboard/projects/${message.projectId}`);
        revalidatePath('/admin/messages');

        return { success: true, data: { reactions: serializedReactions } };
    } catch (error) {
        logError(error as Error, { context: 'addClientMessageReaction', messageId });
        return { success: false, error: 'Failed to add reaction' };
    }
}

// Send typing indicator (client side)
export async function sendClientTypingIndicator(
    projectId: string,
    isTyping: boolean
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

        // Send typing indicator via Pusher
        try {
            const { sendTypingIndicator } = await import('@/lib/services/pusher.service');
            await sendTypingIndicator(projectId, user._id.toString(), userName, isTyping);
        } catch (error) {
            logError(error as Error, { context: 'sendClientTypingIndicator-pusher', projectId });
        }

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'sendClientTypingIndicator', projectId });
        return { success: false, error: 'Failed to send typing indicator' };
    }
}

// Reply to a message (threading)
export async function replyToMessage(
    parentMessageId: string,
    projectId: string,
    message: string
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(parentMessageId) || !mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid ID' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Create reply
        const reply = await Message.create({
            projectId,
            userId: user._id,
            clerkUserId,
            sender: MessageSender.CLIENT,
            message: message.trim(),
            parentMessageId: new mongoose.Types.ObjectId(parentMessageId),
            isRead: false,
        });

        // Update parent message with reply reference
        await Message.findByIdAndUpdate(parentMessageId, {
            $push: { threadReplies: reply._id }
        });

        const populatedMessage = await Message.findById(reply._id)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .lean();

        const userPopulated = populatedMessage?.userId as any;
        const project = populatedMessage?.projectId as any;

        const serializedMessage = {
            ...toSerializedObject(reply),
            _id: reply._id.toString(),
            projectId: reply.projectId.toString(),
            userId: reply.userId.toString(),
            parentMessageId: parentMessageId,
            clientName: userPopulated ? `${userPopulated.firstName || ''} ${userPopulated.lastName || ''}`.trim() || userPopulated.email : '',
            clientEmail: userPopulated?.email || '',
            projectName: project?.projectName || '',
        };

        // Trigger real-time notification
        try {
            await sendRealtimeMessage(projectId, {
                ...serializedMessage,
                type: 'reply'
            });
        } catch (error) {
            logError(error as Error, { context: 'replyToMessage-pusher', projectId });
        }

        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath(`/admin/messages`);

        return { success: true, data: serializedMessage };
    } catch (error) {
        logError(error as Error, { context: 'replyToMessage', parentMessageId });
        return { success: false, error: 'Failed to reply to message' };
    }
}

// Edit a message
export async function editMessage(
    messageId: string,
    newMessage: string
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return { success: false, error: 'Invalid message ID' };
        }

        await dbConnect();

        const message = await Message.findById(messageId);
        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        // Verify ownership
        if (message.clerkUserId !== clerkUserId) {
            return { success: false, error: 'Unauthorized to edit this message' };
        }

        // Update message
        message.message = newMessage.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        // Notify via Pusher
        try {
            await sendRealtimeMessage(message.projectId.toString(), {
                type: 'edit',
                messageId: message._id.toString(),
                message: newMessage.trim(),
                isEdited: true,
                editedAt: message.editedAt
            });
        } catch (error) {
            logError(error as Error, { context: 'editMessage-pusher' });
        }

        revalidatePath(`/dashboard/projects/${message.projectId}`);
        revalidatePath('/admin/messages');

        return { success: true, data: toSerializedObject(message) };
    } catch (error) {
        logError(error as Error, { context: 'editMessage', messageId });
        return { success: false, error: 'Failed to edit message' };
    }
}