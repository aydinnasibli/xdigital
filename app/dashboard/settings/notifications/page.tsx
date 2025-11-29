// app/dashboard/settings/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '@/app/actions/notificationPreferences';
import { NotificationChannel } from '@/models/NotificationPreference';
import { toast } from 'sonner';
import { Bell, Mail, Sparkles, Save, RotateCcw } from 'lucide-react';

interface NotificationSetting {
    enabled: boolean;
    channels: NotificationChannel[];
}

interface Preferences {
    projectUpdates: NotificationSetting;
    messages: NotificationSetting;
    milestones: NotificationSetting;
    tasks: NotificationSetting;
    mentions: NotificationSetting;
    general: NotificationSetting;
    [key: string]: NotificationSetting; // Index signature for type compatibility
}

export default function NotificationSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [globalEnabled, setGlobalEnabled] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        const result = await getNotificationPreferences();
        if (result.success && result.data) {
            setPreferences(result.data.preferences);
            setGlobalEnabled(result.data.isEnabled);
        } else {
            toast.error(result.error || 'Failed to load preferences');
        }
        setLoading(false);
    };

    const handleToggle = (category: keyof Preferences, field: 'enabled' | 'email' | 'inApp') => {
        if (!preferences) return;

        const updatedPreferences = { ...preferences };
        const setting = updatedPreferences[category];

        if (field === 'enabled') {
            setting.enabled = !setting.enabled;
        } else if (field === 'email') {
            const hasEmail = setting.channels.includes(NotificationChannel.EMAIL) ||
                            setting.channels.includes(NotificationChannel.BOTH);
            const hasInApp = setting.channels.includes(NotificationChannel.IN_APP) ||
                           setting.channels.includes(NotificationChannel.BOTH);

            if (hasEmail) {
                // Remove email
                setting.channels = hasInApp ? [NotificationChannel.IN_APP] : [NotificationChannel.NONE];
            } else {
                // Add email
                setting.channels = hasInApp ? [NotificationChannel.BOTH] : [NotificationChannel.EMAIL];
            }
        } else if (field === 'inApp') {
            const hasEmail = setting.channels.includes(NotificationChannel.EMAIL) ||
                            setting.channels.includes(NotificationChannel.BOTH);
            const hasInApp = setting.channels.includes(NotificationChannel.IN_APP) ||
                           setting.channels.includes(NotificationChannel.BOTH);

            if (hasInApp) {
                // Remove in-app
                setting.channels = hasEmail ? [NotificationChannel.EMAIL] : [NotificationChannel.NONE];
            } else {
                // Add in-app
                setting.channels = hasEmail ? [NotificationChannel.BOTH] : [NotificationChannel.IN_APP];
            }
        }

        setPreferences(updatedPreferences);
    };

    const hasChannel = (category: keyof Preferences, channel: 'email' | 'inApp'): boolean => {
        if (!preferences) return false;
        const setting = preferences[category];

        if (channel === 'email') {
            return setting.channels.includes(NotificationChannel.EMAIL) ||
                   setting.channels.includes(NotificationChannel.BOTH);
        } else {
            return setting.channels.includes(NotificationChannel.IN_APP) ||
                   setting.channels.includes(NotificationChannel.BOTH);
        }
    };

    const handleSave = async () => {
        if (!preferences) return;

        setSaving(true);
        const result = await updateNotificationPreferences({
            isEnabled: globalEnabled,
            preferences,
        });

        if (result.success) {
            toast.success('Notification preferences saved successfully!');
        } else {
            toast.error(result.error || 'Failed to save preferences');
        }
        setSaving(false);
    };

    const notificationTypes: Array<{
        key: keyof Preferences;
        label: string;
        description: string;
        icon: string;
    }> = [
        {
            key: 'projectUpdates',
            label: 'Project Updates',
            description: 'Get notified when project status changes',
            icon: '📊',
        },
        {
            key: 'messages',
            label: 'Messages',
            description: 'When you receive a new message from admin',
            icon: '💬',
        },
        {
            key: 'milestones',
            label: 'Milestones',
            description: 'When a project milestone is completed',
            icon: '🎯',
        },
        {
            key: 'tasks',
            label: 'Tasks',
            description: 'When a task is assigned or updated',
            icon: '✅',
        },
        {
            key: 'mentions',
            label: 'Mentions',
            description: 'When someone mentions you in a message',
            icon: '👋',
        },
        {
            key: 'general',
            label: 'General',
            description: 'General notifications and announcements',
            icon: '📢',
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-center py-24">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            {/* Header - Dark Glass */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">Notification Preferences</h1>
                            <p className="text-gray-400">Manage how you receive updates about your projects and activities</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Toggle - Dark Glass */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                            <Bell className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Enable Notifications</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Master switch for all notifications
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={globalEnabled}
                            onChange={(e) => setGlobalEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                    </label>
                </div>
            </div>

            {/* Notification Settings Table - Dark Glass */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800/50">
                    <h2 className="text-xl font-semibold text-white">Notification Types</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure how you want to receive each type of notification
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Notification Type
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Enabled
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center justify-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center justify-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        In-App
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {notificationTypes.map((type) => (
                                <tr key={type.key} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{type.icon}</span>
                                            <div>
                                                <div className="font-medium text-white">{type.label}</div>
                                                <div className="text-sm text-gray-500">{type.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences?.[type.key]?.enabled ?? false}
                                                onChange={() => handleToggle(type.key, 'enabled')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasChannel(type.key, 'email')}
                                                onChange={() => handleToggle(type.key, 'email')}
                                                disabled={!preferences?.[type.key]?.enabled}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-600 peer-disabled:opacity-30 peer-disabled:cursor-not-allowed"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasChannel(type.key, 'inApp')}
                                                onChange={() => handleToggle(type.key, 'inApp')}
                                                disabled={!preferences?.[type.key]?.enabled}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-600 peer-checked:to-green-600 peer-disabled:opacity-30 peer-disabled:cursor-not-allowed"></div>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons - Dark Glass */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <button
                    onClick={() => void loadPreferences()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700 rounded-xl transition-all text-gray-300 hover:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset Changes
                </button>
                <button
                    onClick={() => void handleSave()}
                    disabled={saving || !preferences}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}
