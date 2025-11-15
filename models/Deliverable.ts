// models/Deliverable.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum DeliverableStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    IN_REVIEW = 'in_review',
    CHANGES_REQUESTED = 'changes_requested',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum DeliverableCategory {
    DESIGN = 'design',
    CONTENT = 'content',
    DEVELOPMENT = 'development',
    DOCUMENTATION = 'documentation',
    MARKETING = 'marketing',
    OTHER = 'other',
}

interface IRevision {
    versionNumber: number;
    fileId?: Types.ObjectId; // Reference to File model
    fileUrl?: string;
    fileName?: string;
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
    notes?: string;
}

interface IFeedback {
    userId: Types.ObjectId;
    userName: string;
    comment: string;
    rating?: number; // 1-5 stars
    createdAt: Date;
}

interface IApproval {
    approvedBy: Types.ObjectId;
    approvedByName: string;
    approvedAt: Date;
    signatureUrl?: string; // Optional digital signature
    notes?: string;
}

export interface IDeliverable extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    milestoneId?: Types.ObjectId;
    taskId?: Types.ObjectId;
    title: string;
    description?: string;
    category: DeliverableCategory;
    status: DeliverableStatus;
    currentVersion: number;
    revisions: IRevision[];
    feedback: IFeedback[];
    approval?: IApproval;
    dueDate?: Date;
    submittedDate?: Date;
    approvedDate?: Date;
    tags?: string[];
    isPreviewable: boolean; // Can be previewed in browser
    previewUrl?: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        milestoneId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        category: {
            type: String,
            enum: Object.values(DeliverableCategory),
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(DeliverableStatus),
            default: DeliverableStatus.DRAFT,
            index: true,
        },
        currentVersion: {
            type: Number,
            default: 1,
        },
        revisions: [{
            versionNumber: {
                type: Number,
                required: true,
            },
            fileId: {
                type: Schema.Types.ObjectId,
                ref: 'File',
            },
            fileUrl: String,
            fileName: String,
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
        feedback: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            userName: {
                type: String,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        approval: {
            approvedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            approvedByName: String,
            approvedAt: Date,
            signatureUrl: String,
            notes: String,
        },
        dueDate: {
            type: Date,
            index: true,
        },
        submittedDate: Date,
        approvedDate: Date,
        tags: [{
            type: String,
            trim: true,
        }],
        isPreviewable: {
            type: Boolean,
            default: false,
        },
        previewUrl: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
DeliverableSchema.index({ projectId: 1, status: 1 });
DeliverableSchema.index({ projectId: 1, category: 1 });
DeliverableSchema.index({ dueDate: 1, status: 1 });

// Virtual for latest revision
DeliverableSchema.virtual('latestRevision').get(function() {
    if (!this.revisions || this.revisions.length === 0) return null;
    return this.revisions[this.revisions.length - 1];
});

const Deliverable = (mongoose.models?.Deliverable as Model<IDeliverable>) || mongoose.model<IDeliverable>('Deliverable', DeliverableSchema);

export default Deliverable;
