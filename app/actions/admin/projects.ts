// app/actions/admin/projects.ts
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth/admin';
import mongoose from 'mongoose';

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
            query.$or = [
                { projectName: { $regex: filters.search, $options: 'i' } },
                { projectDescription: { $regex: filters.search, $options: 'i' } },
            ];
        }

        const projects = await Project.find(query)
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        const serializedProjects = projects.map(project => ({
            ...project,
            _id: project._id.toString(),
            userId: project.userId._id.toString(),
            clientEmail: project.userId.email,
            clientName: `${project.userId.firstName || ''} ${project.userId.lastName || ''}`.trim() || 'N/A',
        }));

        return { success: true, data: serializedProjects };
    } catch (error) {
        console.error('Error fetching all projects:', error);
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

        const serializedProject = {
            ...project,
            _id: project._id.toString(),
            userId: project.userId._id.toString(),
            client: {
                id: project.userId._id.toString(),
                email: project.userId.email,
                name: `${project.userId.firstName || ''} ${project.userId.lastName || ''}`.trim(),
                clerkId: project.userId.clerkId,
            },
        };

        return { success: true, data: serializedProject };
    } catch (error) {
        console.error('Error fetching admin project:', error);
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

        revalidatePath('/admin/projects');
        revalidatePath(`/admin/projects/${projectId}`);

        return {
            success: true,
            data: {
                ...updatedProject,
                _id: updatedProject._id.toString(),
                userId: updatedProject.userId.toString(),
            },
        };
    } catch (error) {
        console.error('Error updating project status:', error);
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
        deliverables?: string[];
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

        revalidatePath('/admin/projects');
        revalidatePath(`/admin/projects/${projectId}`);

        return {
            success: true,
            data: {
                ...updatedProject,
                _id: updatedProject._id.toString(),
                userId: updatedProject.userId.toString(),
            },
        };
    } catch (error) {
        console.error('Error updating project:', error);
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

        revalidatePath(`/admin/projects/${projectId}`);

        return { success: true, data: updatedProject };
    } catch (error) {
        console.error('Error adding milestone:', error);
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

        // Update the milestone
        Object.assign(project.milestones[milestoneIndex], updates);

        // If marking as completed, set completedDate
        if (updates.completed) {
            project.milestones[milestoneIndex].completedDate = new Date();
        }

        await project.save();

        revalidatePath(`/admin/projects/${projectId}`);

        return { success: true, data: project.toObject() };
    } catch (error) {
        console.error('Error updating milestone:', error);
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

        await Project.updateMany(
            { _id: { $in: validIds } },
            { $set: updates }
        );

        revalidatePath('/admin/projects');

        return { success: true, data: { updated: validIds.length } };
    } catch (error) {
        console.error('Error bulk updating projects:', error);
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
        console.error('Error fetching admin project stats:', error);
        return { success: false, error: 'Failed to fetch project stats' };
    }
}