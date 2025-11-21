// app/dashboard/notifications/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getNotificationById, markAsRead } from '@/app/actions/notifications';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

function getNotificationIcon(type: string) {
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
}

function getNotificationColor(type: string) {
    switch (type) {
        case 'project_update':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'message':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'invoice':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'milestone':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function formatNotificationType(type: string) {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default async function NotificationDetailPage({ params }: PageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const { id } = await params;
    const result = await getNotificationById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const notification = result.data;

    // Mark as read when viewing
    if (!notification.isRead) {
        await markAsRead(id);
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href="/dashboard/notifications"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to Notifications
                </Link>
            </div>

            {/* Notification Card */}
            <div className="bg-white rounded-lg shadow-lg border">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-start gap-4">
                        <div className="text-5xl">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {notification.title}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getNotificationColor(
                                                notification.type
                                            )}`}
                                        >
                                            {formatNotificationType(notification.type)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(notification.createdAt).toLocaleString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                {notification.isRead && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                        Read
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="prose max-w-none">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Message
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {notification.message}
                        </p>
                    </div>

                    {/* Action Button */}
                    {notification.link && (
                        <div className="mt-8 pt-6 border-t">
                            <Link
                                href={notification.link}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View Related Content
                                <svg
                                    className="w-5 h-5 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Notification ID: {notification._id}</span>
                        {notification.readAt && (
                            <span>
                                Read at:{' '}
                                {new Date(notification.readAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
