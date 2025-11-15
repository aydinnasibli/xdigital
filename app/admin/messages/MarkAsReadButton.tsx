// app/admin/messages/MarkAsReadButton.tsx
'use client';

import { useState } from 'react';
import { markAdminMessagesAsRead } from '@/app/actions/admin/messages';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export default function MarkAsReadButton({ messageId }: { messageId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMarkAsRead = async () => {
        setLoading(true);
        const result = await markAdminMessagesAsRead([messageId]);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error || 'Failed to mark as read');
        }

        setLoading(false);
    };

    return (
        <button
            onClick={handleMarkAsRead}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
            <Check className="w-4 h-4" />
            {loading ? 'Marking...' : 'Mark Read'}
        </button>
    );
}