// app/admin/resources/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getResources } from '@/app/actions/resources';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export default async function AdminResourcesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const resourcesResult = await getResources();
    const resources = resourcesResult.success ? resourcesResult.data : [];

    const stats = {
        total: resources.length,
        published: resources.filter((r: any) => r.isPublished).length,
        drafts: resources.filter((r: any) => !r.isPublished).length,
        featured: resources.filter((r: any) => r.isFeatured).length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Resources Management</h1>
                    <p className="text-gray-600 mt-2">Manage knowledge base articles, videos, and downloads</p>
                </div>
                <Link
                    href="/admin/resources/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Resource
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Total Resources</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">Published</p>
                    <p className="text-2xl font-bold text-green-900">{stats.published}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.drafts}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-800">Featured</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.featured}</p>
                </div>
            </div>

            {/* Resources Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <p className="text-6xl mb-4">📚</p>
                                            <p className="font-medium">No resources yet</p>
                                            <p className="text-sm mt-2">Create your first resource to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                resources.map((resource: any) => (
                                    <tr key={resource._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">
                                                    {resource.type === 'video' ? '🎥' :
                                                     resource.type === 'article' ? '📄' :
                                                     resource.type === 'download' ? '⬇️' : '🔗'}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{resource.title}</p>
                                                    {resource.description && (
                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                            {resource.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                                {resource.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                {resource.category?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="space-y-1">
                                                <p>{resource.viewCount || 0} views</p>
                                                {resource.downloadCount > 0 && (
                                                    <p>{resource.downloadCount} downloads</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {resource.isPublished ? (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Draft
                                                    </span>
                                                )}
                                                {resource.isFeatured && (
                                                    <span className="text-yellow-500">⭐</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/resources/${resource.slug}`}
                                                    className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/resources/${resource._id}`}
                                                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
