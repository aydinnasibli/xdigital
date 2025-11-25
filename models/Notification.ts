import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum NotificationType {
    PROJECT_UPDATE = 'project_update',
    MESSAGE = 'message',
    MILESTONE = 'milestone',
    GENERAL = 'general',
}

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    projectId?: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: Date;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        clerkUserId: {
            type: String,
            required: true,
            index: true,
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(NotificationType),
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: Date,
        link: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ clerkUserId: 1, isRead: 1, createdAt: -1 });

const Notification = (mongoose.models?.Notification as Model<INotification>) || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;