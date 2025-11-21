// lib/hooks/usePusher.ts
'use client';

import { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import * as Sentry from '@sentry/nextjs';

let pusherInstance: Pusher | null = null;

function getPusherInstance() {
    if (!pusherInstance) {
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

        if (!key) {
            Sentry.captureMessage('Pusher key not configured', { level: 'warning', tags: { context: 'pusherSetup' } });
            return null;
        }

        pusherInstance = new Pusher(key, {
            cluster,
        });
    }
    return pusherInstance;
}

export function usePusherChannel(channelName: string, eventName: string, callback: (data: any) => void) {
    const [isConnected, setIsConnected] = useState(false);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes (without re-subscribing)
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const pusher = getPusherInstance();
        if (!pusher) {
            // Pusher not configured - silently skip (already logged in getPusherInstance)
            return;
        }

        const channel = pusher.subscribe(channelName);

        channel.bind('pusher:subscription_succeeded', () => {
            setIsConnected(true);
            // Successfully connected to Pusher channel
        });

        channel.bind('pusher:subscription_error', (error: any) => {
            Sentry.captureException(error, { tags: { context: 'pusherSubscription', channelName } });
        });

        // Use wrapper function that calls the ref
        const eventHandler = (data: any) => {
            callbackRef.current(data);
        };

        channel.bind(eventName, eventHandler);

        return () => {
            channel.unbind(eventName, eventHandler);
            pusher.unsubscribe(channelName);
        };
    }, [channelName, eventName]); // Removed callback from dependencies

    return { isConnected };
}
