// models/Feedback.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum FeedbackType {
    PROJECT_SURVEY = 'project_survey',
    MILESTONE_FEEDBACK = 'milestone_feedback',
    NPS_SURVEY = 'nps_survey',
    TESTIMONIAL = 'testimonial',
    GENERAL_FEEDBACK = 'general_feedback',
    BUG_REPORT = 'bug_report',
    FEATURE_REQUEST = 'feature_request',
}

export enum FeedbackStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    REVIEWED = 'reviewed',
    APPROVED = 'approved', // For testimonials
    REJECTED = 'rejected',
}

interface ISurveyQuestion {
    question: string;
    questionType: 'rating' | 'text' | 'yes_no' | 'multiple_choice';
    answer?: string | number;
    options?: string[]; // For multiple choice
}

export interface IFeedback extends Document {
    _id: mongoose.Types.ObjectId;
    type: FeedbackType;
    status: FeedbackStatus;
    userId: Types.ObjectId;
    userName: string;
    userEmail: string;
    userImageUrl?: string;
    projectId?: Types.ObjectId;
    milestoneId?: Types.ObjectId;

    // NPS Score (0-10)
    npsScore?: number;

    // Overall rating (1-5 stars)
    overallRating?: number;

    // Specific ratings
    ratings?: {
        communication?: number;
        quality?: number;
        timeliness?: number;
        professionalism?: number;
        valueForMoney?: number;
    };

    // Testimonial
    testimonial?: string;
    isPublicTestimonial: boolean;
    testimonialApprovedAt?: Date;

    // Survey questions
    surveyQuestions?: ISurveyQuestion[];

    // General feedback
    title?: string;
    comment?: string;

    // Additional fields
    wouldRecommend?: boolean;
    improvements?: string;
    highlights?: string;

    // Admin response
    adminResponse?: {
        userId: Types.ObjectId;
        userName: string;
        response: string;
        respondedAt: Date;
    };

    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
    {
        type: {
            type: String,
            enum: Object.values(FeedbackType),
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(FeedbackStatus),
            default: FeedbackStatus.PENDING,
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
        userEmail: {
            type: String,
            required: true,
        },
        userImageUrl: String,
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            index: true,
        },
        milestoneId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
        npsScore: {
            type: Number,
            min: 0,
            max: 10,
        },
        overallRating: {
            type: Number,
            min: 1,
            max: 5,
        },
        ratings: {
            communication: {
                type: Number,
                min: 1,
                max: 5,
            },
            quality: {
                type: Number,
                min: 1,
                max: 5,
            },
            timeliness: {
                type: Number,
                min: 1,
                max: 5,
            },
            professionalism: {
                type: Number,
                min: 1,
                max: 5,
            },
            valueForMoney: {
                type: Number,
                min: 1,
                max: 5,
            },
        },
        testimonial: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        isPublicTestimonial: {
            type: Boolean,
            default: false,
        },
        testimonialApprovedAt: Date,
        surveyQuestions: [{
            question: {
                type: String,
                required: true,
            },
            questionType: {
                type: String,
                enum: ['rating', 'text', 'yes_no', 'multiple_choice'],
                required: true,
            },
            answer: Schema.Types.Mixed,
            options: [String],
        }],
        title: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        wouldRecommend: Boolean,
        improvements: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        highlights: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        adminResponse: {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            userName: String,
            response: String,
            respondedAt: Date,
        },
        submittedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
FeedbackSchema.index({ projectId: 1, type: 1 });
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, type: 1 });
FeedbackSchema.index({ isPublicTestimonial: 1, status: 1 });

// Virtual for NPS category
FeedbackSchema.virtual('npsCategory').get(function() {
    if (this.npsScore === undefined || this.npsScore === null) return null;
    if (this.npsScore >= 9) return 'promoter';
    if (this.npsScore >= 7) return 'passive';
    return 'detractor';
});

const Feedback = (mongoose.models?.Feedback as Model<IFeedback>) || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
