// app/admin/messages/MessagesClient.tsx
'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MessageSquare, Send, Check, CheckCheck, Search, Plus, Smile, Reply, Edit2, Pin, X } from 'lucide-react';
import { sendAdminMessage, markAdminMessagesAsRead, addMessageReaction, sendAdminTypingIndicator, adminReplyToMessage, adminEditMessage, togglePinMessage } from '@/app/actions/admin/messages';
import { toast } from 'sonner';
import { usePusherChannel } from '@/lib/hooks/usePusher';
import { logInfo } from '@/lib/sentry-logger';

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
    reactions?: Array<{
        emoji: string;
        userId: string;
        userName: string;
        createdAt: string;
    }>;
    parentMessageId?: string;
    threadReplies?: string[];
    isEdited?: boolean;
    editedAt?: string;
    editHistory?: Array<{
        previousMessage: string;
        editedAt: string;
    }>;
    isPinned?: boolean;
    pinnedAt?: string;
    pinnedBy?: string;
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

interface TypingIndicator {
    projectId: string;
    userName: string;
    isTyping: boolean;
}

const COMMON_EMOJIS = ['👍', '❤️', '😊', '🎉', '🔥', '👏'];

export default function MessagesClient({ initialMessages, availableProjects }: MessagesClientProps) {
    const [allMessages, setAllMessages] = useState<Message[]>(initialMessages);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map());
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [editText, setEditText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const hasMarkedAsReadRef = useRef<Set<string>>(new Set());

    // Memoize conversation grouping to prevent infinite loops
    const { conversations, projectMap } = useMemo(() => {
        const conversationsArray: Conversation[] = [];
        const map = new Map<string, Conversation>();

        allMessages.forEach(msg => {
            // Safety check for populated fields
            if (!msg.projectId || !msg.projectId._id) {
                console.error('Message missing projectId', msg);
                return;
            }
            const projId = msg.projectId._id;
            if (!map.has(projId)) {
                map.set(projId, {
                    projectId: projId,
                    projectName: msg.projectId.projectName,
                    clientName: msg.clientName,
                    clientEmail: msg.clientEmail,
                    messages: [],
                    unreadCount: 0,
                    lastMessageAt: msg.createdAt,
                });
            }
            const conv = map.get(projId)!;
            conv.messages.push(msg);
            if (!msg.isRead && msg.sender === 'client') {
                conv.unreadCount++;
            }
            if (new Date(msg.createdAt) > new Date(conv.lastMessageAt)) {
                conv.lastMessageAt = msg.createdAt;
            }
        });

        map.forEach(conv => {
            conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            conversationsArray.push(conv);
        });

        // Sort conversations by last message time
        conversationsArray.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        return { conversations: conversationsArray, projectMap: map };
    }, [allMessages]);

    // Filter conversations by search term
    const filteredConversations = useMemo(() =>
        conversations.filter(conv =>
            conv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
        ), [conversations, searchTerm]
    );

    // Get projects that don't have conversations yet
    const projectsWithoutConversations = useMemo(() =>
        availableProjects.filter(proj => !projectMap.has(proj._id)),
        [availableProjects, projectMap]
    );

    // Real-time message handler via Pusher
    const handleNewMessage = useCallback(async (data: any) => {
        logInfo('Admin received new message via Pusher', {
            messageId: data._id,
            sender: data.sender,
            projectId: data.projectId,
            type: data.type
        });

        // Handle read status update
        if (data.type === 'read') {
            setAllMessages(prev => prev.map(msg =>
                data.messageIds.includes(msg._id)
                    ? { ...msg, isRead: true }
                    : msg
            ));
            return;
        }

        // Handle reaction update
        if (data.type === 'reaction') {
            setAllMessages(prev => prev.map(msg =>
                msg._id === data.messageId
                    ? { ...msg, reactions: data.reactions }
                    : msg
            ));
            return;
        }

        // Handle edit update
        if (data.type === 'edit') {
            setAllMessages(prev => prev.map(msg =>
                msg._id === data.messageId
                    ? { ...msg, message: data.message, isEdited: data.isEdited, editedAt: data.editedAt }
                    : msg
            ));
            return;
        }

        // Handle pin update
        if (data.type === 'pin') {
            setAllMessages(prev => prev.map(msg =>
                msg._id === data.messageId
                    ? { ...msg, isPinned: data.isPinned, pinnedAt: data.pinnedAt, pinnedBy: data.pinnedBy }
                    : msg
            ));
            return;
        }

        // Handle reply - update thread replies
        if (data.parentMessageId) {
            setAllMessages(prev => {
                const exists = prev.some(msg => msg._id === data._id);
                if (exists) return prev;

                // Create properly formatted reply message with current timestamp to ensure it's latest
                const newMsg: Message = {
                    _id: data._id,
                    sender: data.sender,
                    message: data.message,
                    createdAt: data.createdAt || new Date().toISOString(),
                    isRead: data.isRead || false,
                    clientName: data.clientName || 'Client',
                    clientEmail: data.clientEmail || '',
                    projectId: {
                        _id: typeof data.projectId === 'string' ? data.projectId : data.projectId._id,
                        projectName: data.projectName || 'Unknown Project',
                    },
                    reactions: data.reactions || [],
                    parentMessageId: data.parentMessageId,
                    threadReplies: [],
                    isEdited: data.isEdited,
                    editedAt: data.editedAt,
                    isPinned: data.isPinned,
                };

                // Update parent's threadReplies and add new message at the end
                const updatedMessages = prev.map(msg =>
                    msg._id === data.parentMessageId
                        ? { ...msg, threadReplies: [...(msg.threadReplies || []), data._id] }
                        : msg
                );

                // Add new message at the end (it will be sorted by useMemo)
                return [...updatedMessages, newMsg];
            });
            return;
        }

        // Add new message
        setAllMessages(prev => {
            const exists = prev.some(msg => msg._id === data._id);
            if (exists) return prev;

            // Create properly formatted message
            const newMsg: Message = {
                _id: data._id,
                sender: data.sender,
                message: data.message,
                createdAt: data.createdAt || new Date().toISOString(),
                isRead: data.isRead || false,
                clientName: data.clientName || 'Client',
                clientEmail: data.clientEmail || '',
                projectId: {
                    _id: typeof data.projectId === 'string' ? data.projectId : data.projectId._id,
                    projectName: data.projectName || 'Unknown Project',
                },
                reactions: data.reactions || [],
                parentMessageId: data.parentMessageId,
                threadReplies: data.threadReplies || [],
                isEdited: data.isEdited,
                editedAt: data.editedAt,
                isPinned: data.isPinned,
            };

            return [...prev, newMsg];
        });

        // Show notification for client messages
        if (data.sender === 'client') {
            toast.info(`New message from ${data.clientName || 'client'}`);
        }
    }, []);

    // Real-time typing indicator handler
    const handleTypingIndicator = useCallback((data: any) => {
        logInfo('Typing indicator received', data);

        setTypingIndicators(prev => {
            const newMap = new Map(prev);
            const key = `${data.projectId}-${data.userId}`;

            if (data.isTyping) {
                newMap.set(key, {
                    projectId: data.projectId,
                    userName: data.userName,
                    isTyping: true,
                });
            } else {
                newMap.delete(key);
            }

            return newMap;
        });
    }, []);

    // Subscribe to global admin Pusher channel
    usePusherChannel('admin-messages', 'new-message', handleNewMessage);
    usePusherChannel('admin-messages', 'typing', handleTypingIndicator);

    // Auto-scroll to bottom when viewing a conversation
    useEffect(() => {
        if (selectedProjectId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedProjectId, allMessages]);

    // Auto-mark messages as read when viewing a conversation
    useEffect(() => {
        if (!selectedProjectId) return;

        const conv = projectMap.get(selectedProjectId);
        if (!conv || conv.unreadCount === 0) return;

        const unreadIds = conv.messages
            .filter(m => !m.isRead && m.sender === 'client')
            .map(m => m._id);

        if (unreadIds.length === 0) return;

        // Check if we've already marked these messages
        const newUnreadIds = unreadIds.filter(id => !hasMarkedAsReadRef.current.has(id));
        if (newUnreadIds.length === 0) return;

        // Mark them in the ref to prevent duplicate calls
        newUnreadIds.forEach(id => hasMarkedAsReadRef.current.add(id));

        markAdminMessagesAsRead(newUnreadIds).then(result => {
            if (result.success) {
                setAllMessages(prev => prev.map(msg =>
                    newUnreadIds.includes(msg._id) ? { ...msg, isRead: true } : msg
                ));
            } else {
                // Remove from ref if failed
                newUnreadIds.forEach(id => hasMarkedAsReadRef.current.delete(id));
            }
        });
    }, [selectedProjectId, projectMap]);

    // Handle typing indicator for admin
    const handleTyping = useCallback(() => {
        if (!selectedProjectId) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Send typing start
        sendAdminTypingIndicator(selectedProjectId, true);

        // Set timeout to clear typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            sendAdminTypingIndicator(selectedProjectId, false);
        }, 3000);
    }, [selectedProjectId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedProjectId || loading) return;

        setLoading(true);

        try {
            // Check if replying
            if (replyingTo) {
                const result = await adminReplyToMessage(replyingTo._id, selectedProjectId, newMessage);
                if (result.success && result.data) {
                    toast.success('Reply sent');
                    setNewMessage('');
                    setReplyingTo(null);
                    // Message will be added via Pusher
                } else {
                    toast.error(result.error || 'Failed to send reply');
                }
            } else {
                const result = await sendAdminMessage(selectedProjectId, newMessage);
                if (result.success && result.data) {
                    toast.success('Message sent');
                    setNewMessage('');
                    // Message will be added via Pusher
                } else {
                    toast.error(result.error || 'Failed to send message');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        setEditingMessage(null);
    };

    const handleEdit = (message: Message) => {
        setEditingMessage(message);
        setEditText(message.message);
        setReplyingTo(null);
    };

    const handleSaveEdit = async () => {
        if (!editingMessage || !editText.trim()) return;

        const result = await adminEditMessage(editingMessage._id, editText);
        if (result.success) {
            toast.success('Message edited');
            setEditingMessage(null);
            setEditText('');
            // Update will come via Pusher
        } else {
            toast.error(result.error || 'Failed to edit message');
        }
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setEditText('');
    };

    const handlePin = async (messageId: string) => {
        try {
            // Optimistic update
            setAllMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, isPinned: !msg.isPinned, pinnedAt: !msg.isPinned ? new Date().toISOString() : undefined }
                    : msg
            ));

            const result = await togglePinMessage(messageId);
            if (result.success) {
                toast.success(result.data?.isPinned ? 'Message pinned' : 'Message unpinned');
            } else {
                // Revert on failure
                setAllMessages(prev => prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, isPinned: !msg.isPinned, pinnedAt: msg.isPinned ? new Date().toISOString() : undefined }
                        : msg
                ));
                toast.error(result.error || 'Failed to toggle pin');
            }
        } catch (error) {
            // Revert on error
            setAllMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, isPinned: !msg.isPinned }
                    : msg
            ));
            toast.error('Failed to toggle pin');
            console.error('Pin error:', error);
        }
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        try {
            setShowEmojiPicker(null);

            const result = await addMessageReaction(messageId, emoji);
            if (!result.success) {
                toast.error(result.error || 'Failed to add reaction');
            }
            // Update will come via Pusher
        } catch (error) {
            toast.error('Failed to add reaction');
            console.error('Reaction error:', error);
        }
    };

    const handleSelectProject = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const handleStartNewConversation = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const selectedConversation = selectedProjectId ? projectMap.get(selectedProjectId) : null;
    const totalUnreadCount = useMemo(() =>
        conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
        [conversations]
    );

    // Get typing indicators for selected project
    const currentTypingIndicators = useMemo(() =>
        selectedProjectId
            ? Array.from(typingIndicators.values()).filter(t => t.projectId === selectedProjectId)
            : [],
        [selectedProjectId, typingIndicators]
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">
                    Real-time communication with clients about their projects
                </p>
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
                            <div className="mt-3 px-3 py-2 bg-orange-50 text-orange-800 rounded-lg text-sm font-medium flex items-center justify-between">
                                <span>{totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}</span>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
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
                                        selectedProjectId === conv.projectId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
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
                                            selectedProjectId === proj._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
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
                                        {/* Pinned Messages Section */}
                                        {selectedConversation.messages.some(m => m.isPinned) && (
                                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Pin className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-sm font-semibold text-yellow-800">Pinned Messages</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {selectedConversation.messages
                                                        .filter(m => m.isPinned)
                                                        .map(msg => (
                                                            <div key={msg._id} className="text-sm text-gray-700 bg-white p-2 rounded">
                                                                <span className="font-semibold">
                                                                    {msg.sender === 'admin' ? 'Admin' : msg.clientName}:
                                                                </span> {msg.message}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Regular Messages */}
                                        {selectedConversation.messages.filter(m => !m.parentMessageId).map((msg) => (
                                            <div key={msg._id} className="space-y-2">
                                                {editingMessage?._id === msg._id ? (
                                                    // Edit Mode
                                                    <div className="flex justify-end">
                                                        <div className="max-w-[70%] bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                            <p className="text-xs font-semibold mb-2 text-gray-600">Editing message</p>
                                                            <textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="w-full border rounded px-2 py-1 text-sm"
                                                                rows={3}
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={handleSaveEdit}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Normal Message Display
                                                    <div
                                                        className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                                msg.sender === 'admin'
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-900'
                                                            } ${msg.isPinned ? 'border-2 border-yellow-400' : ''}`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <p className="text-xs font-semibold opacity-75">
                                                                    {msg.sender === 'admin' ? 'xDigital Team' : msg.clientName}
                                                                </p>
                                                                {msg.isPinned && (
                                                                    <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                                                            {msg.isEdited && (
                                                                <p className="text-xs opacity-60 mt-1">(edited)</p>
                                                            )}

                                                            {/* Reactions */}
                                                            {msg.reactions && msg.reactions.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {msg.reactions.map((reaction, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20"
                                                                            title={reaction.userName}
                                                                        >
                                                                            {reaction.emoji}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex items-center justify-between mt-2 gap-2">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)}
                                                                        className="opacity-50 hover:opacity-100 transition-opacity p-1"
                                                                        title="React"
                                                                    >
                                                                        <Smile className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReply(msg)}
                                                                        className="opacity-50 hover:opacity-100 transition-opacity p-1"
                                                                        title="Reply"
                                                                    >
                                                                        <Reply className="w-3 h-3" />
                                                                    </button>
                                                                    {msg.sender === 'admin' && (
                                                                        <button
                                                                            onClick={() => handleEdit(msg)}
                                                                            className="opacity-50 hover:opacity-100 transition-opacity p-1"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit2 className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handlePin(msg._id)}
                                                                        className={`opacity-50 hover:opacity-100 transition-opacity p-1 ${msg.isPinned ? 'text-yellow-400' : ''}`}
                                                                        title={msg.isPinned ? 'Unpin' : 'Pin'}
                                                                    >
                                                                        <Pin className="w-3 h-3" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex items-center gap-1">
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

                                                            {/* Emoji Picker */}
                                                            {showEmojiPicker === msg._id && (
                                                                <div className="mt-2 flex gap-1 bg-white bg-opacity-20 p-2 rounded">
                                                                    {COMMON_EMOJIS.map((emoji) => (
                                                                        <button
                                                                            key={emoji}
                                                                            onClick={() => handleReaction(msg._id, emoji)}
                                                                            className="hover:scale-125 transition-transform text-lg"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Thread Replies */}
                                                {msg.threadReplies && msg.threadReplies.length > 0 && (
                                                    <div className="ml-12 space-y-2">
                                                        {selectedConversation.messages
                                                            .filter(m => m.parentMessageId === msg._id)
                                                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                            .map(reply => (
                                                                <div
                                                                    key={reply._id}
                                                                    className={`flex ${reply.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                                >
                                                                    <div
                                                                        className={`max-w-[70%] rounded-lg p-2 text-sm ${
                                                                            reply.sender === 'admin'
                                                                                ? 'bg-blue-500 text-white'
                                                                                : 'bg-gray-50 text-gray-900 border border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <p className="text-xs font-semibold mb-1 opacity-75">
                                                                            {reply.sender === 'admin' ? 'xDigital Team' : reply.clientName}
                                                                        </p>
                                                                        <p className="whitespace-pre-wrap break-words">{reply.message}</p>
                                                                        <p className="text-xs opacity-60 mt-1">
                                                                            {new Date(reply.createdAt).toLocaleString('en-US', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
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

                                {/* Typing Indicators */}
                                {currentTypingIndicators.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600">
                                            {currentTypingIndicators[0].userName} is typing
                                            <span className="animate-pulse">...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                {/* Reply Context */}
                                {replyingTo && (
                                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Reply className="w-3 h-3 text-blue-600" />
                                                <span className="text-xs font-semibold text-blue-800">
                                                    Replying to {replyingTo.sender === 'admin' ? 'xDigital Team' : replyingTo.clientName}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 truncate">{replyingTo.message}</p>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
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
                                        {loading ? 'Sending...' : replyingTo ? 'Send Reply' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p>Select a conversation to start messaging</p>
                                <p className="text-sm mt-2">Messages update in real-time</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
