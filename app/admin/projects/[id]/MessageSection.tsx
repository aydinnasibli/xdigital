// app/admin/projects/[id]/MessageSection.tsx
'use client';

import { useState } from 'react';
import { sendAdminMessage } from '@/app/actions/admin/messages';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageSection({
    projectId,
    messages,
}: {
    projectId: string;
    messages: any[];
}) {
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        const result = await sendAdminMessage(projectId, newMessage);

        if (result.success) {
            toast.success('Message sent to client');
            setNewMessage('');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to send message');
        }

        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Messages ({messages.length})
            </h2>

            {/* Message List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                    messages.map((msg: any) => (
                        <div
                            key={msg._id}
                            className={`p-4 rounded-lg ${msg.sender === 'admin'
                                    ? 'bg-blue-50 ml-8'
                                    : 'bg-gray-50 mr-8'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-sm">
                                    {msg.sender === 'admin'
                                        ? 'xDigital Team'
                                        : msg.clientName || 'Client'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(msg.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSend} className="space-y-3">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to the client..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
}