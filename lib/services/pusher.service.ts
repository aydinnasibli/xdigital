// lib/services/pusher.service.ts
'use server';

import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;

function getPusherInstance(): Pusher | null {
    if (!pusherInstance) {
        if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
            console.warn('Pusher credentials not configured. Real-time messaging features will be disabled. Add PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET to environment variables to enable.');
            return null;
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
 * NOTE: Pusher is OPTIONAL. If not configured, real-time features will be disabled but the app will still work.
 * Real-time messaging is used for instant message delivery in the messaging system.
 */
export async function triggerPusherEvent(
    channel: string,
    event: string,
    data: any
): Promise<void> {
    try {
        const pusher = getPusherInstance();
        if (!pusher) {
            // Pusher not configured - this is OK, just means no real-time updates
            // Messages will still be saved to database and visible on refresh
            return;
        }
        await pusher.trigger(channel, event, data);
    } catch (error) {
        // Log but don't throw - we don't want Pusher errors to break the app
        console.error('Pusher trigger error (non-fatal):', error);
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
