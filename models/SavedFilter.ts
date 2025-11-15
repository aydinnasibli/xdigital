// models/SavedFilter.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum FilterEntity {
    PROJECTS = 'projects',
    TASKS = 'tasks',
    FILES = 'files',
    MESSAGES = 'messages',
    INVOICES = 'invoices',
    DELIVERABLES = 'deliverables',
    CLIENTS = 'clients',
    ACTIVITIES = 'activities',
}

export interface ISavedFilter extends Document {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    description?: string;
    entity: FilterEntity;
    filters: {
        [key: string]: any; // Flexible filter criteria
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isDefault: boolean;
    isShared: boolean; // Share with team (admin only)
    usageCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SavedFilterSchema = new Schema<ISavedFilter>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        entity: {
            type: String,
            enum: Object.values(FilterEntity),
            required: true,
            index: true,
        },
        filters: {
            type: Schema.Types.Mixed,
            required: true,
        },
        sortBy: String,
        sortOrder: {
            type: String,
            enum: ['asc', 'desc'],
            default: 'desc',
        },
        isDefault: {
            type: Boolean,
            default: false,
            index: true,
        },
        isShared: {
            type: Boolean,
            default: false,
            index: true,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        lastUsedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
SavedFilterSchema.index({ userId: 1, entity: 1 });
SavedFilterSchema.index({ isShared: 1, entity: 1 });

const SavedFilter = (mongoose.models?.SavedFilter as Model<ISavedFilter>) || mongoose.model<ISavedFilter>('SavedFilter', SavedFilterSchema);

export default SavedFilter;
