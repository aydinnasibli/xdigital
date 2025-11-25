// app/actions/admin/projects.ts
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth/admin';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import { createNotification } from '@/lib/services/notification.service';
import { NotificationType } from '@/models/Notification';
import { escapeRegex } from '@/lib/utils';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all projects across all clients
export async function getAllProjects(filters?: {
    status?: string;
    serviceType?: string;
    clientId?: string;
    search?: string;
}): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const query: any = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.serviceType) {
            query.serviceType = filters.serviceType;
        }

        if (filters?.clientId && mongoose.Types.ObjectId.isValid(filters.clientId)) {
            query.userId = filters.clientId;
        }

        if (filters?.search) {
            const escapedSearch = escapeRegex(filters.search);
            query.$or = [
                { projectName: { $regex: escapedSearch, $options: 'i' } },
                { projectDescription: { $regex: escapedSearch, $options: 'i' } },
            ];
        }

        const projects = await Project.find(query)
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        const serializedProjects = projects.map(project => {
            type PopulatedUser = { _id: mongoose.Types.ObjectId; email: string; firstName?: string; lastName?: string };
            const user = project.userId as unknown as PopulatedUser;

            return {
                ...toSerializedObject<Record<string, unknown>>(project),
                userId: user._id.toString(),
                clientEmail: user.email,
                clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
            };
        });

        return { success: true, data: serializedProjects };
    } catch (error) {
        logError(error as Error, { context: 'getAllProjects', filters });
        return { success: false, error: 'Failed to fetch projects' };
    }
}

// Get single project (admin view with full details)
export async function getAdminProject(projectId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const project = await Project.findById(projectId)
            .populate('userId', 'email firstName lastName clerkId')
            .lean();

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        // Type-safe handling of populated fields
        type PopulatedUser = { _id: mongoose.Types.ObjectId; email: string; firstName?: string; lastName?: string; clerkId: string };
        const user = project.userId as unknown as PopulatedUser;

        const serializedProject = {
            ...toSerializedObject<Record<string, unknown>>(project),
            userId: user._id.toString(),
            client: {
                id: user._id.toString(),
                email: user.email,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                clerkId: user.clerkId,
            },
        };

        return { success: true, data: serializedProject };
    } catch (error) {
        logError(error as Error, { context: 'getAdminProject', projectId });
        return { success: false, error: 'Failed to fetch project' };
    }
}

// Update project status
export async function updateProjectStatus(
    projectId: string,
    status: string
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { status },
            { new: true }
        ).lean();

        if (!updatedProject) {
            return { success: false, error: 'Project not found' };
        }

        // Send notification to client about status change
        await createNotification({
            userId: updatedProject.clerkUserId,
            projectId: projectId,
            type: NotificationType.PROJECT_UPDATE,
            title: 'Project Status Updated',
            message: `Your project "${updatedProject.projectName}" status has been updated to: ${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            link: `/dashboard/projects/${projectId}`,
            sendEmail: true,
            emailSubject: `Project Status Update - ${updatedProject.projectName}`,
        });

        revalidatePath('/admin/projects');
        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath('/dashboard/projects');
        revalidatePath(`/dashboard/projects/${projectId}`);

        return {
            success: true,
            data: toSerializedObject(updatedProject),
        };
    } catch (error) {
        logError(error as Error, { context: 'updateProjectStatus', projectId, status });
        return { success: false, error: 'Failed to update project status' };
    }
}

// Update project details (admin can edit everything)
export async function updateAdminProject(
    projectId: string,
    updates: {
        projectName?: string;
        projectDescription?: string;
        serviceType?: string;
        package?: string;
        status?: string;
        timeline?: {
            startDate?: Date;
            estimatedCompletion?: Date;
            completedDate?: Date;
        };
    }
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $set: updates },
            { new: true }
        ).lean();

        if (!updatedProject) {
            return { success: false, error: 'Project not found' };
        }

        // If status was updated, notify the client
        if (updates.status) {
            await createNotification({
                userId: updatedProject.clerkUserId,
                projectId: projectId,
                type: NotificationType.PROJECT_UPDATE,
                title: 'Project Updated',
                message: `Your project "${updatedProject.projectName}" has been updated by the admin.`,
                link: `/dashboard/projects/${projectId}`,
                sendEmail: true,
                emailSubject: `Project Update - ${updatedProject.projectName}`,
            });
        }

        revalidatePath('/admin/projects');
        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath('/dashboard/projects');
        revalidatePath(`/dashboard/projects/${projectId}`);

        return {
            success: true,
            data: toSerializedObject(updatedProject),
        };
    } catch (error) {
        logError(error as Error, { context: 'updateAdminProject', projectId });
        return { success: false, error: 'Failed to update project' };
    }
}

// Add milestone to project
export async function addMilestone(
    projectId: string,
    milestone: {
        title: string;
        description?: string;
        dueDate?: Date;
    }
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                $push: {
                    milestones: {
                        ...milestone,
                        completed: false,
                    },
                },
            },
            { new: true }
        ).lean();

        if (!updatedProject) {
            return { success: false, error: 'Project not found' };
        }

        // Notify client about new milestone
        await createNotification({
            userId: updatedProject.clerkUserId,
            projectId: projectId,
            type: NotificationType.MILESTONE,
            title: 'New Milestone Added',
            message: `A new milestone "${milestone.title}" has been added to your project "${updatedProject.projectName}"${milestone.dueDate ? ` - Due: ${new Date(milestone.dueDate).toLocaleDateString()}` : ''}`,
            link: `/dashboard/projects/${projectId}`,
            sendEmail: true,
            emailSubject: `New Milestone - ${updatedProject.projectName}`,
        });

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/dashboard/projects/${projectId}`);

        return { success: true, data: toSerializedObject(updatedProject) };
    } catch (error) {
        logError(error as Error, { context: 'addMilestone', projectId, milestoneTitle: milestone.title });
        return { success: false, error: 'Failed to add milestone' };
    }
}

