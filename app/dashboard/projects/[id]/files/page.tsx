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
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Files & Documents</h1>
                        <p className="text-gray-400 mt-2">Upload and manage project files</p>
                    </div>
                    <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 text-purple-400 hover:text-purple-300 rounded-lg transition-all"
                    >
                        ← Back to Project
                    </Link>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-white">Upload Files</h2>
                <FileUpload projectId={projectId} />
            </div>

            {/* Files List */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-white">All Files ({files.length})</h2>
                <FilesList files={files} projectId={projectId} />
            </div>
        </div>
    );
}
