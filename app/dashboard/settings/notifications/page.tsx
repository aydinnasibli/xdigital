// app/dashboard/settings/notifications/page.tsx
'use client';

import { useState } from 'react';

export default function NotificationSettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState({
        projectUpdates: true,
        milestoneCompleted: true,
        newMessage: true,
        invoiceCreated: true,
        invoiceDue: true,
        taskAssigned: false,
        weeklyDigest: true,
    });

    const [inAppNotifications, setInAppNotifications] = useState({
        projectUpdates: true,
        milestoneCompleted: true,
        newMessage: true,
        invoiceCreated: true,
        invoiceDue: true,
        taskAssigned: true,
    });

    const handleSave = () => {
        // Save preferences to backend
        alert('Notification preferences saved!');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="text-gray-600 mt-2">Manage how you receive updates about your projects</p>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📧</span>
                    <div>
                        <h2 className="text-xl font-semibold">Email Notifications</h2>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(emailNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b last:border-b-0">
                            <div>
                                <div className="font-medium text-gray-900 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {getNotificationDescription(key)}
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => setEmailNotifications({
                                        ...emailNotifications,
                                        [key]: e.target.checked
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* In-App Notifications */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🔔</span>
                    <div>
                        <h2 className="text-xl font-semibold">In-App Notifications</h2>
                        <p className="text-sm text-gray-600">See notifications in the dashboard</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(inAppNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b last:border-b-0">
                            <div>
                                <div className="font-medium text-gray-900 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {getNotificationDescription(key)}
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => setInAppNotifications({
                                        ...inAppNotifications,
                                        [key]: e.target.checked
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Digest Settings */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📊</span>
                    <div>
                        <h2 className="text-xl font-semibold">Digest Settings</h2>
                        <p className="text-sm text-gray-600">Receive summary emails</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <div className="font-medium text-gray-900">Weekly Digest</div>
                            <div className="text-sm text-gray-600">
                                Receive a weekly summary of all your project activities
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailNotifications.weeklyDigest}
                                onChange={(e) => setEmailNotifications({
                                    ...emailNotifications,
                                    weeklyDigest: e.target.checked
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
}

function getNotificationDescription(key: string): string {
    const descriptions: Record<string, string> = {
        projectUpdates: 'Get notified when project status changes',
        milestoneCompleted: 'When a project milestone is completed',
        newMessage: 'When you receive a new message from admin',
        invoiceCreated: 'When a new invoice is created for your project',
        invoiceDue: 'Reminders for upcoming invoice due dates',
        taskAssigned: 'When a task is assigned to you',
        weeklyDigest: 'Weekly summary of all activities',
    };
    return descriptions[key] || '';
}
