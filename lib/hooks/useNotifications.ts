// lib/hooks/useNotifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUnreadCount, getNotifications } from '@/app/actions/notifications';

/**
 * Hook to poll for notifications every 30 seconds
 * Returns unread count and triggers toast for new notifications
 */
export function useNotificationPolling(intervalMs: number = 30000) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isPolling, setIsPolling] = useState(false);

    const pollUnreadCount = useCallback(async () => {
        try {
            const result = await getUnreadCount();
            if (result.success && result.data) {
                const newCount = result.data.count;

                // If count increased, we have new notifications
                if (newCount > unreadCount && unreadCount > 0) {
                    // New notification received
                    const difference = newCount - unreadCount;
                    console.log(`📬 ${difference} new notification(s) received`);
                }

                setUnreadCount(newCount);
            }
        } catch (error) {
            console.error('Error polling notifications:', error);
        }
    }, [unreadCount]);

    useEffect(() => {
        // Initial fetch
        pollUnreadCount();
        setIsPolling(true);

        // Set up polling interval
        const interval = setInterval(() => {
            pollUnreadCount();
        }, intervalMs);

        return () => {
            clearInterval(interval);
            setIsPolling(false);
        };
    }, [intervalMs, pollUnreadCount]);

    return {
        unreadCount,
        isPolling,
        refresh: pollUnreadCount,
    };
}

/**
 * Hook to fetch all notifications
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getNotifications();
            if (result.success && result.data) {
                setNotifications(result.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        refresh: fetchNotifications,
    };
}
