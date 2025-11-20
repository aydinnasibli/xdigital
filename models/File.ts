// models/File.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum FileCategory {
    PROJECT_ASSET = 'project_asset',
    BRAND_ASSET = 'brand_asset',
    DOCUMENT = 'document',
    IMAGE = 'image',
    VIDEO = 'video',
    DESIGN = 'design',
    CODE = 'code',
    OTHER = 'other',
}

export enum FileVisibility {
    PRIVATE = 'private', // Only admin
    CLIENT = 'client', // Admin and project client
    PUBLIC = 'public', // Everyone
}

interface IVersion {
    versionNumber: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
    notes?: string;
}

interface IComment {
    userId: Types.ObjectId;
    userName: string;
    userImageUrl?: string;
    comment: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IFile extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    folderId?: Types.ObjectId; // Reference to FileFolder model
    fileName: string;
    fileUrl: string; // Current version URL
    fileType: string; // MIME type
    fileSize: number; // In bytes
    category: FileCategory;
    visibility: FileVisibility;
    description?: string;
    tags?: string[];
    currentVersion: number;
    versions: IVersion[];
    comments: IComment[];
    isPreviewable: boolean;
    previewUrl?: string;
    thumbnailUrl?: string;
    metadata?: {
        width?: number;
        height?: number;
        duration?: number;
        format?: string;
        [key: string]: any;
    };
    uploadedBy: Types.ObjectId;
    downloadCount: number;
    lastDownloadedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        folderId: {
            type: Schema.Types.ObjectId,
            ref: 'FileFolder',
            index: true,
        },
        fileName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            enum: Object.values(FileCategory),
            default: FileCategory.OTHER,
            index: true,
        },
        visibility: {
            type: String,
            enum: Object.values(FileVisibility),
            default: FileVisibility.CLIENT,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        currentVersion: {
            type: Number,
            default: 1,
        },
        versions: [{
            versionNumber: {
                type: Number,
                required: true,
            },
            fileUrl: {
                type: String,
                required: true,
            },
            fileName: {
                type: String,
                required: true,
            },
            fileSize: {
                type: Number,
                required: true,
            },
            uploadedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
            notes: String,
        }],
        comments: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            userName: {
                type: String,
                required: true,
            },
            userImageUrl: String,
            comment: {
                type: String,
                required: true,
                maxlength: 2000,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            updatedAt: Date,
        }],
        isPreviewable: {
            type: Boolean,
            default: false,
        },
        previewUrl: String,
        thumbnailUrl: String,
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
        lastDownloadedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
FileSchema.index({ projectId: 1, category: 1 });
FileSchema.index({ projectId: 1, fileName: 'text' });
FileSchema.index({ uploadedBy: 1, createdAt: -1 });
FileSchema.index({ tags: 1 });

// Virtual for latest version
FileSchema.virtual('latestVersion').get(function() {
    if (!this.versions || this.versions.length === 0) return null;
    return this.versions[this.versions.length - 1];
});

// Virtual for file size in readable format
FileSchema.virtual('readableSize').get(function() {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
});

const File = (mongoose.models?.File as Model<IFile>) || mongoose.model<IFile>('File', FileSchema);

export default File;
