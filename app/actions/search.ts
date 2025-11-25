// app/actions/search.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import Message from '@/models/Message';
import File from '@/models/File';
import Task from '@/models/Task';
import User from '@/models/User';
import { logError } from '@/lib/sentry-logger';
import { escapeRegex } from '@/lib/utils';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

interface SearchResult {
    type: 'project' | 'message' | 'invoice' | 'file' | 'task';
    id: string;
    title: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    createdAt: string;
    relevance?: number;
}

// Global search across all entities
export async function globalSearch(searchTerm: string, entities?: string[]): Promise<ActionResponse<SearchResult[]>> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!searchTerm || searchTerm.length < 2) {
            return { success: false, error: 'Search term must be at least 2 characters' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const searchRegex = new RegExp(escapeRegex(searchTerm), 'i');
        const results: SearchResult[] = [];

        // Determine which entities to search
        const searchEntities = entities || ['projects', 'messages', 'invoices', 'files', 'tasks'];

        // Search Projects
        if (searchEntities.includes('projects')) {
            const projects = await Project.find({
                userId: user._id,
                $or: [
                    { projectName: searchRegex },
                    { projectDescription: searchRegex },
                ],
            })
                .select('projectName projectDescription createdAt')
                .limit(10)
                .lean();

            projects.forEach(p => {
                results.push({
                    type: 'project',
                    id: p._id.toString(),
                    title: p.projectName,
                    description: p.projectDescription.substring(0, 150),
                    createdAt: p.createdAt.toISOString(),
                });
            });
        }

        // Search Messages
        if (searchEntities.includes('messages')) {
            const messages = await Message.find({
                userId: user._id,
                message: searchRegex,
            })
                .populate('projectId', 'projectName')
                .select('message projectId createdAt')
                .limit(10)
                .lean();

            messages.forEach(m => {
                const project = m.projectId as any;
                results.push({
                    type: 'message',
                    id: m._id.toString(),
                    title: 'Message',
                    description: m.message.substring(0, 150),
                    projectId: project?._id?.toString() || '',
                    projectName: project?.projectName || '',
                    createdAt: m.createdAt.toISOString(),
                });
            });
        }

        // Search Files
        if (searchEntities.includes('files')) {
            const files = await File.find({
                $or: [
                    { fileName: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex },
                ],
            })
                .populate('projectId', 'projectName')
                .select('fileName description projectId createdAt')
                .limit(10)
                .lean();

            files.forEach(f => {
                const project = f.projectId as any;
                results.push({
                    type: 'file',
                    id: f._id.toString(),
                    title: f.fileName,
                    description: f.description,
                    projectId: project?._id?.toString() || '',
                    projectName: project?.projectName || '',
                    createdAt: f.createdAt.toISOString(),
                });
            });
        }

        // Search Tasks
        if (searchEntities.includes('tasks')) {
            const tasks = await Task.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                ],
            })
                .populate('projectId', 'projectName')
                .select('title description projectId createdAt')
                .limit(10)
                .lean();

            tasks.forEach(t => {
                const project = t.projectId as any;
                results.push({
                    type: 'task',
                    id: t._id.toString(),
                    title: t.title,
                    description: t.description,
                    projectId: project?._id?.toString() || '',
                    projectName: project?.projectName || '',
                    createdAt: t.createdAt.toISOString(),
                });
            });
        }

        // Sort by most recent
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Limit total results
        const limitedResults = results.slice(0, 50);

        return { success: true, data: limitedResults };
    } catch (error) {
        logError(error as Error, { context: 'globalSearch', searchTerm, entities });
        return { success: false, error: 'Failed to perform search' };
    }
}

// Search within a specific project
export async function searchInProject(projectId: string, searchTerm: string): Promise<ActionResponse<SearchResult[]>> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!searchTerm || searchTerm.length < 2) {
            return { success: false, error: 'Search term must be at least 2 characters' };
        }

        await dbConnect();

        const searchRegex = new RegExp(escapeRegex(searchTerm), 'i');
        const results: SearchResult[] = [];

        // Search Messages in project
        const messages = await Message.find({
            projectId,
            message: searchRegex,
        })
            .select('message createdAt')
            .limit(20)
            .lean();

        messages.forEach(m => {
            results.push({
                type: 'message',
                id: m._id.toString(),
                title: 'Message',
                description: m.message.substring(0, 150),
                projectId,
                createdAt: m.createdAt.toISOString(),
            });
        });

        // Search Files in project
        const files = await File.find({
            projectId,
            $or: [
                { fileName: searchRegex },
                { description: searchRegex },
            ],
        })
            .select('fileName description createdAt')
            .limit(20)
            .lean();

        files.forEach(f => {
            results.push({
                type: 'file',
                id: f._id.toString(),
                title: f.fileName,
                description: f.description,
                projectId,
                createdAt: f.createdAt.toISOString(),
            });
        });

        // Search Tasks in project
        const tasks = await Task.find({
            projectId,
            $or: [
                { title: searchRegex },
                { description: searchRegex },
            ],
        })
            .select('title description createdAt')
            .limit(20)
            .lean();

        tasks.forEach(t => {
            results.push({
                type: 'task',
                id: t._id.toString(),
                title: t.title,
                description: t.description,
                projectId,
                createdAt: t.createdAt.toISOString(),
            });
        });

        // Sort by most recent
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { success: true, data: results };
    } catch (error) {
        logError(error as Error, { context: 'searchInProject', projectId, searchTerm });
        return { success: false, error: 'Failed to search in project' };
    }
}
