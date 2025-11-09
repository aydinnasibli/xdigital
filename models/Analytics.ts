import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum AnalyticsMetricType {
    PAGE_VIEWS = 'page_views',
    VISITORS = 'visitors',
    CONVERSIONS = 'conversions',
    ENGAGEMENT = 'engagement',
    SOCIAL_REACH = 'social_reach',
    CUSTOM = 'custom',
}

export interface IAnalytics extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    metricType: AnalyticsMetricType;
    metricName: string;
    value: number;
    metadata?: Record<string, any>;
    recordedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
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
        metricType: {
            type: String,
            required: true,
            enum: Object.values(AnalyticsMetricType),
        },
        metricName: {
            type: String,
            required: true,
            trim: true,
        },
        value: {
            type: Number,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        recordedDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
AnalyticsSchema.index({ projectId: 1, recordedDate: -1 });
AnalyticsSchema.index({ userId: 1, recordedDate: -1 });
AnalyticsSchema.index({ clerkUserId: 1, recordedDate: -1 });
AnalyticsSchema.index({ metricType: 1, recordedDate: -1 });

const Analytics = (mongoose.models.Analytics as Model<IAnalytics>) || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;