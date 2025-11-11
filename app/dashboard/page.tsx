// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectStats } from '@/app/actions/projects';

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const result = await getProjectStats();

    if (!result.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{result.error || 'Failed to load dashboard'}</p>
            </div>
        );
    }

    const { stats, recentProjects } = result.data;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage your projects and track progress</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Total Projects</div>
                    <div className="text-3xl font-bold mt-2">{stats.total}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">In Progress</div>
                    <div className="text-3xl font-bold mt-2 text-blue-600">{stats.inProgress}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Completed</div>
                    <div className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/projects/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create New Project
                    </Link>
                    <Link href="/dashboard/projects" className="px-4 py-2 border rounded hover:bg-gray-50">
                        View All Projects
                    </Link>
                </div>
            </div>

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                    <div className="space-y-3">
                        {recentProjects.map((project: any) => (
                            <Link
                                key={project._id}
                                href={`/dashboard/projects/${project._id}`}
                                className="block p-4 border rounded hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{project.projectName}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {project.projectDescription.substring(0, 100)}...
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs rounded-full ${project.status === 'completed'
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
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {recentProjects.length === 0 && (
                <div className="bg-white p-12 rounded-lg border text-center">
                    <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                    <p className="text-gray-600 mt-2">Get started by creating your first project</p>
                    <Link
                        href="/dashboard/projects/new"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create Project
                    </Link>
                </div>
            )}
        </div>
    );
}