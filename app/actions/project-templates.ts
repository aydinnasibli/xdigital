// app/actions/project-templates.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import ProjectTemplate from '@/models/ProjectTemplate';
import Project from '@/models/Project';
import Task from '@/models/Task';
import User from '@/models/User';
import mongoose from 'mongoose';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all templates
export async function getTemplates(serviceType?: string, packageType?: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = { isActive: true };
        if (serviceType) query.serviceType = serviceType;
        if (packageType) query.package = packageType;

        const templates = await ProjectTemplate.find(query)
            .populate('createdBy', 'firstName lastName email')
            .sort({ isDefault: -1, usageCount: -1 })
            .lean();

        const serializedTemplates = templates.map(template => ({
            ...template,
            _id: template._id.toString(),
            createdBy: template.createdBy ? {
                ...template.createdBy,
                _id: template.createdBy._id.toString(),
            } : null,
        }));

        return { success: true, data: serializedTemplates };
    } catch (error) {
        console.error('Error fetching templates:', error);
        return { success: false, error: 'Failed to fetch templates' };
    }
}

// Get templates based on package hierarchy
// Premium sees all, Standard sees Basic+Standard, Basic sees only Basic
export async function getTemplatesByPackage(serviceType: string, packageType: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        // Define package hierarchy
        const packageHierarchy: { [key: string]: string[] } = {
            basic: ['basic'],
            standard: ['basic', 'standard'],
            premium: ['basic', 'standard', 'premium'],
            enterprise: ['basic', 'standard', 'premium', 'enterprise'],
        };

        const allowedPackages = packageHierarchy[packageType.toLowerCase()] || [packageType];

        const templates = await ProjectTemplate.find({
            isActive: true,
            serviceType,
            $or: [
                { availableForPackages: { $in: allowedPackages } },
                { package: { $in: allowedPackages } }, // Fallback for old templates
            ],
        })
            .populate('createdBy', 'firstName lastName email')
            .sort({ isDefault: -1, usageCount: -1 })
            .lean();

        const serializedTemplates = templates.map(template => ({
            ...template,
            _id: template._id.toString(),
            createdBy: template.createdBy ? {
                ...template.createdBy,
                _id: template.createdBy._id.toString(),
            } : null,
        }));

        return { success: true, data: serializedTemplates };
    } catch (error) {
        console.error('Error fetching templates by package:', error);
        return { success: false, error: 'Failed to fetch templates' };
    }
}

// Get single template
export async function getTemplate(templateId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const template = await ProjectTemplate.findById(templateId)
            .populate('createdBy', 'firstName lastName email')
            .lean();

        if (!template) {
            return { success: false, error: 'Template not found' };
        }

        return {
            success: true,
            data: {
                ...template,
                _id: template._id.toString(),
                createdBy: template.createdBy ? {
                    ...template.createdBy,
                    _id: template.createdBy._id.toString(),
                } : null,
            },
        };
    } catch (error) {
        console.error('Error fetching template:', error);
        return { success: false, error: 'Failed to fetch template' };
    }
}

// Create template (admin only)
export async function createTemplate(data: {
    name: string;
    description?: string;
    serviceType: string;
    package: string;
    category?: string;
    githubRepoUrl?: string;
    demoUrl?: string;
    screenshots?: string[];
    features?: string[];
    availableForPackages?: string[];
    estimatedDurationDays: number;
    milestones: any[];
    deliverables: any[];
    tasks: any[];
    isDefault?: boolean;
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

        const template = await ProjectTemplate.create({
            ...data,
            createdBy: user._id,
        });

        revalidatePath('/admin/templates');

        return {
            success: true,
            data: {
                ...template.toObject(),
                _id: template._id.toString(),
            },
        };
    } catch (error) {
        console.error('Error creating template:', error);
        return { success: false, error: 'Failed to create template' };
    }
}

// Update template (admin only)
export async function updateTemplate(templateId: string, data: Partial<{
    name: string;
    description: string;
    estimatedDurationDays: number;
    milestones: any[];
    deliverables: any[];
    tasks: any[];
    isActive: boolean;
    isDefault: boolean;
}>): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const template = await ProjectTemplate.findByIdAndUpdate(
            templateId,
            data,
            { new: true }
        );

        if (!template) {
            return { success: false, error: 'Template not found' };
        }

        revalidatePath('/admin/templates');

        return { success: true, data: template.toObject() };
    } catch (error) {
        console.error('Error updating template:', error);
        return { success: false, error: 'Failed to update template' };
    }
}

