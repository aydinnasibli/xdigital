// app/admin/feedback/FeedbackFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FeedbackFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentType = searchParams.get('type') || '';
    const currentStatus = searchParams.get('status') || '';

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/feedback?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/admin/feedback');
    };

    const hasActiveFilters = currentType || currentStatus;

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:underline font-medium"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Type
                    </label>
                    <select
                        value={currentType}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        <option value="general_feedback">General Feedback</option>
                        <option value="bug_report">Bug Reports</option>
                        <option value="feature_request">Feature Requests</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        value={currentStatus}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Resolved</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
