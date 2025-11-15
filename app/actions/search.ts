// app/actions/search.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import Message from '@/models/Message';
import Invoice from '@/models/Invoice';
import File from '@/models/File';
import Task from '@/models/Task';
import Deliverable from '@/models/Deliverable';
import User from '@/models/User';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

interface SearchResult {
    type: 'project' | 'message' | 'invoice' | 'file' | 'task' | 'deliverable';
    id: string;
    title: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    createdAt: Date;
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

        const searchRegex = new RegExp(searchTerm, 'i');
        const results: SearchResult[] = [];

        // Determine which entities to search
        const searchEntities = entities || ['projects', 'messages', 'invoices', 'files', 'tasks', 'deliverables'];

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
                    createdAt: p.createdAt,
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
                results.push({
                    type: 'message',
                    id: m._id.toString(),
                    title: 'Message',
                    description: m.message.substring(0, 150),
                    projectId: m.projectId._id.toString(),
                    projectName: m.projectId.projectName,
                    createdAt: m.createdAt,
                });
            });
        }

        // Search Invoices
        if (searchEntities.includes('invoices')) {
            const invoices = await Invoice.find({
                userId: user._id,
                $or: [
                    { invoiceNumber: searchRegex },
                    { notes: searchRegex },
                ],
            })
                .populate('projectId', 'projectName')
                .select('invoiceNumber notes projectId total createdAt')
                .limit(10)
                .lean();

            invoices.forEach(i => {
                results.push({
                    type: 'invoice',
                    id: i._id.toString(),
                    title: `Invoice ${i.invoiceNumber}`,
                    description: i.notes || `Total: $${i.total}`,
                    projectId: i.projectId._id.toString(),
                    projectName: i.projectId.projectName,
                    createdAt: i.createdAt,
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
                results.push({
                    type: 'file',
                    id: f._id.toString(),
                    title: f.fileName,
                    description: f.description,
                    projectId: f.projectId._id.toString(),
                    projectName: f.projectId.projectName,
                    createdAt: f.createdAt,
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
                results.push({
                    type: 'task',
                    id: t._id.toString(),
                    title: t.title,
                    description: t.description,
                    projectId: t.projectId._id.toString(),
                    projectName: t.projectId.projectName,
                    createdAt: t.createdAt,
                });
            });
        }

        // Search Deliverables
        if (searchEntities.includes('deliverables')) {
            const deliverables = await Deliverable.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                ],
            })
                .populate('projectId', 'projectName')
                .select('title description projectId createdAt')
                .limit(10)
                .lean();

            deliverables.forEach(d => {
                results.push({
                    type: 'deliverable',
                    id: d._id.toString(),
                    title: d.title,
                    description: d.description,
                    projectId: d.projectId._id.toString(),
                    projectName: d.projectId.projectName,
                    createdAt: d.createdAt,
                });
            });
        }

        // Sort by most recent
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Limit total results
        const limitedResults = results.slice(0, 50);

        return { success: true, data: limitedResults };
    } catch (error) {
        console.error('Error performing global search:', error);
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

        const searchRegex = new RegExp(searchTerm, 'i');
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
                createdAt: m.createdAt,
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
                createdAt: f.createdAt,
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
                createdAt: t.createdAt,
            });
        });

        // Search Deliverables in project
        const deliverables = await Deliverable.find({
            projectId,
            $or: [
                { title: searchRegex },
                { description: searchRegex },
            ],
        })
            .select('title description createdAt')
            .limit(20)
            .lean();

        deliverables.forEach(d => {
            results.push({
                type: 'deliverable',
                id: d._id.toString(),
                title: d.title,
                description: d.description,
                projectId,
                createdAt: d.createdAt,
            });
        });

        // Sort by most recent
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return { success: true, data: results };
    } catch (error) {
        console.error('Error searching in project:', error);
        return { success: false, error: 'Failed to search in project' };
    }
}
