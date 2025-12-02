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

            <div className="bg-black/40 backdrop-blur-xl rounded-lg border border-gray-800/50 shadow-sm p-8">
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

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded capitalize">
                            {resource.category.replace(/_/g, ' ')}
                        </span>
                        <span className="px-3 py-1 bg-gray-700/50 text-gray-300 border border-gray-600 rounded capitalize">
                            {resource.type.replace(/_/g, ' ')}
                        </span>
                        <span>•</span>
                        <span className="text-gray-400">{resource.viewCount || 0} views</span>
                        {resource.downloadCount > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-gray-400">{resource.downloadCount} downloads</span>
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
                    <div className="mb-6 w-full">
                        <div
                            className="relative aspect-video w-full rounded-lg overflow-hidden bg-black"
                            style={{
                                position: 'relative',
                                paddingBottom: '56.25%', /* 16:9 aspect ratio */
                                height: 0,
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: resource.videoEmbedCode }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%'
                                }}
                                className="[&>iframe]:absolute [&>iframe]:top-0 [&>iframe]:left-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                            />
                        </div>
                    </div>
                )}

                {/* Video URL */}
                {resource.type === 'video' && resource.videoUrl && !resource.videoEmbedCode && (
                    <div className="mb-6 w-full">
                        <video
                            controls
                            className="w-full max-w-full rounded-lg shadow-lg"
                            src={resource.videoUrl}
                            preload="metadata"
                        >
                            <p className="text-gray-400">
                                Your browser doesn't support HTML5 video.
                                <a href={resource.videoUrl} className="text-blue-500 hover:underline ml-1">
                                    Download the video
                                </a>
                            </p>
                        </video>
                    </div>
                )}

                {/* Content - Only show for articles and tutorials */}
                {resource.content && (resource.type === 'article' || resource.type === 'tutorial' || resource.type === 'faq') && (
                    <div className="prose prose-invert prose-sm max-w-none mb-6 text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                    </div>
                )}

                {/* Download Button for Documents, Templates, Brand Assets */}
                {(resource.type === 'document' || resource.type === 'template' || resource.type === 'brand_asset') && resource.fileUrl && (
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
                {resource.type === 'link' && resource.externalUrl && (
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
                    <div className="mt-8 pt-6 border-t border-gray-800/50">
                        <div className="text-sm text-gray-400 mb-2">Tags:</div>
                        <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-700/50 text-gray-300 border border-gray-600 rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Author */}
                {resource.authorName && (
                    <div className="mt-6 pt-6 border-t border-gray-800/50 text-sm text-gray-400">
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
