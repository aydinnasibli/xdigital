// app/admin/activities/ActivityFeed.tsx
'use client';

import { useState } from 'react';
import {
    Activity,
    Filter,
    Calendar,
    User,
    FolderKanban,
    FileText,
    MessageSquare,
    CheckSquare,
    Settings,
    RefreshCw,
} from 'lucide-react';
import { getAllActivities } from '@/app/actions/activities';
import { toast } from 'sonner';

interface ActivityItem {
    _id: string;
    type: string;
    entityType: string;
    entityId?: string;
    projectId?: string;
    userId: string;
    userName: string;
    userImageUrl?: string;
    title: string;
    description?: string;
    metadata?: any;
    createdAt: string;
}

export default function ActivityFeed({ initialActivities }: { initialActivities: ActivityItem[] }) {
    const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        entityType: '',
        startDate: '',
        endDate: '',
    });

    const activityTypes = [
        'create',
        'update',
        'delete',
        'status_change',
        'comment',
        'upload',
        'download',
        'share',
        'assign',
        'complete',
    ];

    const entityTypes = [
        'project',
        'task',
        'file',
        'message',
        'user',
        'template',
        'note',
    ];

    const handleRefresh = async () => {
        setLoading(true);
        const filtersToApply: any = {};
        if (filters.type) filtersToApply.type = filters.type;
        if (filters.entityType) filtersToApply.entityType = filters.entityType;
        if (filters.startDate) filtersToApply.startDate = new Date(filters.startDate);
        if (filters.endDate) filtersToApply.endDate = new Date(filters.endDate);

        const result = await getAllActivities(filtersToApply, 100);
        if (result.success) {
            setActivities(result.data || []);
            toast.success('Activities refreshed');
        } else {
            toast.error(result.error || 'Failed to refresh activities');
        }
        setLoading(false);
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            entityType: '',
            startDate: '',
            endDate: '',
        });
    };

    const getActivityIcon = (type: string, entityType: string) => {
        // First check entity type
        switch (entityType) {
            case 'project':
                return FolderKanban;
            case 'task':
                return CheckSquare;
            case 'file':
                return FileText;
            case 'message':
                return MessageSquare;
            default:
                return Activity;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'create':
                return 'bg-green-100 text-green-600';
            case 'update':
                return 'bg-blue-100 text-blue-600';
            case 'delete':
                return 'bg-red-100 text-red-600';
            case 'status_change':
                return 'bg-purple-100 text-purple-600';
            case 'comment':
                return 'bg-yellow-100 text-yellow-600';
            case 'upload':
                return 'bg-indigo-100 text-indigo-600';
            case 'complete':
                return 'bg-green-100 text-green-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getTypeLabel = (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filters</span>
                        {(filters.type || filters.entityType || filters.startDate || filters.endDate) && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                Active
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {showFilters && (
                    <div className="pt-4 border-t space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Activity Type
                                </label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value="">All Types</option>
                                    {activityTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {getTypeLabel(type)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entity Type
                                </label>
                                <select
                                    value={filters.entityType}
                                    onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value="">All Entities</option>
                                    {entityTypes.map((entity) => (
                                        <option key={entity} value={entity}>
                                            {getTypeLabel(entity)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={() => {
                                    clearFilters();
                                    handleRefresh();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Recent Activities
                        <span className="ml-2 text-sm font-normal text-gray-600">
                            ({activities.length} {activities.length === 1 ? 'activity' : 'activities'})
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading activities...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No activities found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {activities.map((activity) => {
                            const Icon = getActivityIcon(activity.type, activity.entityType);
                            return (
                                <div key={activity._id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    {getTypeLabel(activity.type)}
                                                </span>
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    {getTypeLabel(activity.entityType)}
                                                </span>
                                            </div>
                                            {activity.description && (
                                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {activity.userName}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                    <p className="font-medium text-gray-700 mb-1">Metadata:</p>
                                                    <pre className="text-gray-600 overflow-x-auto">
                                                        {JSON.stringify(activity.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Stats */}
            {activities.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total Activities</p>
                        <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Unique Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Set(activities.map(a => a.userId)).size}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Activity Types</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Set(activities.map(a => a.type)).size}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Entity Types</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Set(activities.map(a => a.entityType)).size}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
