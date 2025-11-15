// app/admin/projects/page.tsx
import Link from 'next/link';
import { getAllProjects } from '@/app/actions/admin/projects';
import { ProjectStatus, ServiceType } from '@/models/Project';
import { Eye } from 'lucide-react';

interface PageProps {
    searchParams: Promise<{
        status?: string;
        serviceType?: string;
        search?: string
    }>;
}

export default async function AdminProjectsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const result = await getAllProjects({
        status: params.status,
        serviceType: params.serviceType,
        search: params.search,
    });

    const projects = result.success ? result.data : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
                    <p className="text-gray-600 mt-2">
                        Manage all client projects across xDigital
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            defaultValue={params.status || ''}
                        >
                            <option value="">All Statuses</option>
                            <option value={ProjectStatus.PENDING}>Pending</option>
                            <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                            <option value={ProjectStatus.REVIEW}>Review</option>
                            <option value={ProjectStatus.COMPLETED}>Completed</option>
                            <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Type
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            defaultValue={params.serviceType || ''}
                        >
                            <option value="">All Services</option>
                            <option value={ServiceType.WEB_DEVELOPMENT}>Web Development</option>
                            <option value={ServiceType.SMM}>Social Media Marketing</option>
                            <option value={ServiceType.DIGITAL_SOLUTIONS}>
                                Digital Solutions
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            defaultValue={params.search || ''}
                        />
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Package
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-gray-500">No projects found</p>
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project: any) => (
                                    <tr key={project._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {project.projectName}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {project.projectDescription}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-gray-900">
                                                    {project.clientName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {project.clientEmail}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {formatServiceType(project.serviceType)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                                            {project.package}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/projects/${project._id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    Showing <strong>{projects.length}</strong> projects
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
        in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
        review: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review' },
        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
        on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
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