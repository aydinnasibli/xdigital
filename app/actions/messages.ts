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

        return { success: true, data: serializedMessages };
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

        // Simple update - just set isRead and readAt
        await Message.updateMany(
            { projectId, isRead: false, sender: MessageSender.ADMIN },
            { isRead: true, readAt: new Date() }
        );

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

        revalidatePath(`/dashboard/projects/${message.projectId}`);
        revalidatePath('/admin/messages');

        // Notify via Pusher
        try {
            await sendRealtimeMessage(message.projectId.toString(), {
                type: 'reaction',
                messageId: message._id.toString(),
                reactions: message.reactions
            });
        } catch (error) {
            logError(error as Error, { context: 'addClientMessageReaction-pusher' });
        }

        return { success: true, data: { reactions: message.reactions } };
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