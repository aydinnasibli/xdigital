// app/actions/activities.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Activity, { ActivityType, ActivityEntity } from '@/models/Activity';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Log an activity
export async function logActivity(data: {
    type: ActivityType;
    entityType: ActivityEntity;
    entityId?: string;
    projectId?: string;
    title: string;
    description?: string;
    metadata?: any;
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const activity = await Activity.create({
            ...data,
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
            userImageUrl: user.imageUrl,
        });

        return { success: true, data: toSerializedObject(activity) };
    } catch (error) {
        logError(error as Error, { context: 'logActivity', data });
        return { success: false, error: 'Failed to log activity' };
    }
}

// Get activities for a project
export async function getProjectActivities(projectId: string, limit: number = 50): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const activities = await Activity.find({ projectId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const serializedActivities = activities.map(activity => {
            const baseActivity = toSerializedObject(activity);
            return {
            ...baseActivity,activity,
            _id: activity._id.toString(),
            userId: activity.userId.toString(),
            projectId: activity.projectId?.toString(),
            entityId: activity.entityId?.toString(),
                    };
        });

        return { success: true, data: serializedActivities };
    } catch (error) {
        logError(error as Error, { context: 'getProjectActivities', projectId });
        return { success: false, error: 'Failed to fetch activities' };
    }
}

// Get activities for a user
export async function getUserActivities(limit: number = 50): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const activities = await Activity.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const serializedActivities = activities.map(activity => {
            const baseActivity = toSerializedObject(activity);
            return {
            ...baseActivity,activity,
            _id: activity._id.toString(),
            userId: activity.userId.toString(),
            projectId: activity.projectId?.toString(),
            entityId: activity.entityId?.toString(),
                    };
        });

        return { success: true, data: serializedActivities };
    } catch (error) {
        logError(error as Error, { context: 'getUserActivities' });
        return { success: false, error: 'Failed to fetch activities' };
    }
}

// Get all activities (admin only)
export async function getAllActivities(filters?: {
    type?: ActivityType;
    entityType?: ActivityEntity;
    startDate?: Date;
    endDate?: Date;
}, limit: number = 100): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = {};

        if (filters) {
            if (filters.type) query.type = filters.type;
            if (filters.entityType) query.entityType = filters.entityType;
            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) query.createdAt.$gte = filters.startDate;
                if (filters.endDate) query.createdAt.$lte = filters.endDate;
            }
        }

        const activities = await Activity.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const serializedActivities = activities.map(activity => {
            const baseActivity = toSerializedObject(activity);
            return {
            ...baseActivity,activity,
            _id: activity._id.toString(),
            userId: activity.userId.toString(),
            projectId: activity.projectId?.toString(),
            entityId: activity.entityId?.toString(),
                    };
        });

        return { success: true, data: serializedActivities };
    } catch (error) {
        logError(error as Error, { context: 'getAllActivities', filters });
        return { success: false, error: 'Failed to fetch activities' };
    }
}
