// app/actions/projects.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import mongoose from 'mongoose';

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
        const serializedProjects = projects.map(project => ({
            ...project,
            _id: project._id.toString(),
            userId: project.userId.toString(),
        }));

        return { success: true, data: serializedProjects };
    } catch (error) {
        console.error('Error fetching projects:', error);
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
        const serializedProject = {
            ...project,
            _id: project._id.toString(),
            userId: project.userId.toString(),
        };

        return { success: true, data: serializedProject };
    } catch (error) {
        console.error('Error fetching project:', error);
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

        const { projectName, projectDescription, serviceType, package: packageType } = formData;

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
        });

        // Revalidate the projects page
        revalidatePath('/dashboard/projects');
        revalidatePath('/dashboard');

        return {
            success: true,
            data: {
                ...newProject.toObject(),
                _id: newProject._id.toString(),
                userId: newProject.userId.toString(),
            },
        };
    } catch (error) {
        console.error('Error creating project:', error);
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
        console.error('Error deleting project:', error);
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

        const recentProjects = projects.slice(0, 5).map(project => ({
            ...project,
            _id: project._id.toString(),
            userId: project.userId.toString(),
        }));

        return { success: true, data: { stats, recentProjects } };
    } catch (error) {
        console.error('Error fetching project stats:', error);
        return { success: false, error: 'Failed to fetch project stats' };
    }
}