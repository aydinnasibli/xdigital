// app/admin/reminders/RemindersDashboard.tsx
'use client';

import { useState } from 'react';
import { Bell, Calendar, Clock, User, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { markReminderSent, getUpcomingReminders } from '@/app/actions/client-notes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface Reminder {
    _id: string;
    title: string;
    content: string;
    type: string;
    reminderDate: string;
    isReminded: boolean;
    clientId: string;
    clientName?: string;
    authorName: string;
    createdAt: string;
}

export default function RemindersDashboard({ initialReminders }: { initialReminders: Reminder[] }) {
    const router = useRouter();
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState(30);

    const handleMarkAsSent = async (noteId: string) => {
        const result = await markReminderSent(noteId);
        if (result.success) {
            toast.success('Reminder marked as sent');
            setReminders(reminders.map(r => r._id === noteId ? { ...r, isReminded: true } : r));
        } else {
            toast.error(result.error || 'Failed to mark reminder as sent');
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        const result = await getUpcomingReminders(days);
        if (result.success) {
            setReminders(result.data || []);
            toast.success('Reminders refreshed');
        } else {
            toast.error(result.error || 'Failed to refresh reminders');
        }
        setLoading(false);
    };

    const getTypeColor = (type: string) => {
        const colors: any = {
            general: 'bg-gray-100 text-gray-800',
            important: 'bg-yellow-100 text-yellow-800',
            risk: 'bg-red-100 text-red-800',
            opportunity: 'bg-green-100 text-green-800',
            feedback: 'bg-blue-100 text-blue-800',
            reminder: 'bg-purple-100 text-purple-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTimeUntil = (dateString: string) => {
        const now = new Date();
        const reminderDate = new Date(dateString);
        const diff = reminderDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) return 'Overdue';
        if (daysDiff === 0) return 'Today';
        if (daysDiff === 1) return 'Tomorrow';
        return `In ${daysDiff} days`;
    };

    const getTimeColor = (dateString: string) => {
        const now = new Date();
        const reminderDate = new Date(dateString);
        const diff = reminderDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) return 'text-red-600 bg-red-50';
        if (daysDiff <= 1) return 'text-orange-600 bg-orange-50';
        if (daysDiff <= 7) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const pendingReminders = reminders.filter(r => !r.isReminded);
    const sentReminders = reminders.filter(r => r.isReminded);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Reminders</p>
                            <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingReminders.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Sent</p>
                            <p className="text-2xl font-bold text-gray-900">{sentReminders.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reminders.filter(r => new Date(r.reminderDate) < new Date() && !r.isReminded).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Time Range:</label>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value={7}>Next 7 days</option>
                        <option value={14}>Next 14 days</option>
                        <option value={30}>Next 30 days</option>
                        <option value={60}>Next 60 days</option>
                        <option value={90}>Next 90 days</option>
                    </select>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Pending Reminders */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Pending Reminders</h2>
                </div>
                {pendingReminders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No pending reminders</p>
                        <p className="text-sm mt-1">All reminders have been sent or there are no upcoming reminders</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {pendingReminders.map((reminder) => (
                            <div key={reminder._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(reminder.type)}`}>
                                                {reminder.type}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded font-medium ${getTimeColor(reminder.reminderDate)}`}>
                                                {getTimeUntil(reminder.reminderDate)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{reminder.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {reminder.clientName || 'Unknown Client'}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(reminder.reminderDate).toLocaleDateString()}
                                            </span>
                                            <span>•</span>
                                            <span>By {reminder.authorName}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Link
                                            href={`/admin/clients/${reminder.clientId}`}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            title="View client"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleMarkAsSent(reminder._id)}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                                            title="Mark as sent"
                                        >
                                            <Check className="w-4 h-4" />
                                            Mark Sent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sent Reminders */}
            {sentReminders.length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Sent Reminders</h2>
                    </div>
                    <div className="divide-y">
                        {sentReminders.map((reminder) => (
                            <div key={reminder._id} className="p-6 opacity-60">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(reminder.type)}`}>
                                                {reminder.type}
                                            </span>
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">
                                                ✓ Sent
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{reminder.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {reminder.clientName || 'Unknown Client'}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(reminder.reminderDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/clients/${reminder.clientId}`}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        title="View client"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
