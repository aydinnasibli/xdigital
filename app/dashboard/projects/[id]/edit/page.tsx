// app/dashboard/projects/[id]/edit/page.tsx
'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProject, updateProject } from '@/app/actions/projects';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';

export default function EditProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const projectId = resolvedParams.id;
    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        serviceType: 'web_development',
        package: 'basic',
    });

    useEffect(() => {
        fetchProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const result = await getProject(projectId);

            if (result.success && result.data) {
                setFormData({
                    projectName: result.data.projectName,
                    projectDescription: result.data.projectDescription,
                    serviceType: result.data.serviceType,
                    package: result.data.package,
                });
            } else {
                toast.error(result.error || 'Failed to fetch project');
            }
        } catch (error) {
            Sentry.captureException(error, { tags: { context: 'fetchProject', projectId } });
            toast.error('An error occurred while loading the project');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await updateProject(projectId, formData);

            if (result.success) {
                toast.success('Project updated successfully!');
                router.push(`/dashboard/projects/${projectId}`);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update project');
            }
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (fetching) {
        return <div className="text-center py-12 text-gray-400">Loading project...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <Link
                href={`/dashboard/projects/${projectId}`}
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
                ← Back to Project
            </Link>

            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 p-8 rounded-2xl">
                <h1 className="text-2xl font-bold mb-6 text-white">Edit Project</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Project Name *</label>
                        <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {/* Project Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Project Description *</label>
                        <textarea
                            name="projectDescription"
                            value={formData.projectDescription}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-2 bg-white/5 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {/* Service Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Service Type *</label>
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        >
                            <option value="web_development">Web Development</option>
                            <option value="social_media_marketing" disabled>
                                Social Media Marketing (Coming Soon)
                            </option>
                            <option value="digital_solutions" disabled>
                                Digital Solutions (Coming Soon)
                            </option>
                        </select>
                    </div>

                    {/* Package Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Package *</label>
                        <select
                            name="package"
                            value={formData.package}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        >
                            {formData.serviceType === 'web_development' && (
                                <>
                                    <option value="basic">Basic</option>
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? 'Updating...' : 'Update Project'}
                        </button>
                        <Link
                            href={`/dashboard/projects/${projectId}`}
                            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg transition-all"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}