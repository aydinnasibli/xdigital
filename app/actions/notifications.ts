'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { createNotification as createNotificationService } from '@/lib/services/notification.service';
import { NotificationType } from '@/models/Notification';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Export createNotification for use in other actions
export async function createNotification(params: {
    userId: string;
    projectId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    sendEmail?: boolean;
    emailSubject?: string;
}): Promise<ActionResponse> {
    return createNotificationService(params);
}

// Get all notifications for current user
export async function getNotifications(): Promise<ActionResponse> {
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

        const notifications = await Notification.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const serializedNotifications = notifications.map(notif => ({
            ...notif,
            _id: notif._id.toString(),
            userId: notif.userId.toString(),
            projectId: notif.projectId?.toString(),
        }));

        return { success: true, data: serializedNotifications };
    } catch (error) {
        logError(error as Error, { context: 'getNotifications' });
        return { success: false, error: 'Failed to fetch notifications' };
    }
}

// Get unread notification count
export async function getUnreadCount(): Promise<ActionResponse> {
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

        const count = await Notification.countDocuments({
            userId: user._id,
            isRead: false,
        });

        return { success: true, data: { count } };
    } catch (error) {
        logError(error as Error, { context: 'getUnreadCount' });
        return { success: false, error: 'Failed to fetch unread count' };
    }
}

// Mark notification as read
export async function markAsRead(notificationId: string): Promise<ActionResponse> {
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

        await Notification.findOneAndUpdate(
            { _id: notificationId, userId: user._id },
            { isRead: true, readAt: new Date() }
        );

        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'markAsRead', notificationId });
        return { success: false, error: 'Failed to mark as read' };
    }
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<ActionResponse> {
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

        await Notification.updateMany(
            { userId: user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'markAllAsRead' });
        return { success: false, error: 'Failed to mark all as read' };
    }
}