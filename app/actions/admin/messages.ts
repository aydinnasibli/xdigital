// app/actions/admin/messages.ts
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Message, { MessageSender } from '@/models/Message';
import Project from '@/models/Project';
import { requireAdmin, getAdminSession } from '@/lib/auth/admin';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import { sendRealtimeMessage } from '@/lib/services/pusher.service';

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

        // Filter out messages with deleted projects or users
        const serializedMessages = messages
            .filter(msg => {
                const user = msg.userId as any;
                const project = msg.projectId as any;
                // Skip messages where project or user has been deleted
                return user && project && user._id && project._id;
            })
            .map(msg => {
                const user = msg.userId as any;
                const project = msg.projectId as any;

                return {
                    ...toSerializedObject(msg),
                    projectId: {
                        _id: project._id.toString(),
                        projectName: project.projectName,
                    },
                    userId: user._id.toString(),
                    clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                    clientEmail: user.email,
                };
            });

        return { success: true, data: serializedMessages };
    } catch (error) {
        logError(error as Error, { context: 'getAllMessages', filters });
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

        // Get project and user details for Pusher payload
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .lean();

        const user = populatedMessage?.userId as any;
        const proj = populatedMessage?.projectId as any;

        const serializedMessage = {
            ...toSerializedObject(newMessage),
            _id: newMessage._id.toString(),
            projectId: newMessage.projectId.toString(),
            userId: newMessage.userId.toString(),
            clientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '',
            clientEmail: user?.email || '',
            projectName: proj?.projectName || '',
        };

        // Trigger real-time notification via Pusher
        try {
            await sendRealtimeMessage(projectId, serializedMessage);
        } catch (error) {
            // Log but don't fail if Pusher fails (graceful degradation)
            logError(error as Error, { context: 'sendAdminMessage-pusher', projectId });
        }

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/admin/messages`);
        revalidatePath(`/dashboard/projects/${projectId}`); // Also revalidate client view

        return {
            success: true,
            data: serializedMessage,
        };
    } catch (error) {
        logError(error as Error, { context: 'sendAdminMessage', projectId });
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

        // Get project IDs before updating so we can send Pusher events
        const messages = await Message.find({
            _id: { $in: validIds },
            sender: MessageSender.CLIENT
        }).select('projectId').lean();

        const projectIds = [...new Set(messages.map(m => m.projectId.toString()))];

        // Simple update - just set isRead and readAt
        const result = await Message.updateMany(
            { _id: { $in: validIds }, sender: MessageSender.CLIENT },
            { isRead: true, readAt: new Date() }
        );

        // Send Pusher events for each project
        for (const projectId of projectIds) {
            try {
                await sendRealtimeMessage(projectId, {
                    type: 'read',
                    messageIds: validIds
                });
            } catch (error) {
                logError(error as Error, { context: 'markAdminMessagesAsRead-pusher', projectId });
            }
        }

        revalidatePath('/admin/messages');

        return { success: true, data: { marked: result.modifiedCount } };
    } catch (error) {
        logError(error as Error, { context: 'markAdminMessagesAsRead', messageIds });
        return { success: false, error: 'Failed to mark messages as read' };
    }
}

// Get a single message with populated fields
export async function getAdminMessage(messageId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return { success: false, error: 'Invalid message ID' };
        }

        await dbConnect();

        const message = await Message.findById(messageId)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .lean();

        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        const user = message.userId as any;
        const project = message.projectId as any;

        if (!user || !project) {
            return { success: false, error: 'Message has deleted project or user' };
        }

        const serializedMessage = {
            ...toSerializedObject(message),
            projectId: {
                _id: project._id.toString(),
                projectName: project.projectName,
            },
            userId: user._id.toString(),
            clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            clientEmail: user.email,
        };

        return { success: true, data: serializedMessage };
    } catch (error) {
        logError(error as Error, { context: 'getAdminMessage', messageId });
        return { success: false, error: 'Failed to fetch message' };
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
        logError(error as Error, { context: 'getUnreadMessageCount' });
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

        const serializedMessages = messages.map(msg => {
            const user = msg.userId as any;

            return {
                ...toSerializedObject(msg),
                userId: user._id.toString(),
                clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            };
        });

        return { success: true, data: serializedMessages };
    } catch (error) {
        logError(error as Error, { context: 'getAdminProjectMessages', projectId });
        return { success: false, error: 'Failed to fetch project messages' };
    }
}

// Send typing indicator (admin side)
export async function sendAdminTypingIndicator(
    projectId: string,
    isTyping: boolean
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await getAdminSession();
        await dbConnect();

        // Get the admin user from database using Clerk ID
        const User = mongoose.model('User');
        const adminUser = await User.findOne({ clerkId: clerkUserId }).lean();

        if (!adminUser) {
            logError(new Error('Admin user not found'), { context: 'sendAdminTypingIndicator', clerkUserId });
            return { success: false, error: 'Admin user not found' };
        }

        const adminUserName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.email || 'xDigital Team';

        // Send typing indicator via Pusher
        try {
            const { sendTypingIndicator } = await import('@/lib/services/pusher.service');
            await sendTypingIndicator(projectId, adminUser._id.toString(), adminUserName, isTyping);
        } catch (error) {
            logError(error as Error, { context: 'sendAdminTypingIndicator-pusher', projectId });
        }

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'sendAdminTypingIndicator', projectId });
        return { success: false, error: 'Failed to send typing indicator' };
    }
}

// Add reaction to message
export async function addMessageReaction(
    messageId: string,
    emoji: string
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await getAdminSession();

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return { success: false, error: 'Invalid message ID' };
        }

        await dbConnect();

        // Get the admin user from database using Clerk ID
        const User = mongoose.model('User');
        const adminUser = await User.findOne({ clerkId: clerkUserId }).lean();

        if (!adminUser) {
            logError(new Error('Admin user not found in database'), {
                context: 'addMessageReaction',
                clerkUserId
            });
            return { success: false, error: 'Admin user not found' };
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        const adminUserObjectId = adminUser._id;
        const adminUserName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.email || 'xDigital Team';

        // Check if admin already reacted with this emoji
        const existingReaction = message.reactions?.find(
            r => r.emoji === emoji && r.userId.toString() === adminUserObjectId.toString()
        );

        if (existingReaction) {
            // Remove reaction if already exists (toggle off)
            message.reactions = message.reactions?.filter(
                r => !(r.emoji === emoji && r.userId.toString() === adminUserObjectId.toString())
            );
        } else {
            // Add new reaction
            if (!message.reactions) message.reactions = [];
            message.reactions.push({
                emoji,
                userId: adminUserObjectId,
                userName: adminUserName,
                createdAt: new Date()
            } as any);
        }

        await message.save();

        // Serialize reactions to remove MongoDB ObjectIds
        const serializedReactions = message.reactions?.map(r => ({
            emoji: r.emoji,
            userId: r.userId.toString(),
            userName: r.userName,
            createdAt: r.createdAt.toISOString ? r.createdAt.toISOString() : r.createdAt
        })) || [];

        revalidatePath('/admin/messages');
        revalidatePath(`/dashboard/projects/${message.projectId}`);

        // Notify via Pusher
        try {
            await sendRealtimeMessage(message.projectId.toString(), {
                type: 'reaction',
                messageId: message._id.toString(),
                reactions: serializedReactions
            });
        } catch (error) {
            logError(error as Error, { context: 'addMessageReaction-pusher' });
        }

        return { success: true, data: { reactions: serializedReactions } };
    } catch (error) {
        logError(error as Error, { context: 'addMessageReaction', messageId });
        return { success: false, error: 'Failed to add reaction' };
    }
}

// Admin reply to message (threading)
export async function adminReplyToMessage(
    parentMessageId: string,
    projectId: string,
    message: string
): Promise<ActionResponse> {
    try {
        const { userId } = await getAdminSession();
        await dbConnect();

        const project = await mongoose.model('Project').findById(projectId);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        const reply = await Message.create({
            projectId,
            userId: project.userId,
            clerkUserId: userId,
            sender: MessageSender.ADMIN,
            message: message.trim(),
            parentMessageId: new mongoose.Types.ObjectId(parentMessageId),
            isRead: false,
        });

        await Message.findByIdAndUpdate(parentMessageId, {
            $push: { threadReplies: reply._id }
        });

        const populatedMessage = await Message.findById(reply._id)
            .populate('projectId', 'projectName')
            .populate('userId', 'email firstName lastName')
            .lean();

        const user = populatedMessage?.userId as any;
        const proj = populatedMessage?.projectId as any;

        const serializedMessage = {
            _id: reply._id.toString(),
            sender: 'admin',
            message: reply.message,
            createdAt: reply.createdAt.toISOString(),
            isRead: reply.isRead,
            projectId: reply.projectId.toString(),
            userId: reply.userId.toString(),
            parentMessageId: parentMessageId,
            clientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '',
            clientEmail: user?.email || '',
            projectName: proj?.projectName || '',
            reactions: reply.reactions || [],
            threadReplies: [],
            isEdited: false,
            isPinned: false,
        };

        try {
            // Send as regular message, not as type: 'reply'
            // The client will detect it's a reply via parentMessageId
            await sendRealtimeMessage(projectId, serializedMessage);
        } catch (error) {
            logError(error as Error, { context: 'adminReplyToMessage-pusher', projectId });
        }

        revalidatePath(`/admin/messages`);
        revalidatePath(`/dashboard/projects/${projectId}`);

        return { success: true, data: serializedMessage };
    } catch (error) {
        logError(error as Error, { context: 'adminReplyToMessage', parentMessageId });
        return { success: false, error: 'Failed to reply to message' };
    }
}

// Admin edit message
export async function adminEditMessage(
    messageId: string,
    newMessage: string
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return { success: false, error: 'Invalid message ID' };
        }

        await dbConnect();

        const message = await Message.findById(messageId);
        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        // Only allow editing admin messages
        if (message.sender !== MessageSender.ADMIN) {
            return { success: false, error: 'Can only edit admin messages' };
        }

        // Store old message in history
        if (!message.editHistory) message.editHistory = [];
        message.editHistory.push({
            previousMessage: message.message,
            editedAt: new Date()
        } as any);

        message.message = newMessage.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        try {
            await sendRealtimeMessage(message.projectId.toString(), {
                type: 'edit',
                messageId: message._id.toString(),
                message: newMessage.trim(),
                isEdited: true,
                editedAt: message.editedAt
            });
        } catch (error) {
            logError(error as Error, { context: 'adminEditMessage-pusher' });
        }

        revalidatePath('/admin/messages');
        revalidatePath(`/dashboard/projects/${message.projectId}`);

        return { success: true, data: toSerializedObject(message) };
    } catch (error) {
        logError(error as Error, { context: 'adminEditMessage', messageId });
        return { success: false, error: 'Failed to edit message' };
    }
}

// Pin/Unpin message
export async function togglePinMessage(messageId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await getAdminSession();

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return { success: false, error: 'Invalid message ID' };
        }

        await dbConnect();

        // Get the admin user from database using Clerk ID
        const User = mongoose.model('User');
        const adminUser = await User.findOne({ clerkId: clerkUserId }).lean();

        if (!adminUser) {
            logError(new Error('Admin user not found'), { context: 'togglePinMessage', clerkUserId });
            return { success: false, error: 'Admin user not found' };
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        // Toggle pin
        message.isPinned = !message.isPinned;
        message.pinnedAt = message.isPinned ? new Date() : undefined;
        message.pinnedBy = message.isPinned ? adminUser._id : undefined;
        await message.save();

        try {
            await sendRealtimeMessage(message.projectId.toString(), {
                type: 'pin',
                messageId: message._id.toString(),
                isPinned: message.isPinned,
                pinnedAt: message.pinnedAt?.toISOString(),
                pinnedBy: message.pinnedBy
            });
        } catch (error) {
            logError(error as Error, { context: 'togglePinMessage-pusher' });
        }

        revalidatePath('/admin/messages');
        revalidatePath(`/dashboard/projects/${message.projectId}`);

        return { success: true, data: { isPinned: message.isPinned } };
    } catch (error) {
        logError(error as Error, { context: 'togglePinMessage', messageId });
        return { success: false, error: 'Failed to toggle pin' };
    }
}