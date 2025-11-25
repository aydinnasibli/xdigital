// components/notifications/MarkAsReadClient.tsx
'use client';

import { useEffect } from 'react';
import { markAsRead } from '@/app/actions/notifications';

export default function MarkAsReadClient({ notificationId, isRead }: { notificationId: string; isRead: boolean }) {
    useEffect(() => {
        if (!isRead) {
            markAsRead(notificationId);
        }
    }, [notificationId, isRead]);

    return null;
}
