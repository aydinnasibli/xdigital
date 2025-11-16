// models/ProjectTemplate.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ServiceType, WebDevPackage, SMMPackage, DigitalSolutionsPackage } from './Project';

interface ITemplateMilestone {
    title: string;
    description?: string;
    daysFromStart: number; // Days after project start
    order: number;
}

interface ITemplateDeliverable {
    title: string;
    description?: string;
    category: string;
    milestoneName?: string; // Which milestone this belongs to
}

interface ITemplateTask {
    title: string;
    description?: string;
    status: string;
    priority: string;
    estimatedHours?: number;
    milestoneName?: string;
    order: number;
}

export interface IProjectTemplate extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    serviceType: ServiceType;
    package: WebDevPackage | SMMPackage | DigitalSolutionsPackage;

    // Website Template Fields
    category?: string; // e.g., "Restaurant", "E-commerce", "Portfolio", "Business"
    githubRepoUrl?: string; // GitHub repository URL
    demoUrl?: string; // Live demo/preview URL
    screenshots?: string[]; // Array of screenshot URLs
    features?: string[]; // Key features list (e.g., "5 pages", "Contact form", "SEO optimized")

    // Package Hierarchy: Templates available for package tiers
    // e.g., ["basic"] or ["basic", "standard", "premium"]
    availableForPackages?: string[];

    estimatedDurationDays: number;
    milestones: ITemplateMilestone[];
    deliverables: ITemplateDeliverable[];
    tasks: ITemplateTask[];
    isActive: boolean;
    isDefault: boolean; // Is this the default template for this service/package combination?
    createdBy: Types.ObjectId;
    usageCount: number; // How many times this template has been used
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectTemplateSchema = new Schema<IProjectTemplate>(
    {
        name: {
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
        serviceType: {
            type: String,
            required: true,
            enum: Object.values(ServiceType),
            index: true,
        },
        package: {
            type: String,
            required: true,
            index: true,
        },

        // Website Template Fields
        category: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        githubRepoUrl: {
            type: String,
            trim: true,
        },
        demoUrl: {
            type: String,
            trim: true,
        },
        screenshots: [{
            type: String,
            trim: true,
        }],
        features: [{
            type: String,
            trim: true,
        }],
        availableForPackages: [{
            type: String,
            trim: true,
        }],

        estimatedDurationDays: {
            type: Number,
            required: true,
            min: 1,
        },
        milestones: [{
            title: {
                type: String,
                required: true,
                trim: true,
            },
            description: String,
            daysFromStart: {
                type: Number,
                required: true,
                min: 0,
            },
            order: {
                type: Number,
                required: true,
            },
        }],
        deliverables: [{
            title: {
                type: String,
                required: true,
                trim: true,
            },
            description: String,
            category: {
                type: String,
                required: true,
            },
            milestoneName: String,
        }],
        tasks: [{
            title: {
                type: String,
                required: true,
                trim: true,
            },
            description: String,
            status: {
                type: String,
                default: 'todo',
            },
            priority: {
                type: String,
                default: 'medium',
            },
            estimatedHours: Number,
            milestoneName: String,
            order: {
                type: Number,
                required: true,
            },
        }],
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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
ProjectTemplateSchema.index({ serviceType: 1, package: 1 });
ProjectTemplateSchema.index({ isActive: 1, isDefault: 1 });

const ProjectTemplate = (mongoose.models?.ProjectTemplate as Model<IProjectTemplate>) || mongoose.model<IProjectTemplate>('ProjectTemplate', ProjectTemplateSchema);

export default ProjectTemplate;
