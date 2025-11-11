// app/dashboard/projects/page.tsx
import Link from 'next/link';
import { getProjects } from '@/app/actions/projects';
import ProjectsList from '@/components/projects/ProjectsList';

export default async function ProjectsPage() {
    const result = await getProjects();

    if (!result.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{result.error || 'Failed to load projects'}</p>
            </div>
        );
    }

    const projects = result.data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-gray-600 mt-2">Manage all your projects</p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    New Project
                </Link>
            </div>

            {/* Projects List - Client Component */}
            <ProjectsList projects={projects} />
        </div>
    );
}