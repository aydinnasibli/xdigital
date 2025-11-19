// app/admin/projects/[id]/CloneAsTemplateButton.tsx
'use client';

import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { cloneProjectAsTemplate } from '@/app/actions/project-templates';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CloneAsTemplateButton({ projectId, projectName }: { projectId: string; projectName: string }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: `${projectName} Template`,
        description: '',
        isDefault: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter a template name');
            return;
        }

        setLoading(true);
        const result = await cloneProjectAsTemplate(projectId, {
            name: formData.name,
            description: formData.description || undefined,
            isDefault: formData.isDefault,
        });

        if (result.success) {
            toast.success('Project cloned as template successfully');
            setIsModalOpen(false);
            router.push('/admin/templates');
        } else {
            toast.error(result.error || 'Failed to clone as template');
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
                <Copy className="w-4 h-4" />
                Clone as Template
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Clone as Template</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="My Template"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="Template description..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="rounded"
                                />
                                <label className="text-sm text-gray-700">
                                    Set as default template for this service type
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {loading ? 'Cloning...' : 'Clone as Template'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
