// app/actions/projects.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import { requireAdmin } from '@/lib/auth/admin';

// Type definitions
type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

type ProjectFormData = {
    projectName: string;
    projectDescription: string;
    serviceType: string;
    package: string;
    templateId?: string;
    customization?: {
        businessName?: string;
        industry?: string;
        brandColors?: {
            primary?: string;
            secondary?: string;
            accent?: string;
        };
        logoUrl?: string;
        contactInfo?: {
            email?: string;
            phone?: string;
            address?: string;
        };
        socialMedia?: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
        };
        specialRequirements?: string;
    };
};

// Get all projects for current user
export async function getProjects(): Promise<ActionResponse> {
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

        const projects = await Project.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Convert _id to string for serialization
        const serializedProjects = projects.map(project =>
            toSerializedObject(project)
        );

        return { success: true, data: serializedProjects };
    } catch (error) {
        logError(error as Error, { context: 'getProjects' });
        return { success: false, error: 'Failed to fetch projects' };
    }
}

// Get single project by ID
export async function getProject(projectId: string): Promise<ActionResponse> {
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

        const project = await Project.findOne({
            _id: projectId,
            userId: user._id,
        }).lean();

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        // Serialize the project
        return { success: true, data: toSerializedObject(project) };
    } catch (error) {
        logError(error as Error, { context: 'getProject', projectId });
        return { success: false, error: 'Failed to fetch project' };
    }
}

// Create new project
export async function createProject(formData: ProjectFormData): Promise<ActionResponse> {
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

        const { projectName, projectDescription, serviceType, package: packageType, templateId, customization } = formData;

        // Validate required fields
        if (!projectName || !projectDescription || !serviceType || !packageType) {
            return { success: false, error: 'Missing required fields' };
        }

        // Create new project
        const newProject = await Project.create({
            userId: user._id,
            clerkUserId: clerkUserId,
            projectName,
            projectDescription,
            serviceType,
            package: packageType,
            status: 'pending',
            templateId: templateId || undefined,
            customization: customization || undefined,
        });

        // Revalidate the projects page
        revalidatePath('/dashboard/projects');
        revalidatePath('/dashboard');

        return {
            success: true,
            data: {
                ...toSerializedObject(newProject),
                _id: newProject._id.toString(),
                userId: newProject.userId.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'createProject', projectName: formData.projectName });
        return { success: false, error: 'Failed to create project' };
    }
}

// Update project
export async function updateProject(
    projectId: string,
    formData: ProjectFormData
): Promise<ActionResponse> {
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

        const { projectName, projectDescription, serviceType, package: packageType } = formData;

        const updatedProject = await Project.findOneAndUpdate(
            { _id: projectId, userId: user._id },
            {
                projectName,
                projectDescription,
                serviceType,
                package: packageType,
            },
            { new: true }
        ).lean();

        if (!updatedProject) {
            return { success: false, error: 'Project not found' };
        }

        // Revalidate relevant paths
        revalidatePath('/dashboard/projects');
        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath('/dashboard');

        return {
            success: true,
            data: toSerializedObject(updatedProject),
        };
    } catch (error) {
        logError(error as Error, { context: 'updateProject', projectId });
        return { success: false, error: 'Failed to update project' };
    }
}

// Delete project
export async function deleteProject(projectId: string): Promise<ActionResponse> {
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

        const deletedProject = await Project.findOneAndDelete({
            _id: projectId,
            userId: user._id,
        });

        if (!deletedProject) {
            return { success: false, error: 'Project not found' };
        }

        // Revalidate relevant paths
        revalidatePath('/dashboard/projects');
        revalidatePath('/dashboard');

        return { success: true, data: { message: 'Project deleted successfully' } };
    } catch (error) {
        logError(error as Error, { context: 'deleteProject', projectId });
        return { success: false, error: 'Failed to delete project' };
    }
}

// Get project statistics for dashboard
export async function getProjectStats() {
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

        const projects = await Project.find({ userId: user._id }).lean();

        const stats = {
            total: projects.length,
            pending: projects.filter(p => p.status === 'pending').length,
            inProgress: projects.filter(p => p.status === 'in_progress').length,
            completed: projects.filter(p => p.status === 'completed').length,
        };

        const recentProjects = projects.slice(0, 5).map(project =>
            toSerializedObject(project)
        );

        return { success: true, data: { stats, recentProjects } };
    } catch (error) {
        logError(error as Error, { context: 'getProjectStats' });
        return { success: false, error: 'Failed to fetch project stats' };
    }
}

// Update project deployment information (admin only)
export async function updateProjectDeployment(
    projectId: string,
    deploymentData: {
        deploymentUrl?: string;
        vercelProjectId?: string;
        googleAnalyticsPropertyId?: string;
    }
): Promise<ActionResponse> {
    try {
        // Verify admin access
        await requireAdmin();

        await dbConnect();

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $set: deploymentData,
            },
            { new: true }
        );

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        revalidatePath('/admin/projects');
        revalidatePath(`/dashboard/projects/${projectId}`);

        return {
            success: true,
            data: {
                ...toSerializedObject(project),
                _id: project._id.toString(),
                userId: project.userId.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'updateProjectDeployment', projectId });
        return { success: false, error: 'Failed to update deployment information' };
    }
}