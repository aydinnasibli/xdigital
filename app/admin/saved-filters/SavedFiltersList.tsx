// app/admin/saved-filters/SavedFiltersList.tsx
'use client';

import { useState } from 'react';
import { Edit, Trash2, Star, Users, Clock, TrendingUp, Filter as FilterIcon } from 'lucide-react';
import { deleteSavedFilter, updateSavedFilter } from '@/app/actions/saved-filters';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import EditFilterModal from './EditFilterModal';

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
    usageCount: number;
    lastUsedAt?: string;
    createdAt: string;
    userId?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function SavedFiltersList({ filters, type }: { filters: Filter[]; type: 'user' | 'shared' }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [editingFilter, setEditingFilter] = useState<Filter | null>(null);

    const handleDelete = async (filterId: string, filterName: string) => {
        if (!confirm(`Are you sure you want to delete "${filterName}"?`)) return;

        setLoading(true);
        const result = await deleteSavedFilter(filterId);
        if (result.success) {
            toast.success('Filter deleted successfully');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to delete filter');
        }
        setLoading(false);
    };

    const handleToggleDefault = async (filterId: string, currentDefault: boolean) => {
        setLoading(true);
        const result = await updateSavedFilter(filterId, { isDefault: !currentDefault });
        if (result.success) {
            toast.success(currentDefault ? 'Default status removed' : 'Set as default filter');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update filter');
        }
        setLoading(false);
    };

    const handleToggleShared = async (filterId: string, currentShared: boolean) => {
        setLoading(true);
        const result = await updateSavedFilter(filterId, { isShared: !currentShared });
        if (result.success) {
            toast.success(currentShared ? 'Filter is now private' : 'Filter shared with team');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update filter');
        }
        setLoading(false);
    };

    const getEntityColor = (entity: string) => {
        const colors: any = {
            projects: 'bg-blue-100 text-blue-800',
            tasks: 'bg-purple-100 text-purple-800',
            files: 'bg-green-100 text-green-800',
            messages: 'bg-yellow-100 text-yellow-800',
            invoices: 'bg-orange-100 text-orange-800',
            clients: 'bg-indigo-100 text-indigo-800',
            activities: 'bg-gray-100 text-gray-800',
        };
        return colors[entity] || 'bg-gray-100 text-gray-800';
    };

    if (filters.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500">
                <FilterIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No {type === 'shared' ? 'shared' : ''} filters yet</p>
                <p className="text-sm mt-1">Create your first filter to get started</p>
            </div>
        );
    }

    return (
        <>
            <div className="divide-y">
                {filters.map((filter) => (
                    <div key={filter._id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {filter.isDefault && (
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900">{filter.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${getEntityColor(filter.entity)}`}>
                                        {filter.entity}
                                    </span>
                                    {filter.isShared && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            Shared
                                        </span>
                                    )}
                                </div>
                                {filter.description && (
                                    <p className="text-sm text-gray-600 mb-3">{filter.description}</p>
                                )}

                                {/* Filter Details */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" />
                                        Used {filter.usageCount} times
                                    </div>
                                    {filter.lastUsedAt && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Last used: {new Date(filter.lastUsedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                    {filter.sortBy && (
                                        <div>
                                            Sort: {filter.sortBy} ({filter.sortOrder || 'desc'})
                                        </div>
                                    )}
                                </div>

                                {/* Filter Criteria Preview */}
                                {filter.filters && Object.keys(filter.filters).length > 0 && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded border text-xs">
                                        <p className="font-medium text-gray-700 mb-1">Filter Criteria:</p>
                                        <div className="space-y-1 text-gray-600">
                                            {Object.entries(filter.filters).map(([key, value]) => (
                                                <div key={key}>
                                                    <span className="font-medium">{key}:</span>{' '}
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {type === 'shared' && filter.userId && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Created by: {filter.userId.firstName} {filter.userId.lastName}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            {type === 'user' && (
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleToggleDefault(filter._id, filter.isDefault)}
                                        disabled={loading}
                                        className={`p-2 rounded-lg transition ${
                                            filter.isDefault
                                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        title={filter.isDefault ? 'Remove as default' : 'Set as default'}
                                    >
                                        <Star className={`w-4 h-4 ${filter.isDefault ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleShared(filter._id, filter.isShared)}
                                        disabled={loading}
                                        className={`p-2 rounded-lg transition ${
                                            filter.isShared
                                                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        title={filter.isShared ? 'Make private' : 'Share with team'}
                                    >
                                        <Users className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingFilter(filter)}
                                        disabled={loading}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        title="Edit filter"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(filter._id, filter.name)}
                                        disabled={loading}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete filter"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {editingFilter && (
                <EditFilterModal
                    filter={editingFilter}
                    onClose={() => setEditingFilter(null)}
                />
            )}
        </>
    );
}
