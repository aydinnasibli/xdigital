// app/admin/messages/MessagesClient.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ExternalLink, AlertCircle, CheckCheck } from 'lucide-react';
import MarkAsReadButton from './MarkAsReadButton';
import MarkAllAsReadButton from './MarkAllAsReadButton';
import { usePusherChannel } from '@/lib/hooks/usePusher';
import { logInfo } from '@/lib/sentry-logger';
import { toast } from 'sonner';

interface Message {
    _id: string;
    sender: 'client' | 'admin';
    message: string;
    createdAt: string;
    isRead: boolean;
    clientName: string;
    clientEmail: string;
    projectId: {
        _id: string;
        projectName: string;
    };
}

interface MessagesClientProps {
    initialMessages: Message[];
    unreadOnly: boolean;
}

export default function MessagesClient({ initialMessages, unreadOnly }: MessagesClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [allMessages, setAllMessages] = useState<Message[]>(initialMessages);

    // Listen to all project channels for new messages
    const handleNewMessage = useCallback((data: any) => {
        logInfo('Admin messages page received new message via Pusher', {
            messageId: data._id,
            sender: data.sender,
            projectId: data.projectId
        });

        // Add new message to the list
        setAllMessages(prev => {
            const exists = prev.some(msg => msg._id === data._id);
            if (exists) return prev;

            // We need to fetch updated message with populated fields
            // For now, just refresh or add basic info
            return [data, ...prev];
        });

        // Show toast for new client messages
        if (data.sender === 'client') {
            toast.info('New message from client');
        }
    }, []);

    // Subscribe to a global admin channel (we'll need to update backend to support this)
    // For now, we'll rely on the periodic refresh or manual refresh
    // TODO: Implement global admin Pusher channel for all messages

    // Filter messages based on unreadOnly
    useEffect(() => {
        if (unreadOnly) {
            setMessages(allMessages.filter(msg => !msg.isRead && msg.sender === 'client'));
        } else {
            setMessages(allMessages);
        }
    }, [unreadOnly, allMessages]);

    const unreadCount = allMessages.filter((msg) => !msg.isRead && msg.sender === 'client').length;
    const unreadMessageIds = allMessages
        .filter((msg) => !msg.isRead && msg.sender === 'client')
        .map((msg) => msg._id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600 mt-2">
                        Unified inbox for all client communications
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <>
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">{unreadCount} unread messages</span>
                            </div>
                            <MarkAllAsReadButton messageIds={unreadMessageIds} />
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex gap-4">
                    <Link
                        href="/admin/messages"
                        className={`px-4 py-2 rounded-lg transition-colors ${!unreadOnly
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All Messages ({allMessages.length})
                    </Link>
                    <Link
                        href="/admin/messages?unreadOnly=true"
                        className={`px-4 py-2 rounded-lg transition-colors ${unreadOnly
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Unread Only ({unreadCount})
                    </Link>
                </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {messages.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No messages found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {messages.map((message) => (
                            <MessageRow key={message._id} message={message} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MessageRow({ message }: { message: Message }) {
    const isUnread = !message.isRead && message.sender === 'client';
    const isFromClient = message.sender === 'client';

    return (
        <div
            className={`p-6 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isFromClient ? 'bg-gray-200' : 'bg-blue-200'
                                }`}
                        >
                            <span className="text-sm font-semibold text-gray-700">
                                {isFromClient
                                    ? message.clientName.charAt(0).toUpperCase()
                                    : 'X'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">
                                    {isFromClient ? message.clientName : 'xDigital Team'}
                                </p>
                                {isUnread && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white">
                                        New
                                    </span>
                                )}
                                {!isFromClient && message.isRead && (
                                    <CheckCheck className="w-4 h-4 text-blue-500" title="Read by client" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{message.clientEmail}</span>
                                <span>•</span>
                                <span>{new Date(message.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="ml-13">
                        <p className="text-sm text-gray-600 mb-2">
                            Project:{' '}
                            <Link
                                href={`/admin/projects/${message.projectId._id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {message.projectId.projectName}
                            </Link>
                        </p>
                        <p className="text-gray-900 whitespace-pre-wrap">{message.message}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Link
                        href={`/admin/projects/${message.projectId._id}`}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Project
                    </Link>
                    {isUnread && <MarkAsReadButton messageId={message._id} />}
                </div>
            </div>
        </div>
    );
}
