// app/admin/projects/page.tsx
import { getAllProjects } from '@/app/actions/admin/projects';
import { ProjectStatus, ServiceType } from '@/models/Project';
import ProjectsListClient from './ProjectsListClient';

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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">All Projects</h1>
                <p className="text-gray-400 mt-2">
                    Manage all client projects across xDigital
                </p>
            </div>

            {/* Filters */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            className="w-full bg-white/5 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            defaultValue={params.status || ''}
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
                            className="w-full bg-white/5 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            defaultValue={params.serviceType || ''}
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
                            className="w-full bg-white/5 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            defaultValue={params.search || ''}
                        />
                    </div>
                </div>
            </div>

            {/* Projects List with Bulk Operations */}
            <ProjectsListClient projects={projects} />
        </div>
    );
}