// Update milestone
export async function updateMilestone(
    projectId: string,
    milestoneIndex: number,
    updates: {
        title?: string;
        description?: string;
        dueDate?: Date;
        completed?: boolean;
    }
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const project = await Project.findById(projectId);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        if (!project.milestones || milestoneIndex >= project.milestones.length) {
            return { success: false, error: 'Milestone not found' };
        }

        const milestone = project.milestones[milestoneIndex];
        const wasCompleted = milestone.completed;

        // Update the milestone
        Object.assign(project.milestones[milestoneIndex], updates);

        // If marking as completed, set completedDate and notify client
        if (updates.completed && !wasCompleted) {
            project.milestones[milestoneIndex].completedDate = new Date();

            // Notify client about milestone completion
            await createNotification({
                userId: project.clerkUserId,
                projectId: projectId,
                type: NotificationType.MILESTONE,
                title: 'Milestone Completed',
                message: `Milestone "${milestone.title}" has been completed for your project "${project.projectName}"`,
                link: `/dashboard/projects/${projectId}`,
                sendEmail: true,
                emailSubject: `Milestone Completed - ${project.projectName}`,
            });
        }

        await project.save();

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/dashboard/projects/${projectId}`);

        return { success: true, data: toSerializedObject(project) };
    } catch (error) {
        logError(error as Error, { context: 'updateMilestone', projectId, milestoneIndex });
        return { success: false, error: 'Failed to update milestone' };
    }
}

// Bulk update projects
export async function bulkUpdateProjects(
    projectIds: string[],
    updates: { status?: string }
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const validIds = projectIds.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return { success: false, error: 'No valid project IDs provided' };
        }

        await dbConnect();

        // Get projects before updating so we can notify clients
        const projects = await Project.find({ _id: { $in: validIds } }).lean();

        await Project.updateMany(
            { _id: { $in: validIds } },
            { $set: updates }
        );

        // Send notifications to clients if status was updated
        if (updates.status) {
            const statusFormatted = updates.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Send notification to each affected client
            const notificationPromises = projects.map(project =>
                createNotification({
                    userId: project.clerkUserId,
                    projectId: project._id.toString(),
                    type: NotificationType.PROJECT_UPDATE,
                    title: 'Project Status Updated',
                    message: `Your project "${project.projectName}" status has been updated to: ${statusFormatted}`,
                    link: `/dashboard/projects/${project._id}`,
                    sendEmail: true,
                    emailSubject: `Project Status Update - ${project.projectName}`,
                })
            );

            // Send all notifications in parallel
            await Promise.allSettled(notificationPromises);
        }

        revalidatePath('/admin/projects');
        revalidatePath('/dashboard/projects');

        return { success: true, data: { updated: validIds.length } };
    } catch (error) {
        logError(error as Error, { context: 'bulkUpdateProjects', projectIds, updates });
        return { success: false, error: 'Failed to bulk update projects' };
    }
}

// Get project statistics for admin dashboard
export async function getAdminProjectStats(): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const [total, pending, inProgress, completed, thisMonth] = await Promise.all([
            Project.countDocuments(),
            Project.countDocuments({ status: 'pending' }),
            Project.countDocuments({ status: 'in_progress' }),
            Project.countDocuments({ status: 'completed' }),
            Project.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            }),
        ]);

        return {
            success: true,
            data: {
                total,
                pending,
                inProgress,
                completed,
                thisMonth,
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getAdminProjectStats' });
        return { success: false, error: 'Failed to fetch project stats' };
    }
}