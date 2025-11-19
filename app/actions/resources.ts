// app/actions/resources.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Resource, { ResourceType, ResourceCategory, ResourceVisibility } from '@/models/Resource';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all resources for admin (no filters on publish status)
export async function getAdminResources(): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        // Admin sees ALL resources regardless of publish status
        const resources = await Resource.find({})
            .select('-content') // Don't send full content in list view
            .sort({ createdAt: -1 })
            .lean();

        const serializedResources = resources.map(r => ({
            ...r,
            _id: r._id.toString(),
            authorId: r.authorId.toString(),
        }));

        return { success: true, data: serializedResources };
    } catch (error) {
        logError(error as Error, { context: 'getAdminResources' });
        return { success: false, error: 'Failed to fetch admin resources' };
    }
}

// Get all published resources
export async function getResources(filters?: {
    type?: ResourceType;
    category?: ResourceCategory;
    tags?: string[];
    search?: string;
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        await dbConnect();

        const query: any = { isPublished: true };

        // Check user access level
        if (clerkUserId) {
            const user = await User.findOne({ clerkId: clerkUserId });
            // Logged-in users can see public and client resources
            query.visibility = { $in: [ResourceVisibility.PUBLIC, ResourceVisibility.CLIENTS] };
        } else {
            // Non-logged-in users only see public
            query.visibility = ResourceVisibility.PUBLIC;
        }

        if (filters) {
            if (filters.type) query.type = filters.type;
            if (filters.category) query.category = filters.category;
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            if (filters.search) {
                query.$text = { $search: filters.search };
            }
        }

        const resources = await Resource.find(query)
            .select('-content') // Don't send full content in list view
            .sort({ isFeatured: -1, publishedAt: -1 })
            .lean();

        const serializedResources = resources.map(r => ({
            ...r,
            _id: r._id.toString(),
            authorId: r.authorId.toString(),
        }));

        return { success: true, data: serializedResources };
    } catch (error) {
        logError(error as Error, { context: 'getResources', filters });
        return { success: false, error: 'Failed to fetch resources' };
    }
}

// Get single resource
export async function getResource(slug: string): Promise<ActionResponse> {
    try {
        await dbConnect();

        const resource = await Resource.findOne({ slug, isPublished: true })
            .populate('authorId', 'firstName lastName email imageUrl')
            .lean();

        if (!resource) {
            return { success: false, error: 'Resource not found' };
        }

        // Increment view count
        await Resource.findByIdAndUpdate(resource._id, {
            $inc: { viewCount: 1 },
        });

        return {
            success: true,
            data: {
                ...resource,
                _id: resource._id.toString(),
                authorId: {
                    ...resource.authorId,
                    _id: resource.authorId._id.toString(),
                },
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'getResource', slug });
        return { success: false, error: 'Failed to fetch resource' };
    }
}

// Create resource (admin only)
export async function createResource(data: {
    title: string;
    description?: string;
    content?: string;
    type: ResourceType;
    category: ResourceCategory;
    visibility: ResourceVisibility;
    serviceType?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    videoEmbedCode?: string;
    fileUrl?: string;
    fileName?: string;
    externalUrl?: string;
    tags?: string[];
    slug: string;
    metaDescription?: string;
    isFeatured?: boolean;
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

        // Check if slug already exists
        const existingResource = await Resource.findOne({ slug: data.slug });
        if (existingResource) {
            return { success: false, error: 'Slug already exists' };
        }

        const resource = await Resource.create({
            ...data,
            authorId: user._id,
            authorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
            isPublished: false,
        });

        revalidatePath('/admin/resources');

        return {
            success: true,
            data: {
                ...toSerializedObject(resource),
                _id: resource._id.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'createResource', slug: data.slug });
        return { success: false, error: 'Failed to create resource' };
    }
}

