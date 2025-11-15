// app/actions/deliverables.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Deliverable, { DeliverableStatus, DeliverableCategory } from '@/models/Deliverable';
import User from '@/models/User';
import mongoose from 'mongoose';
import { logActivity } from './activities';
import { ActivityType, ActivityEntity } from '@/models/Activity';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all deliverables for a project
export async function getProjectDeliverables(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const deliverables = await Deliverable.find({ projectId })
            .populate('createdBy', 'firstName lastName email imageUrl')
            .sort({ createdAt: -1 })
            .lean();

        const serializedDeliverables = deliverables.map(del => ({
            ...del,
            _id: del._id.toString(),
            projectId: del.projectId.toString(),
            createdBy: {
                ...del.createdBy,
                _id: del.createdBy._id.toString(),
            },
        }));

        return { success: true, data: serializedDeliverables };
    } catch (error) {
        console.error('Error fetching deliverables:', error);
        return { success: false, error: 'Failed to fetch deliverables' };
    }
}

// Create deliverable
export async function createDeliverable(data: {
    projectId: string;
    milestoneId?: string;
    taskId?: string;
    title: string;
    description?: string;
    category: DeliverableCategory;
    dueDate?: Date;
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

        const deliverable = await Deliverable.create({
            ...data,
            createdBy: user._id,
            status: DeliverableStatus.DRAFT,
        });

        await logActivity({
            type: ActivityType.DELIVERABLE_CREATED,
            entityType: ActivityEntity.DELIVERABLE,
            entityId: deliverable._id.toString(),
            projectId: data.projectId,
            title: `Created deliverable: ${data.title}`,
        });

        revalidatePath(`/dashboard/projects/${data.projectId}`);

        return { success: true, data: deliverable.toObject() };
    } catch (error) {
        console.error('Error creating deliverable:', error);
        return { success: false, error: 'Failed to create deliverable' };
    }
}

// Submit deliverable for review
export async function submitDeliverable(deliverableId: string, fileUrl: string, fileName: string, notes?: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const deliverable = await Deliverable.findById(deliverableId);

        if (!deliverable) {
            return { success: false, error: 'Deliverable not found' };
        }

        // Add new revision
        deliverable.currentVersion += 1;
        deliverable.revisions.push({
            versionNumber: deliverable.currentVersion,
            fileUrl,
            fileName,
            uploadedBy: user!._id,
            uploadedAt: new Date(),
            notes,
        });

        deliverable.status = DeliverableStatus.SUBMITTED;
        deliverable.submittedDate = new Date();

        await deliverable.save();

        await logActivity({
            type: ActivityType.DELIVERABLE_SUBMITTED,
            entityType: ActivityEntity.DELIVERABLE,
            entityId: deliverableId,
            projectId: deliverable.projectId.toString(),
            title: `Submitted deliverable: ${deliverable.title} (v${deliverable.currentVersion})`,
        });

        revalidatePath(`/dashboard/projects/${deliverable.projectId}`);

        return { success: true, data: deliverable.toObject() };
    } catch (error) {
        console.error('Error submitting deliverable:', error);
        return { success: false, error: 'Failed to submit deliverable' };
    }
}

// Approve deliverable
export async function approveDeliverable(deliverableId: string, notes?: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const deliverable = await Deliverable.findById(deliverableId);

        if (!deliverable) {
            return { success: false, error: 'Deliverable not found' };
        }

        deliverable.status = DeliverableStatus.APPROVED;
        deliverable.approvedDate = new Date();
        deliverable.approval = {
            approvedBy: user!._id,
            approvedByName: `${user!.firstName} ${user!.lastName}`.trim() || user!.email,
            approvedAt: new Date(),
            notes,
        };

        await deliverable.save();

        await logActivity({
            type: ActivityType.DELIVERABLE_APPROVED,
            entityType: ActivityEntity.DELIVERABLE,
            entityId: deliverableId,
            projectId: deliverable.projectId.toString(),
            title: `Approved deliverable: ${deliverable.title}`,
        });

        revalidatePath(`/dashboard/projects/${deliverable.projectId}`);

        return { success: true, data: deliverable.toObject() };
    } catch (error) {
        console.error('Error approving deliverable:', error);
        return { success: false, error: 'Failed to approve deliverable' };
    }
}

// Request changes on deliverable
export async function requestChanges(deliverableId: string, feedback: string, rating?: number): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const deliverable = await Deliverable.findById(deliverableId);

        if (!deliverable) {
            return { success: false, error: 'Deliverable not found' };
        }

        deliverable.status = DeliverableStatus.CHANGES_REQUESTED;
        deliverable.feedback.push({
            userId: user!._id,
            userName: `${user!.firstName} ${user!.lastName}`.trim() || user!.email,
            comment: feedback,
            rating,
            createdAt: new Date(),
        });

        await deliverable.save();

        await logActivity({
            type: ActivityType.DELIVERABLE_REJECTED,
            entityType: ActivityEntity.DELIVERABLE,
            entityId: deliverableId,
            projectId: deliverable.projectId.toString(),
            title: `Requested changes on deliverable: ${deliverable.title}`,
        });

        revalidatePath(`/dashboard/projects/${deliverable.projectId}`);

        return { success: true, data: deliverable.toObject() };
    } catch (error) {
        console.error('Error requesting changes:', error);
        return { success: false, error: 'Failed to request changes' };
    }
}
