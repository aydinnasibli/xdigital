'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Message, { MessageSender } from '@/models/Message';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

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

        const serializedMessages = messages.map(msg => ({
            ...msg,
            _id: msg._id.toString(),
            projectId: msg.projectId.toString(),
            userId: msg.userId.toString(),
        }));

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

        revalidatePath(`/dashboard/projects/${projectId}`);

        return {
            success: true,
            data: {
                ...toSerializedObject(newMessage),
                _id: newMessage._id.toString(),
                projectId: newMessage.projectId.toString(),
                userId: newMessage.userId.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'sendMessage', projectId });
        return { success: false, error: 'Failed to send message' };
    }
}

// Mark messages as read
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