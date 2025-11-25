'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        const result = await getNotifications();
        if (result.success && result.data) {
            setNotifications(result.data);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        loadNotifications();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'project_update':
                return '📋';
            case 'message':
                return '💬';
            case 'milestone':
                return '🎯';
            default:
                return '🔔';
        }
    };

    const filteredNotifications = notifications.filter(
        (n) => filter === 'all' || !n.isRead
    );

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {
        return <div className="text-center py-12">Loading notifications...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filter and Actions */}
            <div className="bg-white p-4 rounded-lg border flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded ${filter === 'unread'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-blue-600 hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg border">
                {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {filter === 'unread'
                            ? 'No unread notifications'
                            : 'No notifications yet'}
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`p-6 border-b last:border-b-0 ${!notification.isRead ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex gap-4">
                                <span className="text-3xl">
                                    {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {notification.title}
                                            </h3>
                                            <p className="text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Mark as read
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/dashboard/notifications/${notification._id}`}
                                        className="inline-block mt-3 text-blue-600 hover:underline"
                                    >
                                        View details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}