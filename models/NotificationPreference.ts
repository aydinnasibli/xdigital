// models/NotificationPreference.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum NotificationChannel {
    IN_APP = 'in_app',
    EMAIL = 'email',
    BOTH = 'both',
    NONE = 'none',
}

export enum DigestFrequency {
    INSTANT = 'instant',
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
}

interface INotificationSetting {
    enabled: boolean;
    channels: NotificationChannel[];
}

export interface INotificationPreference extends Document {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;

    // Global settings
    isEnabled: boolean;
    digestFrequency: DigestFrequency;

    // Notification preferences by type
    preferences: {
        projectUpdates: INotificationSetting;
        messages: INotificationSetting;
        invoices: INotificationSetting;
        milestones: INotificationSetting;
        tasks: INotificationSetting;
        mentions: INotificationSetting;
        general: INotificationSetting;
    };

    // Email settings
    emailDigestTime?: string; // HH:MM format (e.g., "09:00")
    emailDigestDays?: number[]; // For weekly: [0,1,2,3,4,5,6] (Sunday=0)

    // Quiet hours
    quietHoursEnabled: boolean;
    quietHoursStart?: string; // HH:MM format
    quietHoursEnd?: string; // HH:MM format

    createdAt: Date;
    updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
        digestFrequency: {
            type: String,
            enum: Object.values(DigestFrequency),
            default: DigestFrequency.INSTANT,
        },
        preferences: {
            projectUpdates: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
            messages: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
            invoices: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
            milestones: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
            tasks: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
            mentions: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
            general: {
                enabled: {
                    type: Boolean,
                    default: true,
                },
                channels: [{
                    type: String,
                    enum: Object.values(NotificationChannel),
                }],
            },
        },
        emailDigestTime: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        },
        emailDigestDays: [{
            type: Number,
            min: 0,
            max: 6,
        }],
        quietHoursEnabled: {
            type: Boolean,
            default: false,
        },
        quietHoursStart: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        },
        quietHoursEnd: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        },
    },
    {
        timestamps: true,
    }
);

// Defaults for preferences
NotificationPreferenceSchema.path('preferences.projectUpdates.channels').default([NotificationChannel.BOTH]);
NotificationPreferenceSchema.path('preferences.messages.channels').default([NotificationChannel.BOTH]);
NotificationPreferenceSchema.path('preferences.invoices.channels').default([NotificationChannel.BOTH]);
NotificationPreferenceSchema.path('preferences.milestones.channels').default([NotificationChannel.BOTH]);
NotificationPreferenceSchema.path('preferences.tasks.channels').default([NotificationChannel.IN_APP]);
NotificationPreferenceSchema.path('preferences.mentions.channels').default([NotificationChannel.BOTH]);
NotificationPreferenceSchema.path('preferences.general.channels').default([NotificationChannel.IN_APP]);

const NotificationPreference = (mongoose.models?.NotificationPreference as Model<INotificationPreference>) || mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);

export default NotificationPreference;
