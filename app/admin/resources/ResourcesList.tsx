// app/admin/resources/ResourcesList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    publishResource,
    unpublishResource,
    deleteResource,
} from '@/app/actions/resources';
import { Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Resource {
    _id: string;
    title: string;
    description?: string;
    type: string;
    category: string;
    visibility: string;
    isPublished: boolean;
    isFeatured: boolean;
    slug: string;
    viewCount: number;
    downloadCount: number;
    createdAt: string;
}

export default function ResourcesList({ resources }: { resources: Resource[] }) {
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const router = useRouter();

    const filteredResources = resources.filter((r) => {
        if (filter === 'published') return r.isPublished;
        if (filter === 'draft') return !r.isPublished;
        return true;
    });

    const handleTogglePublish = async (resourceId: string, currentlyPublished: boolean) => {
        const result = currentlyPublished
            ? await unpublishResource(resourceId)
            : await publishResource(resourceId);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error || 'Failed to update resource');
        }
    };

    const handleDelete = async (resourceId: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
            return;
        }

        const result = await deleteResource(resourceId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error || 'Failed to delete resource');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return '🎥';
            case 'article':
                return '📄';
            case 'tutorial':
                return '📚';
            case 'faq':
                return '❓';
            case 'document':
                return '📃';
            case 'template':
                return '📋';
            case 'brand_asset':
                return '🎨';
            case 'link':
                return '🔗';
            default:
                return '📌';
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/40 backdrop-blur-xl border hover:bg-gray-50'
                    }`}
                >
                    All ({resources.length})
                </button>
                <button
                    onClick={() => setFilter('published')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'published'
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/40 backdrop-blur-xl border hover:bg-gray-50'
                    }`}
                >
                    Published ({resources.filter((r) => r.isPublished).length})
                </button>
                <button
                    onClick={() => setFilter('draft')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'draft'
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/40 backdrop-blur-xl border hover:bg-gray-50'
                    }`}
                >
                    Drafts ({resources.filter((r) => !r.isPublished).length})
                </button>
            </div>

            {/* Resources List */}
            <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm">
                {filteredResources.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📚</div>
                        <p>No resources found</p>
                        <p className="text-sm mt-2">Create your first resource to get started</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredResources.map((resource) => (
                            <div
                                key={resource._id}
                                className="p-6 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <span className="text-3xl">
                                            {getTypeIcon(resource.type)}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-white">
                                                    {resource.title}
                                                </h3>
                                                {resource.isFeatured && (
                                                    <span className="text-yellow-500">⭐</span>
                                                )}
                                                {!resource.isPublished && (
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-400 rounded">
                                                        Draft
                                                    </span>
                                                )}
                                                {resource.isPublished && (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                        Published
                                                    </span>
                                                )}
                                            </div>
                                            {resource.description && (
                                                <p className="text-sm text-gray-400 mb-3">
                                                    {resource.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                    {resource.category.replace('_', ' ')}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                    {resource.type}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                    {resource.visibility}
                                                </span>
                                                <span>•</span>
                                                <span>{resource.viewCount || 0} views</span>
                                                {resource.downloadCount > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {resource.downloadCount} downloads
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/admin/resources/${resource._id}/edit`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleTogglePublish(
                                                    resource._id,
                                                    resource.isPublished
                                                )
                                            }
                                            className={`p-2 rounded transition-colors ${
                                                resource.isPublished
                                                    ? 'text-yellow-600 hover:bg-yellow-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                            }`}
                                            title={
                                                resource.isPublished ? 'Unpublish' : 'Publish'
                                            }
                                        >
                                            {resource.isPublished ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(resource._id, resource.title)
                                            }
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
