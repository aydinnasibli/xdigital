// app/admin/messages/MessagesClient.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MessageSquare, Send, Check, CheckCheck, Search, Plus, RefreshCw } from 'lucide-react';
import { sendAdminMessage, markAdminMessagesAsRead } from '@/app/actions/admin/messages';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

interface Project {
    _id: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
}

interface MessagesClientProps {
    initialMessages: Message[];
    availableProjects: Project[];
}

interface Conversation {
    projectId: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
    messages: Message[];
    unreadCount: number;
    lastMessageAt: string;
}

export default function MessagesClient({ initialMessages, availableProjects }: MessagesClientProps) {
    const [allMessages, setAllMessages] = useState<Message[]>(initialMessages);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 1000);
    }, [router]);

    // Update messages when initial messages change (after refresh)
    useEffect(() => {
        setAllMessages(initialMessages);
    }, [initialMessages]);

    // Group messages by project to create conversations
    const conversations: Conversation[] = [];
    const projectMap = new Map<string, Conversation>();

    allMessages.forEach(msg => {
        // Safety check for populated fields
        if (!msg.projectId || !msg.projectId._id) {
            console.error('Message missing projectId', msg);
            return;
        }
        const projId = msg.projectId._id;
        if (!projectMap.has(projId)) {
            projectMap.set(projId, {
                projectId: projId,
                projectName: msg.projectId.projectName,
                clientName: msg.clientName,
                clientEmail: msg.clientEmail,
                messages: [],
                unreadCount: 0,
                lastMessageAt: msg.createdAt,
            });
        }
        const conv = projectMap.get(projId)!;
        conv.messages.push(msg);
        if (!msg.isRead && msg.sender === 'client') {
            conv.unreadCount++;
        }
        if (new Date(msg.createdAt) > new Date(conv.lastMessageAt)) {
            conv.lastMessageAt = msg.createdAt;
        }
    });

    projectMap.forEach(conv => {
        conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        conversations.push(conv);
    });

    // Sort conversations by last message time
    conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    // Filter conversations by search term
    const filteredConversations = conversations.filter(conv =>
        conv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get projects that don't have conversations yet
    const projectsWithoutConversations = availableProjects.filter(
        proj => !projectMap.has(proj._id)
    );

    // For now, we'll rely on page revalidation for new messages
    // TODO: Implement a global admin Pusher channel for real-time updates across all projects
    // This would require backend changes to create an "admin-messages" channel

    useEffect(() => {
        // Auto-scroll to bottom when viewing a conversation
        if (selectedProjectId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedProjectId, allMessages]);

    // Auto-mark messages as read when viewing a conversation
    useEffect(() => {
        if (selectedProjectId) {
            const conv = projectMap.get(selectedProjectId);
            if (conv && conv.unreadCount > 0) {
                const unreadIds = conv.messages
                    .filter(m => !m.isRead && m.sender === 'client')
                    .map(m => m._id);

                if (unreadIds.length > 0) {
                    markAdminMessagesAsRead(unreadIds).then(result => {
                        if (result.success) {
                            setAllMessages(prev => prev.map(msg =>
                                unreadIds.includes(msg._id) ? { ...msg, isRead: true } : msg
                            ));
                        }
                    });
                }
            }
        }
    }, [selectedProjectId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedProjectId || loading) return;

        setLoading(true);
        const result = await sendAdminMessage(selectedProjectId, newMessage);

        if (result.success && result.data) {
            toast.success('Message sent');

            // Add message optimistically
            const newMsg: Message = {
                _id: result.data._id,
                sender: 'admin',
                message: result.data.message,
                createdAt: result.data.createdAt,
                isRead: false,
                clientName: projectMap.get(selectedProjectId)?.clientName || '',
                clientEmail: projectMap.get(selectedProjectId)?.clientEmail || '',
                projectId: {
                    _id: selectedProjectId,
                    projectName: projectMap.get(selectedProjectId)?.projectName || '',
                },
            };

            setAllMessages(prev => {
                const exists = prev.some(msg => msg._id === newMsg._id);
                if (exists) return prev;
                return [...prev, newMsg];
            });

            setNewMessage('');
        } else {
            toast.error(result.error || 'Failed to send message');
        }

        setLoading(false);
    };

    const handleSelectProject = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const handleStartNewConversation = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const selectedConversation = selectedProjectId ? projectMap.get(selectedProjectId) : null;
    const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600 mt-2">
                        Communicate with clients about their projects
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {totalUnreadCount > 0 && (
                            <div className="mt-3 px-3 py-2 bg-orange-50 text-orange-800 rounded-lg text-sm">
                                {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[600px]">
                        {/* Existing Conversations */}
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.projectId}
                                    onClick={() => handleSelectProject(conv.projectId)}
                                    className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                        selectedProjectId === conv.projectId ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-semibold text-gray-900 truncate">{conv.projectName}</p>
                                        {conv.unreadCount > 0 && (
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{conv.clientName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(conv.lastMessageAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No conversations found
                            </div>
                        )}

                        {/* Projects without conversations */}
                        {projectsWithoutConversations.length > 0 && (
                            <div className="border-t-2 border-gray-300 mt-2">
                                <div className="p-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Start New Conversation</p>
                                </div>
                                {projectsWithoutConversations.map((proj) => (
                                    <button
                                        key={proj._id}
                                        onClick={() => handleStartNewConversation(proj._id)}
                                        className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                            selectedProjectId === proj._id ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Plus className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 truncate">{proj.projectName}</p>
                                                <p className="text-sm text-gray-600 truncate">{proj.clientName}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation View */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col" style={{ height: '700px' }}>
                    {selectedProjectId ? (
                        <>
                            {/* Conversation Header */}
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selectedConversation?.projectName || 'New Conversation'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {selectedConversation?.clientName} • {selectedConversation?.clientEmail}
                                </p>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {selectedConversation && selectedConversation.messages.length > 0 ? (
                                    <>
                                        {selectedConversation.messages.map((msg) => (
                                            <div
                                                key={msg._id}
                                                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-3 ${
                                                        msg.sender === 'admin'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                                >
                                                    <p className="text-xs font-semibold mb-1 opacity-75">
                                                        {msg.sender === 'admin' ? 'xDigital Team' : msg.clientName}
                                                    </p>
                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <span className="text-xs opacity-75">
                                                            {new Date(msg.createdAt).toLocaleString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {msg.sender === 'admin' && (
                                                            <span title={msg.isRead ? 'Read' : 'Sent'}>
                                                                {msg.isRead ? (
                                                                    <CheckCheck className="w-4 h-4" />
                                                                ) : (
                                                                    <Check className="w-4 h-4" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={loading}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
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
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p>Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
