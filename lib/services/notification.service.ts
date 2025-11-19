// lib/services/notification.service.ts
'use server';

import dbConnect from '@/lib/database/mongodb';
import Notification, { NotificationType } from '@/models/Notification';
import User from '@/models/User';
import { sendEmail } from './email.service';
import { triggerPusherEvent } from './pusher.service';
import { logError } from '@/lib/sentry-logger';

interface CreateNotificationParams {
    userId: string; // Clerk user ID
    projectId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    sendEmail?: boolean;
    emailSubject?: string;
}

/**
 * Create a notification with email and real-time delivery
 * This is the MAIN function to use when you want to notify a user
 * REQUIRES: PUSHER credentials and RESEND_API_KEY to be configured
 */
export async function createNotification(params: CreateNotificationParams): Promise<{success: boolean; error?: string}> {
    try {
        await dbConnect();

        // Get user from database
        const user = await User.findOne({ clerkId: params.userId });
        if (!user) {
            logError('User not found', {
                context: 'createNotification',
                userId: params.userId,
                type: params.type
            });
            return { success: false, error: 'User not found' };
        }

        // Create notification in database
        const notification = await Notification.create({
            userId: user._id,
            clerkUserId: params.userId,
            projectId: params.projectId || undefined,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link,
            isRead: false,
        });

        // Trigger Pusher event for real-time notification delivery
        await triggerPusherEvent(params.userId, 'new-notification', {
            notificationId: notification._id.toString(),
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link,
        });

        // Send email if requested and user has email
        if (params.sendEmail && user.email) {
            await sendEmail({
                to: user.email,
                subject: params.emailSubject || params.title,
                html: `
                    <h2>${params.title}</h2>
                    <p>${params.message}</p>
                    ${params.link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}${params.link}">View Details</a></p>` : ''}
                `,
            });
        }

        return { success: true };
    } catch (error) {
        logError(error as Error, {
            context: 'createNotification',
            userId: params.userId,
            projectId: params.projectId,
            type: params.type,
            title: params.title
        });
        return { success: false, error: 'Failed to create notification' };
    }
}

/**
 * Bulk create notifications for multiple users
 */
export async function createNotifications(params: Omit<CreateNotificationParams, 'userId'> & { userIds: string[] }) {
    const promises = params.userIds.map(userId =>
        createNotification({
            ...params,
            userId,
        })
    );

    await Promise.allSettled(promises);
}

/**
 * Helper functions for common notification types
 */

export async function notifyProjectUpdate(userId: string, projectId: string, projectName: string, updateMessage: string) {
    return createNotification({
        userId,
        projectId,
        type: NotificationType.PROJECT_UPDATE,
        title: `Project Update: ${projectName}`,
        message: updateMessage,
        link: `/dashboard/projects/${projectId}`,
        sendEmail: true,
        emailSubject: `Project Update: ${projectName}`,
    });
}

export async function notifyNewInvoice(userId: string, projectId: string, invoiceNumber: string, amount: number) {
    return createNotification({
        userId,
        projectId,
        type: NotificationType.INVOICE,
        title: 'New Invoice',
        message: `Invoice ${invoiceNumber} for $${amount} has been created`,
        link: `/dashboard/projects/${projectId}`,
        sendEmail: true,
        emailSubject: `New Invoice: ${invoiceNumber}`,
    });
}

export async function notifyMilestoneCompleted(userId: string, projectId: string, milestoneName: string) {
    return createNotification({
        userId,
        projectId,
        type: NotificationType.MILESTONE,
        title: 'Milestone Completed',
        message: `${milestoneName} has been completed`,
        link: `/dashboard/projects/${projectId}`,
        sendEmail: false, // Don't email for milestone completions
    });
}

export async function notifyNewMessage(userId: string, projectId: string, senderName: string) {
    return createNotification({
        userId,
        projectId,
        type: NotificationType.MESSAGE,
        title: 'New Message',
        message: `${senderName} sent you a message`,
        link: `/dashboard/projects/${projectId}`,
        sendEmail: false, // Messages handled by Pusher real-time
    });
}
