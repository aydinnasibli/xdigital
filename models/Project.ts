import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Enums for service types and statuses
export enum ServiceType {
    WEB_DEVELOPMENT = 'web_development',
    SMM = 'social_media_marketing',
    DIGITAL_SOLUTIONS = 'digital_solutions',
}

export enum ProjectStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    REVIEW = 'review',
    COMPLETED = 'completed',
    ON_HOLD = 'on_hold',
    CANCELLED = 'cancelled',
}

// Web Development Packages
export enum WebDevPackage {
    BASIC = 'basic',
    STANDARD = 'standard',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise',
}

// Future: SMM Packages (when available)
export enum SMMPackage {
    STARTER = 'starter',
    GROWTH = 'growth',
    PRO = 'pro',
}

// Future: Digital Solutions Packages (when available)
export enum DigitalSolutionsPackage {
    BASIC = 'basic',
    ADVANCED = 'advanced',
    CUSTOM = 'custom',
}

interface IMilestone {
    title: string;
    description?: string;
    dueDate?: Date;
    completed: boolean;
    completedDate?: Date;
}

interface ITimeline {
    startDate?: Date;
    estimatedCompletion?: Date;
    completedDate?: Date;
}

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    projectName: string;
    projectDescription: string;
    serviceType: ServiceType;
    package: WebDevPackage | SMMPackage | DigitalSolutionsPackage;
    status: ProjectStatus;
    timeline?: ITimeline;
    deliverables?: string[];
    milestones?: IMilestone[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
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
        projectName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        projectDescription: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        serviceType: {
            type: String,
            required: true,
            enum: Object.values(ServiceType),
            default: ServiceType.WEB_DEVELOPMENT,
        },
        package: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ProjectStatus),
            default: ProjectStatus.PENDING,
        },
        timeline: {
            startDate: Date,
            estimatedCompletion: Date,
            completedDate: Date,
        },
        deliverables: [
            {
                type: String,
                trim: true,
            },
        ],
        milestones: [
            {
                title: {
                    type: String,
                    required: true,
                    trim: true,
                },
                description: {
                    type: String,
                    trim: true,
                },
                dueDate: Date,
                completed: {
                    type: Boolean,
                    default: false,
                },
                completedDate: Date,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ clerkUserId: 1, createdAt: -1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ serviceType: 1 });

const Project = (mongoose.models.Project as Model<IProject>) || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;