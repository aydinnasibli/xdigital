// app/(dashboard)/dashboard/projects/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        serviceType: 'web_development',
        package: 'basic',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/dashboard/projects');
            } else {
                alert(data.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
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

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/projects" className="text-blue-600 hover:underline">
                    ← Back to Projects
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border">
                <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

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
                            placeholder="Enter project name"
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
                            placeholder="Describe your project requirements..."
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
                        <p className="text-sm text-gray-500 mt-2">
                            Select the package that best fits your needs
                        </p>
                    </div>

                    {/* Package Details Info */}
                    {formData.serviceType === 'web_development' && (
                        <div className="bg-blue-50 p-4 rounded">
                            <h3 className="font-medium mb-2">Package Details:</h3>
                            {formData.package === 'basic' && (
                                <ul className="text-sm space-y-1">
                                    <li>• Up to 5 pages</li>
                                    <li>• Basic SEO optimization</li>
                                    <li>• Mobile responsive design</li>
                                    <li>• Contact form integration</li>
                                </ul>
                            )}
                            {formData.package === 'standard' && (
                                <ul className="text-sm space-y-1">
                                    <li>• Up to 10 pages</li>
                                    <li>• Advanced SEO optimization</li>
                                    <li>• CMS integration</li>
                                    <li>• Email marketing setup</li>
                                </ul>
                            )}
                            {formData.package === 'premium' && (
                                <ul className="text-sm space-y-1">
                                    <li>• Unlimited pages</li>
                                    <li>• E-commerce functionality</li>
                                    <li>• Custom integrations</li>
                                    <li>• Analytics setup</li>
                                </ul>
                            )}
                            {formData.package === 'enterprise' && (
                                <ul className="text-sm space-y-1">
                                    <li>• Full custom solution</li>
                                    <li>• Advanced features</li>
                                    <li>• Dedicated support</li>
                                    <li>• Priority development</li>
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                        <Link
                            href="/dashboard/projects"
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