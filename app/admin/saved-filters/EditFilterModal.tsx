// app/admin/saved-filters/EditFilterModal.tsx
'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { updateSavedFilter } from '@/app/actions/saved-filters';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Filter {
    _id: string;
    name: string;
    description?: string;
    entity: string;
    filters: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isDefault: boolean;
    isShared: boolean;
}

export default function EditFilterModal({ filter, onClose }: { filter: Filter; onClose: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: filter.name,
        description: filter.description || '',
        sortBy: filter.sortBy || '',
        sortOrder: filter.sortOrder || 'desc',
        isDefault: filter.isDefault,
        isShared: filter.isShared,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter a filter name');
            return;
        }

        setLoading(true);
        const result = await updateSavedFilter(filter._id, {
            name: formData.name,
            description: formData.description || undefined,
            sortBy: formData.sortBy || undefined,
            sortOrder: formData.sortOrder,
            isDefault: formData.isDefault,
            isShared: formData.isShared,
        });

        if (result.success) {
            toast.success('Filter updated successfully');
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || 'Failed to update filter');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Filter</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            placeholder="My Custom Filter"
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
                            placeholder="Optional description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <input
                                type="text"
                                value={formData.sortBy}
                                onChange={(e) => setFormData({ ...formData, sortBy: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="createdAt"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort Order
                            </label>
                            <select
                                value={formData.sortOrder}
                                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value as 'asc' | 'desc' })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="rounded"
                            />
                            <label className="text-sm text-gray-700">
                                Set as default filter for {filter.entity}
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isShared}
                                onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                                className="rounded"
                            />
                            <label className="text-sm text-gray-700">
                                Share with team
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
