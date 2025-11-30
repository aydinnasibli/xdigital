// app/dashboard/resources/[slug]/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getResource } from '@/app/actions/resources';
import Link from 'next/link';

export default async function ResourceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const { slug } = await params;
    const resourceResult = await getResource(slug);

    if (!resourceResult.success || !resourceResult.data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{resourceResult.error || 'Resource not found'}</p>
                <Link href="/dashboard/resources" className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to Resources
                </Link>
            </div>
        );
    }

    const resource = resourceResult.data;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/dashboard/resources" className="text-blue-600 hover:underline mb-4 inline-block">
                    ← Back to Resources
                </Link>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-4xl">
                            {resource.type === 'video' ? '🎥' :
                             resource.type === 'article' ? '📄' :
                             resource.type === 'download' ? '⬇️' : '🔗'}
                        </span>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white">{resource.title}</h1>
                            {resource.description && (
                                <p className="text-gray-400 mt-2">{resource.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                            {resource.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded capitalize">
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

                {/* Thumbnail */}
                {resource.thumbnailUrl && (
                    <img
                        src={resource.thumbnailUrl}
                        alt={resource.title}
                        className="w-full max-h-96 object-cover rounded-lg mb-6"
                    />
                )}

                {/* Video Embed */}
                {resource.type === 'video' && resource.videoEmbedCode && (
                    <div
                        className="mb-6 aspect-video rounded-lg overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: resource.videoEmbedCode }}
                    />
                )}

                {resource.type === 'video' && resource.videoUrl && !resource.videoEmbedCode && (
                    <video
                        controls
                        className="w-full rounded-lg mb-6"
                        src={resource.videoUrl}
                    />
                )}

                {/* Content */}
                {resource.content && (
                    <div className="prose prose-sm max-w-none mb-6">
                        <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                    </div>
                )}

                {/* Download Button */}
                {resource.type === 'download' && resource.fileUrl && (
                    <a
                        href={resource.fileUrl}
                        download={resource.fileName}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>⬇️</span>
                        <span>Download {resource.fileName || 'File'}</span>
                    </a>
                )}

                {/* External Link */}
                {resource.type === 'external' && resource.externalUrl && (
                    <a
                        href={resource.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>🔗</span>
                        <span>Visit Resource</span>
                        <span>↗</span>
                    </a>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                        <div className="text-sm text-gray-400 mb-2">Tags:</div>
                        <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Author */}
                {resource.authorName && (
                    <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                        Published by <span className="font-medium text-white">{resource.authorName}</span>
                        {resource.publishedAt && (
                            <span> on {new Date(resource.publishedAt).toLocaleDateString()}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
