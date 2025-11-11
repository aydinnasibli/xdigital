// app/(dashboard)/dashboard/projects/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        serviceType: 'web_development',
        package: 'basic',
    });

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            const data = await res.json();

            if (data.success) {
                setFormData({
                    projectName: data.project.projectName,
                    projectDescription: data.project.projectDescription,
                    serviceType: data.project.serviceType,
                    package: data.project.package,
                });
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/dashboard/projects/${projectId}`);
            } else {
                alert(data.error || 'Failed to update project');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline">
                    ← Back to Project
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border">
                <h1 className="text-2xl font-bold mb-6">Edit Project</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Project Name *
                        </label>
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
                        <label className="block text-sm font-medium mb-2">
                            Project Description *
                        </label>
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
                        <label className="block text-sm font-medium mb-2">
                            Service Type *
                        </label>
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
                        <label className="block text-sm font-medium mb-2">
                            Package *
                        </label>
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
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Updating...' : 'Update Project'}
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