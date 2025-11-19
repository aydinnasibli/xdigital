// app/dashboard/projects/[id]/files/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectFiles } from '@/app/actions/files';
import { FileUpload } from '@/components/files/FileUpload';
import { FilesList } from '@/components/files/FilesList';
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
                <FilesList files={files} projectId={projectId} />
            </div>
        </div>
    );
}
