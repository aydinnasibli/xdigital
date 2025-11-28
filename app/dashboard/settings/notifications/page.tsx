// app/dashboard/settings/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '@/app/actions/notificationPreferences';
import { NotificationChannel } from '@/models/NotificationPreference';
import { toast } from 'sonner';

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
    }> = [
        {
            key: 'projectUpdates',
            label: 'Project Updates',
            description: 'Get notified when project status changes',
        },
        {
            key: 'messages',
            label: 'Messages',
            description: 'When you receive a new message from admin',
        },
        {
            key: 'milestones',
            label: 'Milestones',
            description: 'When a project milestone is completed',
        },
        {
            key: 'tasks',
            label: 'Tasks',
            description: 'When a task is assigned or updated',
        },
        {
            key: 'mentions',
            label: 'Mentions',
            description: 'When someone mentions you in a message',
        },
        {
            key: 'general',
            label: 'General',
            description: 'General notifications and announcements',
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="text-gray-600 mt-2">Manage how you receive updates about your projects</p>
            </div>

            {/* Global Toggle */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Enable Notifications</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Master switch for all notifications
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={globalEnabled}
                            onChange={(e) => setGlobalEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Notification Settings Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Notification Types</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure how you want to receive each type of notification
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Notification Type
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Enabled
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    In-App
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {notificationTypes.map((type) => (
                                <tr key={type.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{type.label}</div>
                                        <div className="text-sm text-gray-600">{type.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences?.[type.key]?.enabled ?? false}
                                                onChange={() => handleToggle(type.key, 'enabled')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
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
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <button
                    onClick={loadPreferences}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset Changes
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving || !preferences}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}
