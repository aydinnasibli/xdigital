// app/actions/feedback.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Feedback, { FeedbackType, FeedbackStatus } from '@/models/Feedback';
import User, { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import { createNotifications, createNotification } from '@/lib/services/notification.service';
import { NotificationType } from '@/models/Notification';
import { requireAdmin } from '@/lib/auth/admin';

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

        const serializedFeedback = feedbacks.map(fb => {
            type PopulatedUser = { _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string; email: string; imageUrl?: string };
            type PopulatedProject = { _id: mongoose.Types.ObjectId; projectName: string };

            // Type-safe handling of potentially populated fields
            const userId = typeof fb.userId === 'object' && fb.userId !== null && '_id' in fb.userId
                ? (fb.userId as unknown as PopulatedUser)._id.toString()
                : (fb.userId as mongoose.Types.ObjectId).toString();

            const projectId = fb.projectId
                ? (typeof fb.projectId === 'object' && fb.projectId !== null && '_id' in fb.projectId
                    ? (fb.projectId as unknown as PopulatedProject)._id.toString()
                    : (fb.projectId as mongoose.Types.ObjectId).toString())
                : undefined;

            return {
                ...toSerializedObject<Record<string, unknown>>(fb),
                userId,
                projectId,
            };
        });

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

        const serializedFeedback = feedbacks.map(fb => {
            type PopulatedProject = { _id: mongoose.Types.ObjectId; projectName: string };

            // Handle populated projectId - userId is not populated here
            const projectId = fb.projectId
                ? (typeof fb.projectId === 'object' && fb.projectId !== null && '_id' in fb.projectId
                    ? (fb.projectId as unknown as PopulatedProject)._id.toString()
                    : (fb.projectId as mongoose.Types.ObjectId).toString())
                : undefined;

            return {
                ...toSerializedObject<Record<string, unknown>>(fb),
                projectId,
            };
        });

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

        // Notify all admins about new feedback
        const adminUsers = await User.find({ role: UserRole.ADMIN }).lean();
        const adminClerkIds = adminUsers.map(admin => admin.clerkId);

        if (adminClerkIds.length > 0) {
            const feedbackTypeLabel = data.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            await createNotifications({
                userIds: adminClerkIds,
                projectId: data.projectId,
                type: NotificationType.GENERAL,
                title: 'New Feedback Received',
                message: `${user.firstName || user.email} submitted ${feedbackTypeLabel} feedback${data.title ? `: "${data.title}"` : ''}`,
                link: `/admin/feedback`,
                sendEmail: true,
                emailSubject: `New Feedback - ${feedbackTypeLabel}`,
            });
        }

        revalidatePath('/dashboard/feedback');
        revalidatePath('/admin/feedback');
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
        await requireAdmin();
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
        ).lean();

        if (!feedback) {
            return { success: false, error: 'Feedback not found' };
        }

        // Get user to send notification
        const user = await User.findById(feedback.userId);
        if (user?.clerkId) {
            await createNotification({
                userId: user.clerkId,
                projectId: feedback.projectId?.toString(),
                type: NotificationType.GENERAL,
                title: 'Testimonial Approved',
                message: 'Thank you! Your testimonial has been approved and is now featured on our website.',
                link: `/dashboard/feedback`,
                sendEmail: true,
                emailSubject: 'Your Testimonial Has Been Approved',
            });
        }

        revalidatePath('/admin/feedback');
        revalidatePath('/dashboard/feedback');

        return { success: true, data: toSerializedObject(feedback) };
    } catch (error) {
        logError(error as Error, { context: 'approveTestimonial', feedbackId });
        return { success: false, error: 'Failed to approve testimonial' };
    }
}

// Reject testimonial (admin only)
export async function rejectTestimonial(feedbackId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();
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
        await requireAdmin();
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

        const serializedTestimonials = testimonials.map(t => {
            type PopulatedProject = { _id: mongoose.Types.ObjectId; projectName: string; serviceType: string };

            // Handle populated projectId
            const projectId = t.projectId
                ? (typeof t.projectId === 'object' && t.projectId !== null && '_id' in t.projectId
                    ? (t.projectId as unknown as PopulatedProject)._id.toString()
                    : (t.projectId as mongoose.Types.ObjectId).toString())
                : undefined;

            return {
                ...toSerializedObject<Record<string, unknown>>(t),
                projectId,
            };
        });

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
