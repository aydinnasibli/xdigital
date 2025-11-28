// lib/services/pusher.service.ts
'use server';

import Pusher from 'pusher';
import { logError } from '@/lib/monitoring/sentry';

let pusherInstance: Pusher | null = null;

function getPusherInstance(): Pusher {
    if (!pusherInstance) {
        if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
            throw new Error('Pusher credentials not configured. Add PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET to environment variables');
        }

        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER || 'us2',
            useTLS: true,
        });
    }

    return pusherInstance;
}

/**
 * Trigger a Pusher event
 */
export async function triggerPusherEvent(
    channel: string,
    event: string,
    data: any
): Promise<void> {
    try {
        const pusher = getPusherInstance();
        await pusher.trigger(channel, event, data);
    } catch (error) {
        logError(error as Error, {
            context: 'triggerPusherEvent',
            channel,
            event,
            dataKeys: data ? Object.keys(data) : []
        });
        throw error;
    }
}

/**
 * Send real-time message to both project channel and global admin channel
 */
export async function sendRealtimeMessage(
    projectId: string,
    message: any
): Promise<void> {
    // Send to project-specific channel (for clients viewing that project)
    await triggerPusherEvent(
        `project-${projectId}`,
        'new-message',
        message
    );

    // Also send to global admin channel (for admin dashboard)
    await triggerPusherEvent(
        'admin-messages',
        'new-message',
        message
    );
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(
    projectId: string,
    userId: string,
    userName: string,
    isTyping: boolean
): Promise<void> {
    const data = { projectId, userId, userName, isTyping };

    // Send to project channel
    await triggerPusherEvent(
        `project-${projectId}`,
        'typing',
        data
    );

    // Also send to admin channel
    await triggerPusherEvent(
        'admin-messages',
        'typing',
        data
    );
}
