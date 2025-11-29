// app/dashboard/projects/[id]/page.tsx
import Link from 'next/link';
import { getProject } from '@/app/actions/projects';
import ProjectDetailClient from '@/components/projects/ProjectDetailComponent';
import { ArrowLeft } from 'lucide-react';

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params
    const result = await getProject(id);

    if (!result.success) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-400">{result.error || 'Project not found'}</p>
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all text-white font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    const project = result.data;

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto border border-gray-700">
                        <span className="text-2xl">📁</span>
                    </div>
                    <p className="text-gray-400">Project not found</p>
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all text-white font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return <ProjectDetailClient project={project} />;
}
