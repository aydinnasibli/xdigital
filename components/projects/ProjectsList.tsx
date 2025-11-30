// components/projects/ProjectsList.tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteProject } from '@/app/actions/projects';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid,
    List,
    Trash2,
    Edit,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Rocket
} from 'lucide-react';

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
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

        setDeletingId(projectId);
        startTransition(async () => {
            const result = await deleteProject(projectId);

            if (!result.success) {
                alert(result.error || 'Failed to delete project');
            }
            setDeletingId(null);
            router.refresh();
        });
    };

    if (projects.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center p-12 rounded-2xl bg-gradient-to-br from-gray-900/30 to-black/30 backdrop-blur-xl border-2 border-dashed border-gray-800">
                <div className="text-center space-y-6 max-w-md">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full border border-gray-800/50">
                        <Rocket className="w-12 h-12 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">No projects yet</h3>
                        <p className="text-gray-400">Create your first project to get started on your journey</p>
                    </div>
                    <Link
                        href="/dashboard/projects/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 text-white font-medium"
                    >
                        <Rocket className="w-4 h-4" />
                        Create Your First Project
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex justify-end">
                <div className="inline-flex items-center gap-1 p-1 bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            viewMode === 'grid'
                                ? 'bg-white/10 text-white border border-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="text-sm font-medium">Grid</span>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            viewMode === 'list'
                                ? 'bg-white/10 text-white border border-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span className="text-sm font-medium">List</span>
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onDelete={handleDelete}
                            isDeleting={deletingId === project._id}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {projects.map((project) => (
                        <ProjectListItem
                            key={project._id}
                            project={project}
                            onDelete={handleDelete}
                            isDeleting={deletingId === project._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Project Card Component for Grid View
function ProjectCard({
    project,
    onDelete,
    isDeleting
}: {
    project: Project;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) {
    const router = useRouter();

    const statusConfig = {
        completed: {
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            dot: 'bg-emerald-500',
            label: 'Completed'
        },
        in_progress: {
            icon: Loader2,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            dot: 'bg-blue-500',
            label: 'In Progress'
        },
        pending: {
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            dot: 'bg-amber-500',
            label: 'Pending'
        },
        on_hold: {
            icon: AlertCircle,
            color: 'text-gray-400',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/20',
            dot: 'bg-gray-500',
            label: 'On Hold'
        },
    };

    const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <div
            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
            className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-gray-800/50 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-200 cursor-pointer"
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-white truncate group-hover:text-purple-300 transition-colors">
                            {project.projectName}
                        </h3>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.border} border`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.dot} ${project.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                    {project.projectDescription || 'No description provided'}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-300 bg-white/5 border border-gray-800/50 rounded-lg">
                        {project.serviceType.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        {project.package}
                    </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800/50">
                    <Link
                        href={`/dashboard/projects/${project._id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 rounded-lg transition-all text-sm text-gray-300 hover:text-white"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project._id);
                        }}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Project List Item Component for List View
function ProjectListItem({
    project,
    onDelete,
    isDeleting
}: {
    project: Project;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) {
    const router = useRouter();

    const statusConfig = {
        completed: { color: 'text-emerald-400', dot: 'bg-emerald-500', label: 'Completed' },
        in_progress: { color: 'text-blue-400', dot: 'bg-blue-500', label: 'In Progress' },
        pending: { color: 'text-amber-400', dot: 'bg-amber-500', label: 'Pending' },
        on_hold: { color: 'text-gray-400', dot: 'bg-gray-500', label: 'On Hold' },
    };

    const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <div
            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
            className="group bg-black/40 backdrop-blur-xl border border-gray-800/50 hover:border-purple-500/30 rounded-xl p-5 transition-all duration-200 cursor-pointer"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors truncate">
                            {project.projectName}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.dot} ${project.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">
                        {project.projectDescription || 'No description provided'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-white/5 border border-gray-800/50 rounded">
                                {project.serviceType.replace('_', ' ')}
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded">
                                {project.package}
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/projects/${project._id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 rounded-lg transition-all text-sm text-gray-300 hover:text-white"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project._id);
                        }}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
