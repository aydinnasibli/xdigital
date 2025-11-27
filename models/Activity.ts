// models/Activity.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum ActivityType {
    PROJECT_CREATED = 'project_created',
    PROJECT_UPDATED = 'project_updated',
    PROJECT_STATUS_CHANGED = 'project_status_changed',
    PROJECT_DELETED = 'project_deleted',
    MILESTONE_CREATED = 'milestone_created',
    MILESTONE_COMPLETED = 'milestone_completed',
    MILESTONE_UPDATED = 'milestone_updated',
    TASK_CREATED = 'task_created',
    TASK_UPDATED = 'task_updated',
    TASK_STATUS_CHANGED = 'task_status_changed',
    TASK_COMPLETED = 'task_completed',
    TASK_ASSIGNED = 'task_assigned',
    FILE_UPLOADED = 'file_uploaded',
    FILE_UPDATED = 'file_updated',
    FILE_DELETED = 'file_deleted',
    FILE_DOWNLOADED = 'file_downloaded',
    FILE_COMMENTED = 'file_commented',
    MESSAGE_SENT = 'message_sent',
    MESSAGE_READ = 'message_read',
    USER_LOGGED_IN = 'user_logged_in',
    USER_LOGGED_OUT = 'user_logged_out',
    COMMENT_ADDED = 'comment_added',
    OTHER = 'other',
}

export enum ActivityEntity {
    PROJECT = 'project',
    TASK = 'task',
    MILESTONE = 'milestone',
    FILE = 'file',
    MESSAGE = 'message',
    USER = 'user',
    OTHER = 'other',
}

export interface IActivity extends Document {
    _id: mongoose.Types.ObjectId;
    type: ActivityType;
    entityType: ActivityEntity;
    entityId?: Types.ObjectId; // ID of the affected entity
    projectId?: Types.ObjectId; // Related project
    userId: Types.ObjectId; // User who performed the action
    userName: string;
    userImageUrl?: string;
    title: string; // Short description
    description?: string; // Detailed description
    metadata?: {
        oldValue?: any;
        newValue?: any;
        [key: string]: any;
    };
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
    {
        type: {
            type: String,
            enum: Object.values(ActivityType),
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            enum: Object.values(ActivityEntity),
            required: true,
            index: true,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userImageUrl: String,
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ipAddress: String,
        userAgent: String,
        createdAt: {
            type: Date,
            default: Date.now,
            // Note: index handled by TTL index below (line 137)
        },
    },
    {
        timestamps: false, // We only need createdAt, not updatedAt
    }
);

// Indexes for better query performance
ActivitySchema.index({ projectId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1 });

// TTL index to automatically delete old activities after 1 year (optional)
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const Activity = (mongoose.models?.Activity as Model<IActivity>) || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
