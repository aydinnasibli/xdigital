// app/dashboard/projects/[id]/files/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectFiles } from '@/app/actions/files';
import { FileUpload } from '@/components/files/FileUpload';
import Link from 'next/link';

export default async function ProjectFilesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const { id: projectId } = await params;
    const filesResult = await getProjectFiles(projectId);

    const files = filesResult.success ? filesResult.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Files & Documents</h1>
                    <p className="text-gray-600 mt-2">Upload and manage project files</p>
                </div>
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    ← Back to Project
                </Link>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
                <FileUpload projectId={projectId} />
            </div>

            {/* Files List */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">All Files ({files.length})</h2>
                {files.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📁</div>
                        <p>No files uploaded yet</p>
                        <p className="text-sm mt-2">Upload your first file to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file: any) => (
                            <div key={file._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 truncate">{file.fileName}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            v{file.currentVersion} • {(file.fileSize / 1024).toFixed(1)}KB
                                        </div>
                                        {file.category && (
                                            <div className="text-xs text-blue-600 mt-1 capitalize">{file.category}</div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-2">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Download
                                    </a>
                                    {file.isPreviewable && (
                                        <a
                                            href={file.previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50"
                                        >
                                            Preview
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
