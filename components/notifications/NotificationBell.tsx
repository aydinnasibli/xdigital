'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/app/actions/notifications';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        const result = await getUnreadCount();
        if (result.success && result.data) {
            setUnreadCount(result.data.count);
        }
    };

    const loadNotifications = async () => {
        setLoading(true);
        const result = await getNotifications();
        if (result.success && result.data) {
            setNotifications(result.data);
        }
        setLoading(false);
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            loadNotifications();
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId);
        loadNotifications();
        loadUnreadCount();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        loadNotifications();
        loadUnreadCount();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'project_update':
                return '📋';
            case 'message':
                return '💬';
            case 'invoice':
                return '💰';
            case 'milestone':
                return '🎯';
            default:
                return '🔔';
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={handleOpen}
                className="relative p-2 hover:bg-gray-100 rounded-full"
            >
                <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification._id}
                                    href={`/dashboard/notifications/${notification._id}`}
                                    className={`block p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-2xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t text-center">
                        <Link
                            href="/dashboard/notifications"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
}