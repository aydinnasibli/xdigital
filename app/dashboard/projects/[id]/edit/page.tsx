// app/dashboard/projects/[id]/edit/page.tsx
'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProject, updateProject } from '@/app/actions/projects';

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
                alert(result.error || 'Failed to fetch project');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await updateProject(projectId, formData);

            if (result.success) {
                router.push(`/dashboard/projects/${projectId}`);
                router.refresh();
            } else {
                alert(result.error || 'Failed to update project');
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
        return <div className="text-center py-12">Loading project...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Project
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border">
                <h1 className="text-2xl font-bold mb-6">Edit Project</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Project Name *</label>
                        <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Project Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Project Description *</label>
                        <textarea
                            name="projectDescription"
                            value={formData.projectDescription}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Service Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Service Type *</label>
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <label className="block text-sm font-medium mb-2">Package *</label>
                        <select
                            name="package"
                            value={formData.package}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isPending ? 'Updating...' : 'Update Project'}
                        </button>
                        <Link
                            href={`/dashboard/projects/${projectId}`}
                            className="px-6 py-2 border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}