// Delete template (admin only)
export async function deleteTemplate(templateId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        // Soft delete by marking as inactive
        const template = await ProjectTemplate.findByIdAndUpdate(
            templateId,
            { isActive: false },
            { new: true }
        );

        if (!template) {
            return { success: false, error: 'Template not found' };
        }

        revalidatePath('/admin/templates');

        return { success: true };
    } catch (error) {
        console.error('Error deleting template:', error);
        return { success: false, error: 'Failed to delete template' };
    }
}

// Create project from template
export async function createProjectFromTemplate(
    templateId: string,
    projectData: {
        projectName: string;
        projectDescription: string;
        startDate?: Date;
    }
): Promise<ActionResponse> {
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

        const template = await ProjectTemplate.findById(templateId);
        if (!template) {
            return { success: false, error: 'Template not found' };
        }

        const startDate = projectData.startDate || new Date();
        const estimatedCompletion = new Date(startDate);
        estimatedCompletion.setDate(estimatedCompletion.getDate() + template.estimatedDurationDays);

        // Create project with milestones from template
        const milestones = template.milestones.map(m => {
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + m.daysFromStart);

            return {
                title: m.title,
                description: m.description,
                dueDate,
                completed: false,
            };
        });

        const project = await Project.create({
            userId: user._id,
            clerkUserId,
            projectName: projectData.projectName,
            projectDescription: projectData.projectDescription,
            serviceType: template.serviceType,
            package: template.package,
            status: 'pending',
            timeline: {
                startDate,
                estimatedCompletion,
            },
            milestones,
            deliverables: template.deliverables.map(d => d.title),
        });

        // Create tasks from template
        const tasks = template.tasks.map((t, index) => ({
            projectId: project._id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            estimatedHours: t.estimatedHours,
            order: t.order || index,
            createdBy: user._id,
        }));

        if (tasks.length > 0) {
            await Task.insertMany(tasks);
        }

        // Update template usage stats
        template.usageCount += 1;
        template.lastUsedAt = new Date();
        await template.save();

        revalidatePath('/dashboard/projects');

        return {
            success: true,
            data: {
                ...project.toObject(),
                _id: project._id.toString(),
            },
        };
    } catch (error) {
        console.error('Error creating project from template:', error);
        return { success: false, error: 'Failed to create project from template' };
    }
}

// Clone existing project as template (admin only)
export async function cloneProjectAsTemplate(
    projectId: string,
    templateData: {
        name: string;
        description?: string;
        isDefault?: boolean;
    }
): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const project = await Project.findById(projectId);

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        // Get all tasks for this project
        const tasks = await Task.find({ projectId }).lean();

        // Calculate duration from project timeline
        const duration = project.timeline?.estimatedCompletion && project.timeline?.startDate
            ? Math.ceil((new Date(project.timeline.estimatedCompletion).getTime() - new Date(project.timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))
            : 30;

        // Convert milestones to template format
        const templateMilestones = (project.milestones || []).map((m, index) => ({
            title: m.title,
            description: m.description,
            daysFromStart: index * Math.floor(duration / (project.milestones?.length || 1)),
            order: index,
        }));

        // Convert deliverables to template format
        const templateDeliverables = (project.deliverables || []).map(d => ({
            title: d,
            description: '',
            category: 'other',
        }));

        // Convert tasks to template format
        const templateTasks = tasks.map((t, index) => ({
            title: t.title,
            description: t.description,
            status: 'todo',
            priority: t.priority,
            estimatedHours: t.estimatedHours,
            order: t.order || index,
        }));

        const template = await ProjectTemplate.create({
            name: templateData.name,
            description: templateData.description,
            serviceType: project.serviceType,
            package: project.package,
            estimatedDurationDays: duration,
            milestones: templateMilestones,
            deliverables: templateDeliverables,
            tasks: templateTasks,
            isDefault: templateData.isDefault || false,
            createdBy: user!._id,
        });

        revalidatePath('/admin/templates');

        return {
            success: true,
            data: {
                ...template.toObject(),
                _id: template._id.toString(),
            },
        };
    } catch (error) {
        console.error('Error cloning project as template:', error);
        return { success: false, error: 'Failed to clone project as template' };
    }
}
