// app/dashboard/resources/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getResources } from '@/app/actions/resources';
import Link from 'next/link';

export default async function ResourcesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const resourcesResult = await getResources();
    const resources = resourcesResult.success ? resourcesResult.data : [];

    const categories = [...new Set(resources.map((r: any) => r.category))] as string[];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
                <p className="text-gray-600 mt-2">Helpful guides, tutorials, and documents for your projects</p>
            </div>

            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    All Resources
                </button>
                {categories.map((category: string) => (
                    <button
                        key={category}
                        className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 capitalize"
                    >
                        {category.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Featured Resources */}
            {resources.filter((r: any) => r.isFeatured).length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Featured Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.filter((r: any) => r.isFeatured).map((resource: any) => (
                            <Link
                                key={resource._id}
                                href={`/dashboard/resources/${resource.slug}`}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                {resource.thumbnailUrl && (
                                    <img
                                        src={resource.thumbnailUrl}
                                        alt={resource.title}
                                        className="w-full h-40 object-cover rounded mb-3"
                                    />
                                )}
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-2xl">
                                        {resource.type === 'video' ? '🎥' :
                                         resource.type === 'article' ? '📄' :
                                         resource.type === 'download' ? '⬇️' : '🔗'}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                                        {resource.description && (
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {resource.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                                        {resource.category}
                                    </span>
                                    <span>•</span>
                                    <span>{resource.viewCount || 0} views</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* All Resources */}
            <div className="bg-white rounded-lg border shadow-sm">
                {resources.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📚</div>
                        <p>No resources available yet</p>
                        <p className="text-sm mt-2">Check back soon for helpful guides and tutorials</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {resources.map((resource: any) => (
                            <Link
                                key={resource._id}
                                href={`/dashboard/resources/${resource.slug}`}
                                className="block p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">
                                        {resource.type === 'video' ? '🎥' :
                                         resource.type === 'article' ? '📄' :
                                         resource.type === 'download' ? '⬇️' : '🔗'}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                                                {resource.description && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {resource.description}
                                                    </p>
                                                )}
                                            </div>
                                            {resource.isFeatured && (
                                                <span className="text-yellow-500 text-lg">⭐</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                {resource.category}
                                            </span>
                                            <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                {resource.type}
                                            </span>
                                            <span>•</span>
                                            <span>{resource.viewCount || 0} views</span>
                                            {resource.downloadCount > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{resource.downloadCount} downloads</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
