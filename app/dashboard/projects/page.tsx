// app/dashboard/projects/page.tsx
import Link from 'next/link';
import { getProjects } from '@/app/actions/projects';
import ProjectsList from '@/components/projects/ProjectsList';
import { Plus, Sparkles } from 'lucide-react';

export default async function ProjectsPage() {
    const result = await getProjects();

    if (!result.success) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-400">{result.error || 'Failed to load projects'}</p>
                </div>
            </div>
        );
    }

    const projects = result.data || [];

    return (
        <div className="space-y-6 p-6">
            {/* Header - Glass Design */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-400">Project Management</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Projects</h1>
                    <p className="text-gray-400 mt-1">Manage and track all your projects</p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 text-white font-medium"
                >
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                    New Project
                </Link>
            </div>

            {/* Projects List */}
            <ProjectsList projects={projects} />
        </div>
    );
}
