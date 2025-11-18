// app/admin/saved-filters/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getUserFilters, getSharedFilters } from '@/app/actions/saved-filters';
import { Filter, Users, Star } from 'lucide-react';
import SavedFiltersList from './SavedFiltersList';
import CreateFilterButton from './CreateFilterButton';

export default async function SavedFiltersPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const [userFiltersResult, sharedFiltersResult] = await Promise.all([
        getUserFilters(),
        getSharedFilters(),
    ]);

    const userFilters = userFiltersResult.success ? userFiltersResult.data : [];
    const sharedFilters = sharedFiltersResult.success ? sharedFiltersResult.data : [];

    // Count by entity
    const entityCounts = userFilters.reduce((acc: any, filter: any) => {
        acc[filter.entity] = (acc[filter.entity] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Saved Filters</h1>
                    <p className="text-gray-600 mt-2">Manage your saved filter configurations</p>
                </div>
                <CreateFilterButton />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Filter className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Your Filters</p>
                            <p className="text-2xl font-bold text-gray-900">{userFilters.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Shared Filters</p>
                            <p className="text-2xl font-bold text-gray-900">{sharedFilters.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Default Filters</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {userFilters.filter((f: any) => f.isDefault).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Breakdown */}
            {Object.keys(entityCounts).length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters by Entity</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(entityCounts).map(([entity, count]: [string, any]) => (
                            <div key={entity} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 capitalize">{entity}</p>
                                <p className="text-xl font-bold text-gray-900">{count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Filters */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Your Filters</h2>
                </div>
                <SavedFiltersList filters={userFilters} type="user" />
            </div>

            {/* Shared Filters */}
            {sharedFilters.length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Filters
                        </h2>
                    </div>
                    <SavedFiltersList filters={sharedFilters} type="shared" />
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 About Saved Filters</h3>
                <p className="text-blue-800 text-sm mb-3">
                    Saved filters allow you to store commonly-used filter configurations for quick access. You can save filters for projects, tasks, files, invoices, and more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                        <div className="font-medium text-blue-900">✓ Quick Access</div>
                        <div className="text-blue-700 text-xs mt-1">Apply saved filters with one click</div>
                    </div>
                    <div>
                        <div className="font-medium text-blue-900">✓ Set Defaults</div>
                        <div className="text-blue-700 text-xs mt-1">Auto-apply filters when viewing lists</div>
                    </div>
                    <div>
                        <div className="font-medium text-blue-900">✓ Share with Team</div>
                        <div className="text-blue-700 text-xs mt-1">Make filters available to everyone</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
