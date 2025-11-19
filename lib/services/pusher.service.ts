// lib/services/pusher.service.ts
'use server';

import Pusher from 'pusher';
import { logError } from '@/lib/sentry-logger';

let pusherInstance: Pusher | null = null;

function getPusherInstance(): Pusher {
    if (!pusherInstance) {
        if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
            throw new Error('Pusher credentials are required. Add PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET to environment variables.');
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
 * NOTE: Used for real-time messaging only. Pusher credentials are required.
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
        logError(error, { context: 'triggerPusherEvent', channel, event });
        throw error;
    }
}

/**
 * Send real-time message
 */
export async function sendRealtimeMessage(
    projectId: string,
    message: any
): Promise<void> {
    await triggerPusherEvent(
        `project-${projectId}`,
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
    await triggerPusherEvent(
        `project-${projectId}`,
        'typing',
        { userId, userName, isTyping }
    );
}

/**
 * Update online presence
 */
export async function updatePresence(
    projectId: string,
    userId: string,
    userName: string,
    isOnline: boolean
): Promise<void> {
    await triggerPusherEvent(
        `project-${projectId}`,
        'presence',
        { userId, userName, isOnline }
    );
}
