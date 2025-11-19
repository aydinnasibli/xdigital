// lib/hooks/usePusher.ts
'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

function getPusherInstance() {
    if (!pusherInstance) {
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

        if (!key) {
            console.error('Pusher key not configured');
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

    useEffect(() => {
        const pusher = getPusherInstance();
        if (!pusher) {
            console.log('Pusher not configured');
            return;
        }

        const channel = pusher.subscribe(channelName);

        channel.bind('pusher:subscription_succeeded', () => {
            setIsConnected(true);
            console.log(`✅ Connected to channel: ${channelName}`);
        });

        channel.bind('pusher:subscription_error', (error: any) => {
            console.error('Pusher subscription error:', error);
        });

        channel.bind(eventName, callback);

        return () => {
            channel.unbind(eventName, callback);
            pusher.unsubscribe(channelName);
        };
    }, [channelName, eventName, callback]);

    return { isConnected };
}
