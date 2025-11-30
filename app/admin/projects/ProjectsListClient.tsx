// app/admin/projects/ProjectsListClient.tsx
'use client';

import { useState } from 'react';
import { CheckSquare, Square, Search } from 'lucide-react';
import { bulkUpdateProjects } from '@/app/actions/admin/projects';
import { ProjectStatus, ServiceType } from '@/models/Project';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface Project {
    _id: string;
    projectName: string;
    projectDescription: string;
    clientName: string;
    clientEmail: string;
    serviceType: string;
    package: string;
    status: string;
    createdAt: string;
}

interface Props {
    projects: Project[];
    initialStatus?: string;
    initialServiceType?: string;
    initialSearch?: string;
}

export default function ProjectsListClient({ projects, initialStatus, initialServiceType, initialSearch }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [bulkStatus, setBulkStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');

    const handleSelectAll = () => {
        if (selectedProjects.length === projects.length) {
            setSelectedProjects([]);
        } else {
            setSelectedProjects(projects.map(p => p._id));
        }
    };

    const handleSelectProject = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation(); // Prevent row click
        if (selectedProjects.includes(projectId)) {
            setSelectedProjects(selectedProjects.filter(id => id !== projectId));
        } else {
            setSelectedProjects([...selectedProjects, projectId]);
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedProjects.length === 0) {
            toast.error('Please select at least one project');
            return;
        }

        if (!bulkStatus) {
            toast.error('Please select a status');
            return;
        }

        if (!confirm(`Update ${selectedProjects.length} project(s) to status "${bulkStatus}"?`)) {
            return;
        }

        setLoading(true);
        const result = await bulkUpdateProjects(selectedProjects, { status: bulkStatus });

        if (result.success) {
            toast.success(`Updated ${selectedProjects.length} project(s) successfully`);
            setSelectedProjects([]);
            setBulkStatus('');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update projects');
        }
        setLoading(false);
    };

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/projects?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        // Debounce search
        const timeoutId = setTimeout(() => {
            router.push(`/admin/projects?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const handleRowClick = (projectId: string) => {
        router.push(`/admin/projects/${projectId}`);
    };

    return (
        <>
            {/* Filters */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Search className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={initialStatus || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
                        >
                            <option value="" className="bg-gray-900">All Statuses</option>
                            <option value={ProjectStatus.PENDING} className="bg-gray-900">Pending</option>
                            <option value={ProjectStatus.IN_PROGRESS} className="bg-gray-900">In Progress</option>
                            <option value={ProjectStatus.REVIEW} className="bg-gray-900">Review</option>
                            <option value={ProjectStatus.COMPLETED} className="bg-gray-900">Completed</option>
                            <option value={ProjectStatus.ON_HOLD} className="bg-gray-900">On Hold</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Service Type
                        </label>
                        <select
                            value={initialServiceType || ''}
                            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
                        >
                            <option value="" className="bg-gray-900">All Services</option>
                            <option value={ServiceType.WEB_DEVELOPMENT} className="bg-gray-900">Web Development</option>
                            <option value={ServiceType.SMM} className="bg-gray-900">Social Media Marketing</option>
                            <option value={ServiceType.DIGITAL_SOLUTIONS} className="bg-gray-900">
                                Digital Solutions
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedProjects.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="text-sm font-medium text-purple-300">
                            {selectedProjects.length} project(s) selected
                        </p>
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="bg-white/5 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                        >
                            <option value="" className="bg-gray-900">Change Status To...</option>
                            <option value={ProjectStatus.PENDING} className="bg-gray-900">Pending</option>
                            <option value={ProjectStatus.IN_PROGRESS} className="bg-gray-900">In Progress</option>
                            <option value={ProjectStatus.REVIEW} className="bg-gray-900">Review</option>
                            <option value={ProjectStatus.COMPLETED} className="bg-gray-900">Completed</option>
                            <option value={ProjectStatus.ON_HOLD} className="bg-gray-900">On Hold</option>
                        </select>
                        <button
                            onClick={() => void handleBulkUpdate()}
                            disabled={loading || !bulkStatus}
                            className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Updating...' : 'Apply'}
                        </button>
                        <button
                            onClick={() => setSelectedProjects([])}
                            className="px-4 py-1.5 bg-white/5 border border-gray-700 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg text-sm transition-colors"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left w-12">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title={selectedProjects.length === projects.length ? 'Deselect all' : 'Select all'}
                                    >
                                        {selectedProjects.length === projects.length ? (
                                            <CheckSquare className="w-5 h-5 text-purple-400" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Package
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-gray-400">No projects found</p>
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr
                                        key={project._id}
                                        onClick={() => handleRowClick(project._id)}
                                        className={`cursor-pointer hover:bg-white/10 transition-colors ${
                                            selectedProjects.includes(project._id) ? 'bg-purple-500/10' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => handleSelectProject(e, project._id)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                {selectedProjects.includes(project._id) ? (
                                                    <CheckSquare className="w-5 h-5 text-purple-400" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">
                                                    {project.projectName}
                                                </p>
                                                <p className="text-sm text-gray-400 line-clamp-1">
                                                    {project.projectDescription}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-gray-300">
                                                    {project.clientName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {project.clientEmail}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {formatServiceType(project.serviceType)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                                            {project.package}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                    Showing <strong className="text-white">{projects.length}</strong> projects
                    {selectedProjects.length > 0 && (
                        <span className="ml-2">
                            · <strong className="text-purple-400">{selectedProjects.length}</strong> selected
                        </span>
                    )}
                </p>
            </div>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig = {
        pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' },
        in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'In Progress' },
        review: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Review' },
        completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
        on_hold: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'On Hold' },
        cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <span
            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
        >
            {config.label}
        </span>
    );
}

function formatServiceType(type: string): string {
    const types = {
        web_development: 'Web Development',
        social_media_marketing: 'Social Media Marketing',
        digital_solutions: 'Digital Solutions',
    };
    return types[type as keyof typeof types] || type;
}
