// app/admin/templates/[id]/edit/EditTemplateForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateTemplate } from '@/app/actions/projectTemplates';
import { ServiceType, WebDevPackage } from '@/models/Project';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateData {
    _id: string;
    name: string;
    description?: string;
    serviceType: string;
    package: string;
    category?: string;
    githubRepoUrl?: string;
    demoUrl?: string;
    screenshots?: string[];
    features?: string[];
    availableForPackages?: string[];
    estimatedDurationDays: number;
    isDefault?: boolean;
    isActive?: boolean;
}

export default function EditTemplateForm({ template }: { template: TemplateData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state initialized with template data
    const [formData, setFormData] = useState({
        name: template.name || '',
        description: template.description || '',
        serviceType: template.serviceType || ServiceType.WEB_DEVELOPMENT,
        package: template.package || WebDevPackage.BASIC,
        category: template.category || '',
        githubRepoUrl: template.githubRepoUrl || '',
        demoUrl: template.demoUrl || '',
        screenshots: template.screenshots && template.screenshots.length > 0 ? template.screenshots : [''],
        features: template.features && template.features.length > 0 ? template.features : [''],
        availableForPackages: template.availableForPackages || ['basic'],
        estimatedDurationDays: template.estimatedDurationDays || 30,
        isDefault: template.isDefault || false,
        isActive: template.isActive !== undefined ? template.isActive : true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Filter out empty strings from arrays
            const cleanedData = {
                name: formData.name,
                description: formData.description,
                estimatedDurationDays: formData.estimatedDurationDays,
                isDefault: formData.isDefault,
                isActive: formData.isActive,
                // Note: screenshots, features, and availableForPackages can't be updated through this simple form
                // You may want to add full update support for these fields in the updateTemplate action
            };

            const response = await updateTemplate(template._id, cleanedData);

            if (response.success) {
                toast.success('Template updated successfully');
                router.push('/admin/templates');
                router.refresh();
            } else {
                setError(response.error || 'Failed to update template');
                toast.error(response.error || 'Failed to update template');
            }
        } catch (err) {
            const errorMsg = 'An error occurred while updating the template';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const addArrayField = (field: 'screenshots' | 'features') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
    };

    const removeArrayField = (field: 'screenshots' | 'features', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const updateArrayField = (field: 'screenshots' | 'features', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item)),
        }));
    };

    const togglePackage = (pkg: string) => {
        setFormData(prev => ({
            ...prev,
            availableForPackages: prev.availableForPackages.includes(pkg)
                ? prev.availableForPackages.filter(p => p !== pkg)
                : [...prev.availableForPackages, pkg],
        }));
    };

    return (
        <>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Basic Information</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Template Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Modern Restaurant Website"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Describe this template..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type *
                            </label>
                            <select
                                required
                                value={formData.serviceType}
                                disabled
                                className="w-full px-4 py-2 border rounded-lg bg-white/5 cursor-not-allowed"
                            >
                                <option value={ServiceType.WEB_DEVELOPMENT}>Web Development</option>
                                <option value={ServiceType.SMM}>Social Media Marketing</option>
                                <option value={ServiceType.DIGITAL_SOLUTIONS}>Digital Solutions</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Service type cannot be changed after creation</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Base Package *
                            </label>
                            <select
                                required
                                value={formData.package}
                                disabled
                                className="w-full px-4 py-2 border rounded-lg bg-white/5 cursor-not-allowed"
                            >
                                <option value={WebDevPackage.BASIC}>Basic</option>
                                <option value={WebDevPackage.STANDARD}>Standard</option>
                                <option value={WebDevPackage.PREMIUM}>Premium</option>
                                <option value={WebDevPackage.ENTERPRISE}>Enterprise</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Package cannot be changed after creation</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category (e.g., Restaurant, E-commerce, Portfolio)
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-white/5 cursor-not-allowed"
                            placeholder="e.g., Restaurant, Business, Portfolio"
                        />
                        <p className="text-xs text-gray-500 mt-1">Category cannot be changed after creation</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration (days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.estimatedDurationDays}
                            onChange={e => setFormData(prev => ({ ...prev, estimatedDurationDays: parseInt(e.target.value) || 30 }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Website URLs */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Repository & Demo</h2>
                    <p className="text-sm text-gray-500">These fields are read-only. To update URLs, please create a new template.</p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub Repository URL
                        </label>
                        <input
                            type="url"
                            value={formData.githubRepoUrl}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-white/5 cursor-not-allowed"
                            placeholder="https://github.com/username/repo-name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Demo/Preview URL
                        </label>
                        <input
                            type="url"
                            value={formData.demoUrl}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-white/5 cursor-not-allowed"
                            placeholder="https://demo.example.com"
                        />
                    </div>
                </div>

                {/* Screenshots - Read Only */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Screenshots</h2>
                    <p className="text-sm text-gray-500">Screenshots are read-only. To update, please create a new template.</p>

                    <div className="space-y-2">
                        {formData.screenshots.filter(s => s.trim() !== '').map((screenshot, index) => (
                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                                <a href={screenshot} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                    {screenshot}
                                </a>
                            </div>
                        ))}
                        {formData.screenshots.filter(s => s.trim() !== '').length === 0 && (
                            <p className="text-sm text-gray-500">No screenshots</p>
                        )}
                    </div>
                </div>

                {/* Features - Read Only */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Features</h2>
                    <p className="text-sm text-gray-500">Features are read-only. To update, please create a new template.</p>

                    <div className="space-y-2">
                        {formData.features.filter(f => f.trim() !== '').map((feature, index) => (
                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                                <p className="text-sm text-gray-700">✓ {feature}</p>
                            </div>
                        ))}
                        {formData.features.filter(f => f.trim() !== '').length === 0 && (
                            <p className="text-sm text-gray-500">No features listed</p>
                        )}
                    </div>
                </div>

                {/* Additional Options */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Template Status</h2>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={e => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Set as Default Template</div>
                            <div className="text-xs text-gray-500">This will be the suggested template for this package</div>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Template Active</div>
                            <div className="text-xs text-gray-500">Inactive templates won't be available for new projects</div>
                        </div>
                    </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Template'}
                    </button>
                </div>
            </form>
        </>
    );
}
