// components/notifications/NotificationCenter.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string;
    type: 'project_update' | 'message' | 'invoice' | 'milestone' | 'general';
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: Date;
}

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
}

const typeConfig = {
    project_update: { icon: '📁', color: 'bg-blue-100 text-blue-600' },
    message: { icon: '💬', color: 'bg-green-100 text-green-600' },
    invoice: { icon: '💰', color: 'bg-purple-100 text-purple-600' },
    milestone: { icon: '🎯', color: 'bg-orange-100 text-orange-600' },
    general: { icon: '📢', color: 'bg-gray-100 text-gray-600' },
};

export function NotificationCenter({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationCenterProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const router = useRouter();

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' ? true : !n.isRead
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = (notification: Notification) => {
        if (onMarkAsRead && !notification.isRead) {
            onMarkAsRead(notification._id);
        }

        if (notification.link) {
            router.push(notification.link);
        }
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            {/* Header */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded text-sm ${
                            filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 rounded text-sm ${
                            filter === 'unread'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                    {unreadCount > 0 && onMarkAllAsRead && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <p>No notifications</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredNotifications.map((notification) => {
                            const config = typeConfig[notification.type];

                            return (
                                <button
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                        !notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-lg`}>
                                            {config.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-medium ${
                                                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Notification Bell Icon Component
interface NotificationBellProps {
    unreadCount: number;
    onClick: () => void;
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
    return (
        <button
            onClick={onClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}
