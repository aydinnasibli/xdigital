// app/actions/admin/clients.ts
'use server';

import dbConnect from '@/lib/database/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/auth/admin';
import mongoose from 'mongoose';
import { logError } from '@/lib/monitoring/sentry';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { escapeRegex } from '@/lib/utils/cn';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all clients
export async function getAllClients(filters?: {
    search?: string;
    hasActiveProjects?: boolean;
}): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const query: any = {};

        if (filters?.search) {
            const escapedSearch = escapeRegex(filters.search);
            query.$or = [
                { email: { $regex: escapedSearch, $options: 'i' } },
                { firstName: { $regex: escapedSearch, $options: 'i' } },
                { lastName: { $regex: escapedSearch, $options: 'i' } },
            ];
        }

        const clients = await User.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Get project counts and stats for each client
        const clientsWithStats = await Promise.all(
            clients.map(async (client) => {
                const [totalProjects, activeProjects] = await Promise.all([
                    Project.countDocuments({ userId: client._id }),
                    Project.countDocuments({
                        userId: client._id,
                        status: { $in: ['pending', 'in_progress'] },
                    }),
                ]);

                return {
                    ...client,
                    _id: client._id.toString(),
                    totalProjects,
                    activeProjects,
                    name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A',
                };
            })
        );

        // Apply active projects filter if needed
        let filteredClients = clientsWithStats;
        if (filters?.hasActiveProjects) {
            filteredClients = clientsWithStats.filter(c => c.activeProjects > 0);
        }

        return { success: true, data: filteredClients };
    } catch (error) {
        logError(error as Error, { context: 'getAllClients', hasActiveProjects: filters?.hasActiveProjects });
        return { success: false, error: 'Failed to fetch clients' };
    }
}

// Get single client details
export async function getClientDetails(clientId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return { success: false, error: 'Invalid client ID' };
        }

        await dbConnect();

        const client = await User.findById(clientId).lean();

        if (!client) {
            return { success: false, error: 'Client not found' };
        }

        // Get projects and stats
        const [projects, projectStats] = await Promise.all([
            Project.find({ userId: clientId })
                .sort({ createdAt: -1 })
                .lean(),
            Project.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(clientId) } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const serializedProjects = projects.map(p => toSerializedObject(p));

        const serializedClient = {
            ...toSerializedObject<Record<string, unknown>>(client),
            name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A',
        };

        return {
            success: true,
            data: {
                client: serializedClient,
                projects: serializedProjects,
                stats: {
                    projects: projectStats,
                },
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getClientDetails', clientId });
        return { success: false, error: 'Failed to fetch client details' };
    }
}

// Get client projects
export async function getClientProjects(clientId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return { success: false, error: 'Invalid client ID' };
        }

        await dbConnect();

        const projects = await Project.find({ userId: clientId })
            .sort({ createdAt: -1 })
            .lean();

        const serializedProjects = projects.map(p => ({
            ...p,
            _id: p._id.toString(),
            userId: p.userId.toString(),
        }));

        return { success: true, data: serializedProjects };
    } catch (error) {
        logError(error as Error, { context: 'getClientProjects', clientId });
        return { success: false, error: 'Failed to fetch client projects' };
    }
}

// Get client statistics for admin dashboard
export async function getAdminClientStats(): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalClients, newThisMonth, clientsWithActiveProjects] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
            Project.distinct('userId', { status: { $in: ['pending', 'in_progress'] } }).then(
                ids => ids.length
            ),
        ]);

        return {
            success: true,
            data: {
                totalClients,
                newThisMonth,
                clientsWithActiveProjects,
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getAdminClientStats' });
        return { success: false, error: 'Failed to fetch client stats' };
    }
}