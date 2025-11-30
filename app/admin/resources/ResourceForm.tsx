// app/admin/resources/ResourceForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createResource, updateResource } from '@/app/actions/resources';
import { ResourceType, ResourceCategory, ResourceVisibility } from '@/models/Resource';
import Link from 'next/link';

interface Resource {
    _id?: string;
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
    isPublished?: boolean;
}

export default function ResourceForm({ resource }: { resource?: Resource }) {
    const isEditing = !!resource;
    const router = useRouter();

    const [formData, setFormData] = useState<Resource>({
        title: resource?.title || '',
        description: resource?.description || '',
        content: resource?.content || '',
        type: resource?.type || ResourceType.ARTICLE,
        category: resource?.category || ResourceCategory.GENERAL,
        visibility: resource?.visibility || ResourceVisibility.CLIENTS,
        serviceType: resource?.serviceType || '',
        thumbnailUrl: resource?.thumbnailUrl || '',
        videoUrl: resource?.videoUrl || '',
        videoEmbedCode: resource?.videoEmbedCode || '',
        fileUrl: resource?.fileUrl || '',
        fileName: resource?.fileName || '',
        externalUrl: resource?.externalUrl || '',
        tags: resource?.tags || [],
        slug: resource?.slug || '',
        metaDescription: resource?.metaDescription || '',
        isFeatured: resource?.isFeatured || false,
        isPublished: resource?.isPublished || false,
    });

    const [tagsInput, setTagsInput] = useState(formData.tags?.join(', ') || '');
    const [loading, setLoading] = useState(false);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({ ...formData, title });
        if (!isEditing || !resource?.slug) {
            setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const tags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t);

        const data = {
            ...formData,
            tags,
        };

        const result = isEditing && resource?._id
            ? await updateResource(resource._id, data)
            : await createResource(data);

        if (result.success) {
            router.push('/admin/resources');
            router.refresh();
        } else {
            alert(result.error || 'Failed to save resource');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                    </label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        URL-friendly identifier (auto-generated from title)
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={3}
                        maxLength={1000}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value as ResourceType,
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            required
                        >
                            <option value={ResourceType.ARTICLE}>Article</option>
                            <option value={ResourceType.VIDEO}>Video</option>
                            <option value={ResourceType.TUTORIAL}>Tutorial</option>
                            <option value={ResourceType.FAQ}>FAQ</option>
                            <option value={ResourceType.DOCUMENT}>Document</option>
                            <option value={ResourceType.TEMPLATE}>Template</option>
                            <option value={ResourceType.BRAND_ASSET}>Brand Asset</option>
                            <option value={ResourceType.LINK}>Link</option>
                            <option value={ResourceType.OTHER}>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value as ResourceCategory,
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            required
                        >
                            <option value={ResourceCategory.WEB_DEVELOPMENT}>
                                Web Development
                            </option>
                            <option value={ResourceCategory.SOCIAL_MEDIA}>
                                Social Media
                            </option>
                            <option value={ResourceCategory.DIGITAL_SOLUTIONS}>
                                Digital Solutions
                            </option>
                            <option value={ResourceCategory.BRANDING}>Branding</option>
                            <option value={ResourceCategory.GENERAL}>General</option>
                            <option value={ResourceCategory.GETTING_STARTED}>
                                Getting Started
                            </option>
                            <option value={ResourceCategory.BEST_PRACTICES}>
                                Best Practices
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visibility *
                        </label>
                        <select
                            value={formData.visibility}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    visibility: e.target.value as ResourceVisibility,
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            required
                        >
                            <option value={ResourceVisibility.PUBLIC}>Public</option>
                            <option value={ResourceVisibility.CLIENTS}>
                                Clients Only
                            </option>
                            <option value={ResourceVisibility.SPECIFIC_SERVICE}>
                                Specific Service
                            </option>
                            <option value={ResourceVisibility.PRIVATE}>Private</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={(e) =>
                                setFormData({ ...formData, isPublished: e.target.checked })
                            }
                            className="rounded border-gray-300 w-5 h-5 text-blue-600"
                        />
                        <label htmlFor="isPublished" className="text-sm font-semibold text-blue-900 cursor-pointer">
                            ✓ Publish Resource (make visible to users)
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onChange={(e) =>
                                setFormData({ ...formData, isFeatured: e.target.checked })
                            }
                            className="rounded border-gray-300 w-5 h-5 text-blue-600"
                        />
                        <label htmlFor="isFeatured" className="text-sm text-gray-700 cursor-pointer">
                            Featured Resource (show at top of list)
                        </label>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                        {formData.isPublished ? '✓ This resource will be visible to users based on visibility settings' : '⚠️ This resource is a draft and will not be visible to users'}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Content</h2>

                {formData.type === ResourceType.ARTICLE && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Article Content
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({ ...formData, content: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                            rows={15}
                            placeholder="Supports Markdown..."
                        />
                    </div>
                )}

                {formData.type === ResourceType.VIDEO && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Video URL
                            </label>
                            <input
                                type="url"
                                value={formData.videoUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, videoUrl: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Video Embed Code (optional)
                            </label>
                            <textarea
                                value={formData.videoEmbedCode}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        videoEmbedCode: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                rows={3}
                                placeholder="<iframe ...></iframe>"
                            />
                        </div>
                    </>
                )}

                {(formData.type === ResourceType.DOCUMENT ||
                    formData.type === ResourceType.TEMPLATE ||
                    formData.type === ResourceType.BRAND_ASSET) && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File URL
                            </label>
                            <input
                                type="url"
                                value={formData.fileUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, fileUrl: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Name
                            </label>
                            <input
                                type="text"
                                value={formData.fileName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fileName: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>
                    </>
                )}

                {formData.type === ResourceType.LINK && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            External URL
                        </label>
                        <input
                            type="url"
                            value={formData.externalUrl}
                            onChange={(e) =>
                                setFormData({ ...formData, externalUrl: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thumbnail URL
                    </label>
                    <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) =>
                            setFormData({ ...formData, thumbnailUrl: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                </div>
            </div>

            {/* SEO & Meta */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">SEO & Metadata</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                    </label>
                    <textarea
                        value={formData.metaDescription}
                        onChange={(e) =>
                            setFormData({ ...formData, metaDescription: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={2}
                        maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription?.length || 0}/160 characters
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="web-design, seo, wordpress"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading
                        ? 'Saving...'
                        : isEditing
                        ? 'Update Resource'
                        : 'Create Resource'}
                </button>
                <Link
                    href="/admin/resources"
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
