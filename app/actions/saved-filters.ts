// app/actions/saved-filters.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import SavedFilter, { FilterEntity } from '@/models/SavedFilter';
import User from '@/models/User';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all saved filters for user
export async function getUserFilters(entity?: FilterEntity): Promise<ActionResponse> {
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

        const query: any = { userId: user._id };
        if (entity) {
            query.entity = entity;
        }

        const filters = await SavedFilter.find(query)
            .sort({ isDefault: -1, lastUsedAt: -1 })
            .lean();

        const serializedFilters = filters.map(f => ({
            ...f,
            _id: f._id.toString(),
            userId: f.userId.toString(),
        }));

        return { success: true, data: serializedFilters };
    } catch (error) {
        logError(error as Error, { context: 'getUserFilters', entity });
        return { success: false, error: 'Failed to fetch filters' };
    }
}

// Get shared filters (team filters)
export async function getSharedFilters(entity?: FilterEntity): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = { isShared: true };
        if (entity) {
            query.entity = entity;
        }

        const filters = await SavedFilter.find(query)
            .populate('userId', 'firstName lastName email')
            .sort({ usageCount: -1 })
            .lean();

        const serializedFilters = filters.map(f => ({
            ...f,
            _id: f._id.toString(),
            userId: {
                ...f.userId,
                _id: f.userId._id.toString(),
            },
        }));

        return { success: true, data: serializedFilters };
    } catch (error) {
        logError(error as Error, { context: 'getSharedFilters', entity });
        return { success: false, error: 'Failed to fetch shared filters' };
    }
}

// Create saved filter
export async function createSavedFilter(data: {
    name: string;
    description?: string;
    entity: FilterEntity;
    filters: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isDefault?: boolean;
    isShared?: boolean;
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

        // If setting as default, unset other defaults for this entity
        if (data.isDefault) {
            await SavedFilter.updateMany(
                {
                    userId: user._id,
                    entity: data.entity,
                    isDefault: true,
                },
                { isDefault: false }
            );
        }

        const filter = await SavedFilter.create({
            ...data,
            userId: user._id,
        });

        revalidatePath('/dashboard');

        return {
            success: true,
            data: {
                ...toSerializedObject(filter),
                _id: filter._id.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'createSavedFilter', entity: data.entity });
        return { success: false, error: 'Failed to create saved filter' };
    }
}

// Update saved filter
export async function updateSavedFilter(filterId: string, data: Partial<{
    name: string;
    description: string;
    filters: any;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    isDefault: boolean;
    isShared: boolean;
}>): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const filter = await SavedFilter.findOne({ _id: filterId, userId: user?._id });

        if (!filter) {
            return { success: false, error: 'Filter not found' };
        }

        // If setting as default, unset other defaults for this entity
        if (data.isDefault) {
            await SavedFilter.updateMany(
                {
                    userId: user!._id,
                    entity: filter.entity,
                    isDefault: true,
                    _id: { $ne: filterId },
                },
                { isDefault: false }
            );
        }

        Object.assign(filter, data);
        await filter.save();

        revalidatePath('/dashboard');

        return { success: true, data: toSerializedObject(filter) };
    } catch (error) {
        logError(error as Error, { context: 'updateSavedFilter', filterId });
        return { success: false, error: 'Failed to update saved filter' };
    }
}

// Delete saved filter
export async function deleteSavedFilter(filterId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const filter = await SavedFilter.findOneAndDelete({
            _id: filterId,
            userId: user?._id,
        });

        if (!filter) {
            return { success: false, error: 'Filter not found' };
        }

        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'deleteSavedFilter', filterId });
        return { success: false, error: 'Failed to delete saved filter' };
    }
}

// Use a saved filter (increments usage count)
export async function useSavedFilter(filterId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const filter = await SavedFilter.findByIdAndUpdate(
            filterId,
            {
                $inc: { usageCount: 1 },
                lastUsedAt: new Date(),
            },
            { new: true }
        );

        if (!filter) {
            return { success: false, error: 'Filter not found' };
        }

        return { success: true, data: toSerializedObject(filter) };
    } catch (error) {
        logError(error as Error, { context: 'useSavedFilter', filterId });
        return { success: false, error: 'Failed to use saved filter' };
    }
}

// Get default filter for entity
export async function getDefaultFilter(entity: FilterEntity): Promise<ActionResponse> {
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

        const filter = await SavedFilter.findOne({
            userId: user._id,
            entity,
            isDefault: true,
        }).lean();

        if (!filter) {
            return { success: true, data: null };
        }

        return {
            success: true,
            data: {
                ...filter,
                _id: filter._id.toString(),
                userId: filter.userId.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getDefaultFilter', entity });
        return { success: false, error: 'Failed to fetch default filter' };
    }
}