// Update resource (admin only)
export async function updateResource(resourceId: string, data: Partial<{
    title: string;
    description: string;
    content: string;
    type: ResourceType;
    category: ResourceCategory;
    visibility: ResourceVisibility;
    serviceType: string;
    thumbnailUrl: string;
    videoUrl: string;
    videoEmbedCode: string;
    fileUrl: string;
    fileName: string;
    externalUrl: string;
    tags: string[];
    slug: string;
    metaDescription: string;
    isFeatured: boolean;
}>): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        // If slug is being changed, check it doesn't exist
        if (data.slug) {
            const existingResource = await Resource.findOne({
                slug: data.slug,
                _id: { $ne: resourceId },
            });
            if (existingResource) {
                return { success: false, error: 'Slug already exists' };
            }
        }

        const resource = await Resource.findByIdAndUpdate(
            resourceId,
            data,
            { new: true }
        );

        if (!resource) {
            return { success: false, error: 'Resource not found' };
        }

        revalidatePath('/admin/resources');
        revalidatePath(`/resources/${resource.slug}`);

        return { success: true, data: toSerializedObject(resource) };
    } catch (error) {
        logError(error as Error, { context: 'updateResource', resourceId });
        return { success: false, error: 'Failed to update resource' };
    }
}

// Publish resource (admin only)
export async function publishResource(resourceId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const resource = await Resource.findByIdAndUpdate(
            resourceId,
            {
                isPublished: true,
                publishedAt: new Date(),
            },
            { new: true }
        );

        if (!resource) {
            return { success: false, error: 'Resource not found' };
        }

        revalidatePath('/admin/resources');
        revalidatePath('/resources');

        return { success: true, data: toSerializedObject(resource) };
    } catch (error) {
        logError(error as Error, { context: 'publishResource', resourceId });
        return { success: false, error: 'Failed to publish resource' };
    }
}

// Unpublish resource (admin only)
export async function unpublishResource(resourceId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const resource = await Resource.findByIdAndUpdate(
            resourceId,
            { isPublished: false },
            { new: true }
        );

        if (!resource) {
            return { success: false, error: 'Resource not found' };
        }

        revalidatePath('/admin/resources');
        revalidatePath('/resources');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'unpublishResource', resourceId });
        return { success: false, error: 'Failed to unpublish resource' };
    }
}

// Delete resource (admin only)
export async function deleteResource(resourceId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const resource = await Resource.findByIdAndDelete(resourceId);

        if (!resource) {
            return { success: false, error: 'Resource not found' };
        }

        revalidatePath('/admin/resources');
        revalidatePath('/resources');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'deleteResource', resourceId });
        return { success: false, error: 'Failed to delete resource' };
    }
}

// Track resource download
export async function trackResourceDownload(resourceId: string): Promise<ActionResponse> {
    try {
        await dbConnect();

        await Resource.findByIdAndUpdate(resourceId, {
            $inc: { downloadCount: 1 },
        });

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'trackResourceDownload', resourceId });
        return { success: false, error: 'Failed to track download' };
    }
}

// Get featured resources
export async function getFeaturedResources(limit: number = 5): Promise<ActionResponse> {
    try {
        await dbConnect();

        const resources = await Resource.find({
            isPublished: true,
            isFeatured: true,
            visibility: { $in: [ResourceVisibility.PUBLIC, ResourceVisibility.CLIENTS] },
        })
            .select('-content')
            .sort({ publishedAt: -1 })
            .limit(limit)
            .lean();

        const serializedResources = resources.map(r => ({
            ...r,
            _id: r._id.toString(),
            authorId: r.authorId.toString(),
        }));

        return { success: true, data: serializedResources };
    } catch (error) {
        logError(error as Error, { context: 'getFeaturedResources', limit });
        return { success: false, error: 'Failed to fetch featured resources' };
    }
}

// Search resources
export async function searchResources(searchTerm: string): Promise<ActionResponse> {
    try {
        await dbConnect();

        const resources = await Resource.find({
            isPublished: true,
            $text: { $search: searchTerm },
        })
            .select('-content')
            .sort({ score: { $meta: 'textScore' } })
            .limit(20)
            .lean();

        const serializedResources = resources.map(r => ({
            ...r,
            _id: r._id.toString(),
            authorId: r.authorId.toString(),
        }));

        return { success: true, data: serializedResources };
    } catch (error) {
        logError(error as Error, { context: 'searchResources', searchTerm });
        return { success: false, error: 'Failed to search resources' };
    }
}
