// app/actions/feedback.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Feedback, { FeedbackType, FeedbackStatus } from '@/models/Feedback';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all feedback (admin only)
export async function getAllFeedback(filters?: {
    type?: FeedbackType;
    status?: FeedbackStatus;
    projectId?: string;
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = {};
        if (filters) {
            if (filters.type) query.type = filters.type;
            if (filters.status) query.status = filters.status;
            if (filters.projectId) query.projectId = filters.projectId;
        }

        const feedbacks = await Feedback.find(query)
            .populate('userId', 'firstName lastName email imageUrl')
            .populate('projectId', 'projectName')
            .sort({ createdAt: -1 })
            .lean();

        const serializedFeedback = feedbacks.map(fb => ({
            ...fb,
            _id: fb._id.toString(),
            userId: fb.userId.toString(),
            projectId: fb.projectId?.toString(),
        }));

        return { success: true, data: serializedFeedback };
    } catch (error) {
        logError(error as Error, { context: 'getAllFeedback', filters });
        return { success: false, error: 'Failed to fetch feedback' };
    }
}

// Get user's feedback
export async function getUserFeedback(): Promise<ActionResponse> {
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

        const feedbacks = await Feedback.find({ userId: user._id })
            .populate('projectId', 'projectName')
            .sort({ createdAt: -1 })
            .lean();

        const serializedFeedback = feedbacks.map(fb => ({
            ...fb,
            _id: fb._id.toString(),
            userId: fb.userId.toString(),
            projectId: fb.projectId?.toString(),
        }));

        return { success: true, data: serializedFeedback };
    } catch (error) {
        logError(error as Error, { context: 'getUserFeedback' });
        return { success: false, error: 'Failed to fetch feedback' };
    }
}

// Submit feedback
export async function submitFeedback(data: {
    type: FeedbackType;
    projectId?: string;
    milestoneId?: string;
    npsScore?: number;
    overallRating?: number;
    ratings?: {
        communication?: number;
        quality?: number;
        timeliness?: number;
        professionalism?: number;
        valueForMoney?: number;
    };
    testimonial?: string;
    surveyQuestions?: any[];
    title?: string;
    comment?: string;
    wouldRecommend?: boolean;
    improvements?: string;
    highlights?: string;
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

        const feedback = await Feedback.create({
            ...data,
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
            userEmail: user.email,
            userImageUrl: user.imageUrl,
            status: FeedbackStatus.SUBMITTED,
            submittedAt: new Date(),
        });

        revalidatePath('/dashboard/feedback');
        if (data.projectId) {
            revalidatePath(`/dashboard/projects/${data.projectId}`);
        }

        return {
            success: true,
            data: {
                ...toSerializedObject(feedback),
                _id: feedback._id.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'submitFeedback', type: data.type, projectId: data.projectId });
        return { success: false, error: 'Failed to submit feedback' };
    }
}

// Approve testimonial (admin only)
export async function approveTestimonial(feedbackId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const feedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            {
                status: FeedbackStatus.APPROVED,
                isPublicTestimonial: true,
                testimonialApprovedAt: new Date(),
            },
            { new: true }
        );

        if (!feedback) {
            return { success: false, error: 'Feedback not found' };
        }

        revalidatePath('/admin/feedback');

        return { success: true, data: toSerializedObject(feedback) };
    } catch (error) {
        logError(error as Error, { context: 'approveTestimonial', feedbackId });
        return { success: false, error: 'Failed to approve testimonial' };
    }
}

// Reject testimonial (admin only)
export async function rejectTestimonial(feedbackId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const feedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            {
                status: FeedbackStatus.REJECTED,
                isPublicTestimonial: false,
            },
            { new: true }
        );

        if (!feedback) {
            return { success: false, error: 'Feedback not found' };
        }

        revalidatePath('/admin/feedback');

        return { success: true, data: toSerializedObject(feedback) };
    } catch (error) {
        logError(error as Error, { context: 'rejectTestimonial', feedbackId });
        return { success: false, error: 'Failed to reject testimonial' };
    }
}

// Add admin response to feedback
export async function addAdminResponse(feedbackId: string, response: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return { success: false, error: 'Feedback not found' };
        }

        feedback.adminResponse = {
            userId: user!._id,
            userName: `${user!.firstName} ${user!.lastName}`.trim() || user!.email,
            response,
            respondedAt: new Date(),
        };

        await feedback.save();

        revalidatePath('/admin/feedback');

        return { success: true, data: toSerializedObject(feedback) };
    } catch (error) {
        logError(error as Error, { context: 'addAdminResponse', feedbackId });
        return { success: false, error: 'Failed to add response' };
    }
}

// Get public testimonials
export async function getPublicTestimonials(limit: number = 10): Promise<ActionResponse> {
    try {
        await dbConnect();

        const testimonials = await Feedback.find({
            isPublicTestimonial: true,
            status: FeedbackStatus.APPROVED,
        })
            .select('userName userImageUrl testimonial overallRating createdAt projectId')
            .populate('projectId', 'projectName serviceType')
            .sort({ testimonialApprovedAt: -1 })
            .limit(limit)
            .lean();

        const serializedTestimonials = testimonials.map(t => ({
            ...t,
            _id: t._id.toString(),
            projectId: t.projectId?.toString(),
        }));

        return { success: true, data: serializedTestimonials };
    } catch (error) {
        logError(error as Error, { context: 'getPublicTestimonials', limit });
        return { success: false, error: 'Failed to fetch testimonials' };
    }
}

// Get NPS statistics (admin only)
export async function getNPSStats(startDate?: Date, endDate?: Date): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = {
            type: FeedbackType.NPS_SURVEY,
            status: FeedbackStatus.SUBMITTED,
            npsScore: { $exists: true },
        };

        if (startDate || endDate) {
            query.submittedAt = {};
            if (startDate) query.submittedAt.$gte = startDate;
            if (endDate) query.submittedAt.$lte = endDate;
        }

        const npsResponses = await Feedback.find(query).select('npsScore').lean();

        const promoters = npsResponses.filter(r => r.npsScore! >= 9).length;
        const passives = npsResponses.filter(r => r.npsScore! >= 7 && r.npsScore! <= 8).length;
        const detractors = npsResponses.filter(r => r.npsScore! <= 6).length;
        const total = npsResponses.length;

        const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

        return {
            success: true,
            data: {
                npsScore,
                total,
                promoters,
                passives,
                detractors,
                promoterPercentage: total > 0 ? Math.round((promoters / total) * 100) : 0,
                passivePercentage: total > 0 ? Math.round((passives / total) * 100) : 0,
                detractorPercentage: total > 0 ? Math.round((detractors / total) * 100) : 0,
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getNPSStats', startDate, endDate });
        return { success: false, error: 'Failed to calculate NPS stats' };
    }
}
