// app/admin/resources/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createResource } from '@/app/actions/resources';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateResourcePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'article' as 'article' | 'video' | 'document' | 'link' | 'tutorial' | 'faq' | 'template' | 'brand_asset' | 'other',
        category: 'tutorial',
        content: '',
        videoUrl: '',
        videoEmbedCode: '',
        downloadFileUrl: '',
        externalUrl: '',
        thumbnailUrl: '',
        tags: '',
        isFeatured: false,
        isPublished: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await createResource({
                title: formData.title,
                slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                description: formData.description,
                type: formData.type as any,
                category: formData.category as any,
                content: formData.content || undefined,
                videoUrl: formData.videoUrl || undefined,
                videoEmbedCode: formData.videoEmbedCode || undefined,
                fileUrl: formData.downloadFileUrl || undefined,
                externalUrl: formData.externalUrl || undefined,
                thumbnailUrl: formData.thumbnailUrl || undefined,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                isFeatured: formData.isFeatured,
                visibility: formData.isPublished ? 'public' as any : 'private' as any,
            });

            if (result.success) {
                router.push('/admin/resources');
            } else {
                setError(result.error || 'Failed to create resource');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/resources"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Resource</h1>
                    <p className="text-gray-600 mt-2">Add a new resource to the knowledge base</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Getting Started with Our Platform"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief description of this resource"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="faq">FAQ</option>
                                <option value="document">Document</option>
                                <option value="template">Template</option>
                                <option value="link">External Link</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="general">General</option>
                                <option value="web_development">Web Development</option>
                                <option value="social_media">Social Media</option>
                                <option value="digital_solutions">Digital Solutions</option>
                                <option value="branding">Branding</option>
                                <option value="getting_started">Getting Started</option>
                                <option value="best_practices">Best Practices</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., beginner, setup, configuration"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail URL
                        </label>
                        <input
                            type="url"
                            value={formData.thumbnailUrl}
                            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                </div>

                {/* Type-Specific Fields */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Content</h2>

                    {formData.type === 'article' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article Content *
                            </label>
                            <textarea
                                required
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                placeholder="Write your article content (supports markdown)"
                            />
                        </div>
                    )}

                    {formData.type === 'video' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video Embed Code (optional)
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.videoEmbedCode}
                                    onChange={(e) => setFormData({ ...formData, videoEmbedCode: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="<iframe src='...'></iframe>"
                                />
                            </div>
                        </>
                    )}

                    {formData.type === 'document' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Download File URL *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.downloadFileUrl}
                                onChange={(e) => setFormData({ ...formData, downloadFileUrl: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/files/document.pdf"
                            />
                        </div>
                    )}

                    {formData.type === 'link' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                External URL *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.externalUrl}
                                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://external-site.com/resource"
                            />
                        </div>
                    )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-gray-900">Options</h2>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Feature this resource</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Publish immediately</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Resource'}
                    </button>
                    <Link
                        href="/admin/resources"
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
