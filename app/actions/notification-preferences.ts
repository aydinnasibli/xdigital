// app/actions/notification-preferences.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import NotificationPreference, { NotificationChannel, DigestFrequency } from '@/models/NotificationPreference';
import User from '@/models/User';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get user's notification preferences
export async function getNotificationPreferences(): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        let preferences = await NotificationPreference.findOne({ clerkUserId }).lean();

        // If no preferences exist, create default ones
        if (!preferences) {
            const user = await User.findOne({ clerkId: clerkUserId });
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            preferences = await NotificationPreference.create({
                userId: user._id,
                clerkUserId,
                isEnabled: true,
                digestFrequency: DigestFrequency.INSTANT,
                preferences: {
                    projectUpdates: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    messages: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    invoices: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    milestones: {
                        enabled: true,
                        channels: [NotificationChannel.IN_APP],
                    },
                    tasks: {
                        enabled: true,
                        channels: [NotificationChannel.IN_APP],
                    },
                    mentions: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    general: {
                        enabled: true,
                        channels: [NotificationChannel.IN_APP],
                    },
                },
                quietHoursEnabled: false,
            });
        }

        return { success: true, data: toSerializedObject(preferences) };
    } catch (error) {
        logError(error as Error, { context: 'getNotificationPreferences' });
        return { success: false, error: 'Failed to fetch notification preferences' };
    }
}

// Update notification preferences
export async function updateNotificationPreferences(data: {
    isEnabled?: boolean;
    digestFrequency?: DigestFrequency;
    preferences?: {
        [key: string]: {
            enabled: boolean;
            channels: NotificationChannel[];
        };
    };
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    emailDigestTime?: string;
    emailDigestDays?: number[];
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const updateData: any = {};

        if (data.isEnabled !== undefined) {
            updateData.isEnabled = data.isEnabled;
        }

        if (data.digestFrequency) {
            updateData.digestFrequency = data.digestFrequency;
        }

        if (data.preferences) {
            // Update each preference type
            for (const [key, value] of Object.entries(data.preferences)) {
                updateData[`preferences.${key}`] = value;
            }
        }

        if (data.quietHoursEnabled !== undefined) {
            updateData.quietHoursEnabled = data.quietHoursEnabled;
        }

        if (data.quietHoursStart) {
            updateData.quietHoursStart = data.quietHoursStart;
        }

        if (data.quietHoursEnd) {
            updateData.quietHoursEnd = data.quietHoursEnd;
        }

        if (data.emailDigestTime) {
            updateData.emailDigestTime = data.emailDigestTime;
        }

        if (data.emailDigestDays) {
            updateData.emailDigestDays = data.emailDigestDays;
        }

        const preferences = await NotificationPreference.findOneAndUpdate(
            { clerkUserId },
            updateData,
            { new: true, upsert: false }
        ).lean();

        if (!preferences) {
            return { success: false, error: 'Preferences not found' };
        }

        return { success: true, data: toSerializedObject(preferences) };
    } catch (error) {
        logError(error as Error, { context: 'updateNotificationPreferences', data });
        return { success: false, error: 'Failed to update notification preferences' };
    }
}

// Reset to defaults
export async function resetNotificationPreferences(): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const preferences = await NotificationPreference.findOneAndUpdate(
            { clerkUserId },
            {
                isEnabled: true,
                digestFrequency: DigestFrequency.INSTANT,
                preferences: {
                    projectUpdates: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    messages: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    invoices: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    milestones: {
                        enabled: true,
                        channels: [NotificationChannel.IN_APP],
                    },
                    tasks: {
                        enabled: true,
                        channels: [NotificationChannel.IN_APP],
                    },
                    mentions: {
                        enabled: true,
                        channels: [NotificationChannel.BOTH],
                    },
                    general: {
                        enabled: true,
                        channels: [NotificationChannel.IN_APP],
                    },
                },
                quietHoursEnabled: false,
                quietHoursStart: undefined,
                quietHoursEnd: undefined,
            },
            { new: true }
        ).lean();

        return { success: true, data: toSerializedObject(preferences) };
    } catch (error) {
        logError(error as Error, { context: 'resetNotificationPreferences' });
        return { success: false, error: 'Failed to reset notification preferences' };
    }
}
