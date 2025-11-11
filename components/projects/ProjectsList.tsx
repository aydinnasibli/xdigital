// components/projects/ProjectsList.tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteProject } from '@/app/actions/projects';
import { useRouter } from 'next/navigation';

interface Project {
    _id: string;
    projectName: string;
    projectDescription: string;
    serviceType: string;
    package: string;
    status: string;
    createdAt: string;
}

export default function ProjectsList({ projects }: { projects: Project[] }) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        startTransition(async () => {
            const result = await deleteProject(projectId);

            if (!result.success) {
                alert(result.error || 'Failed to delete project');
            }
            // No need to manually refresh - revalidatePath handles it
            router.refresh();
        });
    };

    if (projects.length === 0) {
        return (
            <div className="bg-white p-12 rounded-lg border text-center">
                <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="text-gray-600 mt-2">Create your first project to get started</p>
                <Link
                    href="/dashboard/projects/new"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Create Project
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* View Mode Toggle */}
            <div className="flex justify-end">
                <div className="flex gap-1 border rounded">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project._id} className="bg-white p-6 rounded-lg border">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg">{project.projectName}</h3>
                                <span
                                    className={`px-2 py-1 text-xs rounded-full ${project.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : project.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-800'
                                                : project.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {project.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                {project.projectDescription.substring(0, 100)}
                                {project.projectDescription.length > 100 ? '...' : ''}
                            </p>
                            <div className="flex gap-2 text-xs text-gray-500 mb-4">
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                    {project.serviceType.replace('_', ' ')}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded">{project.package}</span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/projects/${project._id}`}
                                    className="flex-1 text-center px-3 py-2 border rounded hover:bg-gray-50"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`/dashboard/projects/${project._id}/edit`}
                                    className="flex-1 text-center px-3 py-2 border rounded hover:bg-gray-50"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(project._id)}
                                    disabled={isPending}
                                    className="px-3 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-lg border">
                    {projects.map((project) => (
                        <div key={project._id} className="p-6 border-b last:border-b-0">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{project.projectName}</h3>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${project.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : project.status === 'in_progress'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : project.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{project.projectDescription}</p>
                                    <div className="flex gap-2 text-xs text-gray-500 mt-3">
                                        <span className="px-2 py-1 bg-gray-100 rounded">
                                            {project.serviceType.replace('_', ' ')}
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 rounded">{project.package}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Link
                                        href={`/dashboard/projects/${project._id}`}
                                        className="px-3 py-2 border rounded hover:bg-gray-50"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/dashboard/projects/${project._id}/edit`}
                                        className="px-3 py-2 border rounded hover:bg-gray-50"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(project._id)}
                                        disabled={isPending}
                                        className="px-3 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}