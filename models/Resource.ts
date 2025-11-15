// models/Resource.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum ResourceType {
    ARTICLE = 'article',
    VIDEO = 'video',
    TUTORIAL = 'tutorial',
    FAQ = 'faq',
    DOCUMENT = 'document',
    TEMPLATE = 'template',
    BRAND_ASSET = 'brand_asset',
    LINK = 'link',
    OTHER = 'other',
}

export enum ResourceCategory {
    WEB_DEVELOPMENT = 'web_development',
    SOCIAL_MEDIA = 'social_media',
    DIGITAL_SOLUTIONS = 'digital_solutions',
    BRANDING = 'branding',
    GENERAL = 'general',
    GETTING_STARTED = 'getting_started',
    BEST_PRACTICES = 'best_practices',
}

export enum ResourceVisibility {
    PUBLIC = 'public', // Everyone can see
    CLIENTS = 'clients', // Only logged-in clients
    SPECIFIC_SERVICE = 'specific_service', // Only clients with specific service type
    PRIVATE = 'private', // Admin only
}

export interface IResource extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    content?: string; // For articles, rich text content
    type: ResourceType;
    category: ResourceCategory;
    visibility: ResourceVisibility;
    serviceType?: string; // If visibility is specific_service

    // Media
    thumbnailUrl?: string;
    videoUrl?: string;
    videoEmbedCode?: string;

    // Files
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;

    // Link
    externalUrl?: string;

    // Organization
    tags?: string[];
    relatedResources?: Types.ObjectId[];

    // SEO
    slug: string;
    metaDescription?: string;

    // Status
    isPublished: boolean;
    isFeatured: boolean;

    // Analytics
    viewCount: number;
    downloadCount: number;

    // Author
    authorId: Types.ObjectId;
    authorName: string;

    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            index: 'text',
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            index: 'text',
        },
        content: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: Object.values(ResourceType),
            required: true,
            index: true,
        },
        category: {
            type: String,
            enum: Object.values(ResourceCategory),
            required: true,
            index: true,
        },
        visibility: {
            type: String,
            enum: Object.values(ResourceVisibility),
            default: ResourceVisibility.CLIENTS,
            index: true,
        },
        serviceType: {
            type: String,
            index: true,
        },
        thumbnailUrl: String,
        videoUrl: String,
        videoEmbedCode: String,
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        externalUrl: String,
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        relatedResources: [{
            type: Schema.Types.ObjectId,
            ref: 'Resource',
        }],
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        isPublished: {
            type: Boolean,
            default: false,
            index: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        publishedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
ResourceSchema.index({ category: 1, isPublished: 1 });
ResourceSchema.index({ visibility: 1, isPublished: 1 });
ResourceSchema.index({ isFeatured: 1, isPublished: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ title: 'text', description: 'text' });

const Resource = (mongoose.models?.Resource as Model<IResource>) || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
