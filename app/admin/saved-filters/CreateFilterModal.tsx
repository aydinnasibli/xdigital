// app/admin/saved-filters/CreateFilterModal.tsx
'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { createSavedFilter } from '@/app/actions/saved-filters';
import { FilterEntity } from '@/models/SavedFilter';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateFilterModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        entity: FilterEntity.PROJECTS,
        sortBy: '',
        sortOrder: 'desc' as 'asc' | 'desc',
        isDefault: false,
        isShared: false,
        filters: {} as any,
    });

    const [filterKey, setFilterKey] = useState('');
    const [filterValue, setFilterValue] = useState('');

    const handleAddFilterCriteria = () => {
        if (!filterKey.trim()) {
            toast.error('Please enter a filter key');
            return;
        }

        setFormData({
            ...formData,
            filters: {
                ...formData.filters,
                [filterKey]: filterValue,
            },
        });
        setFilterKey('');
        setFilterValue('');
    };

    const handleRemoveFilterCriteria = (key: string) => {
        const newFilters = { ...formData.filters };
        delete newFilters[key];
        setFormData({ ...formData, filters: newFilters });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter a filter name');
            return;
        }

        if (Object.keys(formData.filters).length === 0) {
            toast.error('Please add at least one filter criterion');
            return;
        }

        setLoading(true);
        const result = await createSavedFilter({
            name: formData.name,
            description: formData.description || undefined,
            entity: formData.entity,
            filters: formData.filters,
            sortBy: formData.sortBy || undefined,
            sortOrder: formData.sortOrder,
            isDefault: formData.isDefault,
            isShared: formData.isShared,
        });

        if (result.success) {
            toast.success('Filter created successfully');
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || 'Failed to create filter');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Filter</h2>
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
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            placeholder="Optional description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Entity *
                        </label>
                        <select
                            value={formData.entity}
                            onChange={(e) => setFormData({ ...formData, entity: e.target.value as FilterEntity })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            required
                        >
                            <option value={FilterEntity.PROJECTS}>Projects</option>
                            <option value={FilterEntity.TASKS}>Tasks</option>
                            <option value={FilterEntity.FILES}>Files</option>
                            <option value={FilterEntity.MESSAGES}>Messages</option>
                            <option value={FilterEntity.INVOICES}>Invoices</option>
                            <option value={FilterEntity.DELIVERABLES}>Deliverables</option>
                            <option value={FilterEntity.CLIENTS}>Clients</option>
                            <option value={FilterEntity.ACTIVITIES}>Activities</option>
                        </select>
                    </div>

                    {/* Filter Criteria */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter Criteria *
                        </label>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={filterKey}
                                    onChange={(e) => setFilterKey(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="Field name (e.g., status, priority)"
                                />
                                <input
                                    type="text"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="Value (e.g., completed, high)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddFilterCriteria}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Add
                                </button>
                            </div>

                            {Object.keys(formData.filters).length > 0 && (
                                <div className="p-3 bg-gray-50 rounded border space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Active Filters:</p>
                                    {Object.entries(formData.filters).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">
                                                <span className="font-medium">{key}:</span> {String(value)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFilterCriteria(key)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                Set as default filter for {formData.entity}
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
                            {loading ? 'Creating...' : 'Create Filter'}
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
