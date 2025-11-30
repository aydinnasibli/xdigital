// app/admin/projects/[id]/MessageSection.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { sendAdminMessage } from '@/app/actions/admin/messages';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { usePusherChannel } from '@/lib/hooks/usePusher';
import { logInfo, logWarning } from '@/lib/monitoring/sentry';

interface Message {
    _id: string;
    sender: 'client' | 'admin';
    message: string;
    createdAt: string;
    clientName?: string;
}

export default function MessageSection({
    projectId,
    messages: initialMessages,
}: {
    projectId: string;
    messages: any[];
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper function to deduplicate messages and ensure unique IDs
    const deduplicateMessages = useCallback((messageList: Message[]): Message[] => {
        const uniqueMessages = new Map<string, Message>();
        messageList.forEach(msg => {
            if (!uniqueMessages.has(msg._id)) {
                uniqueMessages.set(msg._id, msg);
            }
        });
        return Array.from(uniqueMessages.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, []);

    // Real-time message listener via Pusher
    const handleNewMessage = useCallback((data: any) => {
        logInfo('Admin received new message via Pusher', {
            messageId: data._id,
            sender: data.sender,
            projectId
        });

        setMessages(prev => {
            const exists = prev.some(msg => msg._id === data._id);
            if (exists) {
                logInfo('Duplicate message detected and prevented', {
                    messageId: data._id,
                    projectId
                });
                return prev;
            }

            const updatedMessages = [...prev, {
                _id: data._id,
                sender: data.sender,
                message: data.message,
                createdAt: data.createdAt,
                clientName: data.clientName,
            }];
            return deduplicateMessages(updatedMessages);
        });

        // Show toast if message is from client
        if (data.sender === 'client') {
            toast.info('New message from client');
        }
    }, [deduplicateMessages, projectId]);

    // Subscribe to Pusher channel for real-time updates
    usePusherChannel(`project-${projectId}`, 'new-message', handleNewMessage);

    // Update messages when initialMessages change
    useEffect(() => {
        setMessages(deduplicateMessages(initialMessages || []));
    }, [initialMessages, deduplicateMessages]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        const result = await sendAdminMessage(projectId, newMessage);

        if (result.success && result.data) {
            toast.success('Message sent to client');
            // Optimistically add message (deduplication will handle Pusher broadcast)
            setMessages(prev => {
                const exists = prev.some(msg => msg._id === result.data._id);
                if (exists) {
                    logWarning('Duplicate message after send', {
                        messageId: result.data._id,
                        projectId
                    });
                    return prev;
                }
                const updatedMessages = [...prev, {
                    _id: result.data._id,
                    sender: result.data.sender,
                    message: result.data.message,
                    createdAt: result.data.createdAt,
                }];
                return deduplicateMessages(updatedMessages);
            });
            setNewMessage('');
        } else {
            toast.error(result.error || 'Failed to send message');
        }

        setLoading(false);
    };

    return (
        <div className="bg-black/40 backdrop-blur-xl rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
                Messages ({messages.length})
            </h2>

            {/* Message List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`p-4 rounded-lg ${msg.sender === 'admin'
                                    ? 'bg-blue-50 ml-8'
                                    : 'bg-white/5 mr-8'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-sm">
                                        {msg.sender === 'admin'
                                            ? 'xDigital Team'
                                            : msg.clientName || 'Client'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {new Date(msg.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSend} className="space-y-3">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to the client..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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