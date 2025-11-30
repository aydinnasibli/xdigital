// app/admin/templates/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTemplate } from '@/app/actions/projectTemplates';
import { ServiceType, WebDevPackage } from '@/models/Project';
import { Plus, X, Upload } from 'lucide-react';

export default function NewTemplatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serviceType: ServiceType.WEB_DEVELOPMENT,
        package: WebDevPackage.BASIC,
        category: '',
        githubRepoUrl: '',
        demoUrl: '',
        screenshots: [''],
        features: [''],
        availableForPackages: ['basic'],
        estimatedDurationDays: 30,
        isDefault: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Filter out empty strings from arrays
            const cleanedData = {
                ...formData,
                screenshots: formData.screenshots.filter(s => s.trim() !== ''),
                features: formData.features.filter(f => f.trim() !== ''),
                milestones: [],
                tasks: [],
            };

            const response = await createTemplate(cleanedData);

            if (response.success) {
                router.push('/admin/templates');
            } else {
                setError(response.error || 'Failed to create template');
            }
        } catch (err) {
            setError('An error occurred while creating the template');
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Create New Template</h1>
                <p className="text-gray-400 mt-2">Add a new website template for your clients to choose from</p>
            </div>

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
                                onChange={e => setFormData(prev => ({ ...prev, serviceType: e.target.value as ServiceType }))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={ServiceType.WEB_DEVELOPMENT}>Web Development</option>
                                <option value={ServiceType.SMM}>Social Media Marketing</option>
                                <option value={ServiceType.DIGITAL_SOLUTIONS}>Digital Solutions</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Base Package *
                            </label>
                            <select
                                required
                                value={formData.package}
                                onChange={e => setFormData(prev => ({ ...prev, package: e.target.value as WebDevPackage }))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={WebDevPackage.BASIC}>Basic</option>
                                <option value={WebDevPackage.STANDARD}>Standard</option>
                                <option value={WebDevPackage.PREMIUM}>Premium</option>
                                <option value={WebDevPackage.ENTERPRISE}>Enterprise</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category (e.g., Restaurant, E-commerce, Portfolio)
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Restaurant, Business, Portfolio"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration (days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.estimatedDurationDays}
                            onChange={e => setFormData(prev => ({ ...prev, estimatedDurationDays: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Package Availability */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Package Availability</h2>
                    <p className="text-sm text-gray-400">
                        Select which pricing packages can access this template. Premium users will see templates from all lower tiers.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {['basic', 'standard', 'premium', 'enterprise'].map(pkg => (
                            <label key={pkg} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.availableForPackages.includes(pkg)}
                                    onChange={() => togglePackage(pkg)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 capitalize">{pkg}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Website URLs */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Repository & Demo</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub Repository URL
                        </label>
                        <input
                            type="url"
                            value={formData.githubRepoUrl}
                            onChange={e => setFormData(prev => ({ ...prev, githubRepoUrl: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                            onChange={e => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://demo.example.com"
                        />
                    </div>
                </div>

                {/* Screenshots */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Screenshots</h2>
                        <button
                            type="button"
                            onClick={() => addArrayField('screenshots')}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                            <Plus size={16} />
                            Add Screenshot
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.screenshots.map((screenshot, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="url"
                                    value={screenshot}
                                    onChange={e => updateArrayField('screenshots', index, e.target.value)}
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/screenshot.png"
                                />
                                {formData.screenshots.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('screenshots', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Features</h2>
                        <button
                            type="button"
                            onClick={() => addArrayField('features')}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                            <Plus size={16} />
                            Add Feature
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={e => updateArrayField('features', index, e.target.value)}
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 5 pages, Contact form, SEO optimized"
                                />
                                {formData.features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('features', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Options */}
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Additional Options</h2>

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
                        {loading ? 'Creating...' : 'Create Template'}
                    </button>
                </div>
            </form>
        </div>
    );
}
