import mongoose, { Schema, Document, Model } from 'mongoose';

export enum OnboardingStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

interface IClientMetrics {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    overdueInvoices: number;
    lastActivityDate?: Date;
    lastLoginDate?: Date;
    healthScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    imageUrl?: string;

    // Role
    role: UserRole;

    // Phone and company info
    phone?: string;
    company?: string;
    position?: string;
    website?: string;

    // Onboarding
    onboardingStatus: OnboardingStatus;
    onboardingCompletedAt?: Date;

    // Client metrics (for admin view)
    metrics?: IClientMetrics;

    // Status
    isActive: boolean;
    isOnline: boolean;
    lastSeenAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        userName: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
            index: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        position: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        onboardingStatus: {
            type: String,
            enum: Object.values(OnboardingStatus),
            default: OnboardingStatus.NOT_STARTED,
            index: true,
        },
        onboardingCompletedAt: Date,
        metrics: {
            totalProjects: {
                type: Number,
                default: 0,
            },
            activeProjects: {
                type: Number,
                default: 0,
            },
            completedProjects: {
                type: Number,
                default: 0,
            },
            totalRevenue: {
                type: Number,
                default: 0,
            },
            overdueInvoices: {
                type: Number,
                default: 0,
            },
            lastActivityDate: Date,
            lastLoginDate: Date,
            healthScore: {
                type: Number,
                default: 100,
                min: 0,
                max: 100,
            },
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'low',
            },
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        isOnline: {
            type: Boolean,
            default: false,
            index: true,
        },
        lastSeenAt: Date,
    },
    {
        timestamps: true,
    }
);


const User = (mongoose.models?.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;