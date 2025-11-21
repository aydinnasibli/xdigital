'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Analytics from '@/models/Analytics';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get stored analytics for a project (from Analytics model/database)
// NOTE: This is different from monitoring.ts getProjectAnalytics which fetches live Google Analytics data
// This function reads historical analytics stored in the database
export async function getStoredProjectAnalytics(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const analytics = await Analytics.find({ projectId, userId: user._id })
            .sort({ recordedDate: -1 })
            .lean();

        const serializedAnalytics = analytics.map(item =>
            toSerializedObject(item)
        );

        // Calculate summary stats
        const summary = {
            pageViews: analytics
                .filter((a) => a.metricType === 'page_views')
                .reduce((sum, a) => sum + a.value, 0),
            visitors: analytics
                .filter((a) => a.metricType === 'visitors')
                .reduce((sum, a) => sum + a.value, 0),
            conversions: analytics
                .filter((a) => a.metricType === 'conversions')
                .reduce((sum, a) => sum + a.value, 0),
            engagement: analytics
                .filter((a) => a.metricType === 'engagement')
                .reduce((sum, a) => sum + a.value, 0),
        };

        return {
            success: true,
            data: {
                analytics: serializedAnalytics,
                summary,
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getProjectAnalytics', projectId });
        return { success: false, error: 'Failed to fetch analytics' };
    }
}