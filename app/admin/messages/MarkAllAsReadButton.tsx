// app/admin/messages/MarkAllAsReadButton.tsx
'use client';

import { useState } from 'react';
import { markAdminMessagesAsRead } from '@/app/actions/admin/messages';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCheck } from 'lucide-react';

interface MarkAllAsReadButtonProps {
    messageIds: string[];
}

export default function MarkAllAsReadButton({ messageIds }: MarkAllAsReadButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMarkAllAsRead = async () => {
        if (messageIds.length === 0) {
            toast.info('No unread messages to mark');
            return;
        }

        setLoading(true);
        const result = await markAdminMessagesAsRead(messageIds);

        if (result.success) {
            toast.success(`Marked ${messageIds.length} messages as read`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to mark messages as read');
        }

        setLoading(false);
    };

    if (messageIds.length === 0) {
        return null;
    }

    return (
        <button
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
            <CheckCheck className="w-4 h-4" />
            {loading ? 'Marking...' : `Mark All as Read (${messageIds.length})`}
        </button>
    );
}
