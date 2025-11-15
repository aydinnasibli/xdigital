// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectStats } from '@/app/actions/projects';
import { DashboardCharts } from '@/components/analytics/DashboardCharts';
import { getUserActivities } from '@/app/actions/activities';

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const [projectResult, activitiesResult] = await Promise.all([
        getProjectStats(),
        getUserActivities(10)
    ]);

    if (!projectResult.success || !projectResult.data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{projectResult.error || 'Failed to load dashboard'}</p>
            </div>
        );
    }

    const stats = projectResult.data.stats || { total: 0, pending: 0, inProgress: 0, completed: 0 };
    const recentProjects = projectResult.data.recentProjects || [];
    const activities = activitiesResult.success ? activitiesResult.data : [];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your projects</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-gray-600 font-medium">Total Projects</div>
                    <div className="text-3xl font-bold mt-2">{stats.total}</div>
                    <div className="text-xs text-gray-500 mt-1">All time</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-gray-600 font-medium">Pending</div>
                    <div className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</div>
                    <div className="text-xs text-gray-500 mt-1">Awaiting start</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-gray-600 font-medium">In Progress</div>
                    <div className="text-3xl font-bold mt-2 text-blue-600">{stats.inProgress}</div>
                    <div className="text-xs text-gray-500 mt-1">Active now</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-gray-600 font-medium">Completed</div>
                    <div className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</div>
                    <div className="text-xs text-gray-500 mt-1">Successfully delivered</div>
                </div>
            </div>

            {/* Charts Section */}
            {stats.total > 0 && (
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h2 className="text-xl font-semibold mb-6">Analytics Overview</h2>
                    <DashboardCharts
                        projectsByStatus={[
                            { status: 'Pending', count: stats.pending },
                            { status: 'In Progress', count: stats.inProgress },
                            { status: 'Completed', count: stats.completed },
                        ]}
                        revenueOverTime={[]}
                        healthScore={85}
                    />
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/projects/new"
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                        <div className="text-2xl mb-2">📁</div>
                        <div className="font-medium text-gray-900">Create New Project</div>
                        <div className="text-sm text-gray-500 mt-1">Start a new project request</div>
                    </Link>
                    <Link
                        href="/dashboard/projects"
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                        <div className="text-2xl mb-2">📋</div>
                        <div className="font-medium text-gray-900">View All Projects</div>
                        <div className="text-sm text-gray-500 mt-1">See your complete project list</div>
                    </Link>
                    <Link
                        href="/dashboard/notifications"
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                        <div className="text-2xl mb-2">🔔</div>
                        <div className="font-medium text-gray-900">Notifications</div>
                        <div className="text-sm text-gray-500 mt-1">Check your updates</div>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            {activities.length > 0 && (
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {activities.slice(0, 5).map((activity: any) => (
                            <div key={activity._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{activity.title}</div>
                                    {activity.description && (
                                        <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                    <div className="space-y-3">
                        {recentProjects.map((project: any) => (
                            <Link
                                key={project._id}
                                href={`/dashboard/projects/${project._id}`}
                                className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{project.projectName}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {project.projectDescription.substring(0, 100)}...
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-4 ${
                                            project.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : project.status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : project.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {project.status.replace('_', ' ').toUpperCase()}
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
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                    <p className="text-gray-600 mt-2">Get started by creating your first project and let's bring your ideas to life!</p>
                    <Link
                        href="/dashboard/projects/new"
                        className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Your First Project
                    </Link>
                </div>
            )}
        </div>
    );
}