// app/actions/admin/messages.ts
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Message, { MessageSender } from '@/models/Message';
import Project from '@/models/Project';
import { requireAdmin, getAdminSession } from '@/lib/auth/admin';
import mongoose from 'mongoose';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all messages across all projects
export async function getAllMessages(filters?: {
    projectId?: string;
    clientId?: string;
    unreadOnly?: boolean;
}): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const query: any = {};

        if (filters?.projectId && mongoose.Types.ObjectId.isValid(filters.projectId)) {
            query.projectId = filters.projectId;
        }

        if (filters?.clientId && mongoose.Types.ObjectId.isValid(filters.clientId)) {
            query.userId = filters.clientId;
        }

        if (filters?.unreadOnly) {
            query.isRead = false;
            query.sender = MessageSender.CLIENT; // Only client messages need to be read by admin
        }

        const messages = await Message.find(query)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        const serializedMessages = messages.map(msg => ({
            ...msg,
            _id: msg._id.toString(),
            projectId: {
                _id: msg.projectId._id.toString(),
                projectName: msg.projectId.projectName,
            },
            userId: msg.userId._id.toString(),
            clientName: `${msg.userId.firstName || ''} ${msg.userId.lastName || ''}`.trim() || msg.userId.email,
            clientEmail: msg.userId.email,
        }));

        return { success: true, data: serializedMessages };
    } catch (error) {
        console.error('Error fetching all messages:', error);
        return { success: false, error: 'Failed to fetch messages' };
    }
}

// Send message to client (as admin/xDigital Team)
export async function sendAdminMessage(
    projectId: string,
    message: string
): Promise<ActionResponse> {
    try {
        const { userId } = await getAdminSession();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        if (!message.trim()) {
            return { success: false, error: 'Message cannot be empty' };
        }

        await dbConnect();

        // Get project to find the client userId
        const project = await Project.findById(projectId).lean();
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        const newMessage = await Message.create({
            projectId,
            userId: project.userId, // The client's userId
            clerkUserId: userId, // Admin's clerkId
            sender: MessageSender.ADMIN,
            message: message.trim(),
            isRead: false,
        });

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/admin/messages`);
        revalidatePath(`/dashboard/projects/${projectId}`); // Also revalidate client view

        return {
            success: true,
            data: {
                ...newMessage.toObject(),
                _id: newMessage._id.toString(),
                projectId: newMessage.projectId.toString(),
                userId: newMessage.userId.toString(),
            },
        };
    } catch (error) {
        console.error('Error sending admin message:', error);
        return { success: false, error: 'Failed to send message' };
    }
}

// Mark messages as read (admin reading client messages)
export async function markAdminMessagesAsRead(
    messageIds: string[]
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const validIds = messageIds.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return { success: false, error: 'No valid message IDs provided' };
        }

        await dbConnect();

        await Message.updateMany(
            {
                _id: { $in: validIds },
                sender: MessageSender.CLIENT,
            },
            {
                isRead: true,
                readAt: new Date(),
            }
        );

        revalidatePath('/admin/messages');

        return { success: true, data: { marked: validIds.length } };
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return { success: false, error: 'Failed to mark messages as read' };
    }
}

// Get unread message count for admin
export async function getUnreadMessageCount(): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const count = await Message.countDocuments({
            sender: MessageSender.CLIENT,
            isRead: false,
        });

        return { success: true, data: { count } };
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return { success: false, error: 'Failed to fetch unread count' };
    }
}

// Get messages by project (for admin project view)
export async function getAdminProjectMessages(
    projectId: string
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const messages = await Message.find({ projectId })
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: 1 })
            .lean();

        const serializedMessages = messages.map(msg => ({
            ...msg,
            _id: msg._id.toString(),
            projectId: msg.projectId.toString(),
            userId: msg.userId._id.toString(),
            clientName: `${msg.userId.firstName || ''} ${msg.userId.lastName || ''}`.trim() || msg.userId.email,
        }));

        return { success: true, data: serializedMessages };
    } catch (error) {
        console.error('Error fetching project messages:', error);
        return { success: false, error: 'Failed to fetch project messages' };
    }
}