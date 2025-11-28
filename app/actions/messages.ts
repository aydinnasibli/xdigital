'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Message, { MessageSender } from '@/models/Message';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/monitoring/sentry';
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

        // Security: Verify user owns this project
        const ProjectModel = (await import('@/models/Project')).default;
        const userProject = await ProjectModel.findOne({
            _id: projectId,
            userId: user._id
        });

        if (!userProject) {
            return { success: false, error: 'Project not found or access denied' };
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

        // Input validation: Check message length
        if (message.trim().length > 5000) {
            return { success: false, error: 'Message too long (max 5000 characters)' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Security: Verify user owns this project before allowing message send
        const ProjectModel = (await import('@/models/Project')).default;
        const userProject = await ProjectModel.findOne({
            _id: projectId,
            userId: user._id
        });

        if (!userProject) {
            return { success: false, error: 'Project not found or access denied' };
        }

        const newMessage = await Message.create({
            projectId,
            userId: user._id,
            clerkUserId,
            sender: MessageSender.CLIENT,
            message: message.trim(),
        });

        // Get project details for Pusher payload
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .lean();

        const userPopulated = populatedMessage?.userId as any;
        const project = populatedMessage?.projectId as any;

        const serializedMessage = {
            ...toSerializedObject(populatedMessage),
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

// Removed - read receipts disabled

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

        // Input validation: Validate emoji (should be short, typically 1-4 characters)
        if (!emoji || emoji.length > 10) {
            return { success: false, error: 'Invalid emoji' };
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

        // Security: Verify user owns the project this message belongs to
        const ProjectModel = (await import('@/models/Project')).default;
        const userProject = await ProjectModel.findOne({
            _id: message.projectId,
            userId: user._id
        });

        if (!userProject) {
            return { success: false, error: 'Access denied' };
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

        // Serialize reactions using utility
        const serializedReactions = message.reactions ? toSerializedObject(message.reactions) : [];

        // Notify via Pusher BEFORE revalidatePath to prevent connection abort
        try {
            const messageId = message._id;
            const projectId = message.projectId;
            await sendRealtimeMessage(toSerializedObject(projectId), {
                type: 'reaction',
                messageId: toSerializedObject(messageId),
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

        // Input validation
        if (!message.trim()) {
            return { success: false, error: 'Message cannot be empty' };
        }

        if (message.trim().length > 5000) {
            return { success: false, error: 'Message too long (max 5000 characters)' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Security: Verify user owns this project before allowing reply
        const ProjectModel = (await import('@/models/Project')).default;
        const userProject = await ProjectModel.findOne({
            _id: projectId,
            userId: user._id
        });

        if (!userProject) {
            return { success: false, error: 'Project not found or access denied' };
        }

        // Create reply
        const reply = await Message.create({
            projectId,
            userId: user._id,
            clerkUserId,
            sender: MessageSender.CLIENT,
            message: message.trim(),
            parentMessageId: new mongoose.Types.ObjectId(parentMessageId),
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
            ...toSerializedObject(populatedMessage),
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

        // Input validation
        if (!newMessage.trim()) {
            return { success: false, error: 'Message cannot be empty' };
        }

        if (newMessage.trim().length > 5000) {
            return { success: false, error: 'Message too long (max 5000 characters)' };
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