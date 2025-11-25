// lib/services/notification.service.ts
'use server';

import dbConnect from '@/lib/database/mongodb';
import Notification, { NotificationType } from '@/models/Notification';
import User from '@/models/User';
import { sendEmail } from './email.service';
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
 * Create a notification with email delivery
 * This is the MAIN function to use when you want to notify a user
 * REQUIRES: RESEND_API_KEY to be configured for email notifications
 * NOTE: Pusher is reserved for real-time messaging only, not notifications
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

