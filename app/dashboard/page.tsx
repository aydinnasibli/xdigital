// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getProjectStats } from '@/app/actions/projects';
import { DashboardCharts } from '@/components/analytics/DashboardCharts';
import { getUserActivities } from '@/app/actions/activities';
import {
    FolderKanban,
    Clock,
    CheckCircle,
    TrendingUp,
    Plus,
    Bell,
    Search,
    ArrowRight,
    BarChart2,
    Calendar,
    Zap
} from 'lucide-react';

export default async function DashboardPage() {
    const { userId } = await auth();
    const user = await currentUser();

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

    const firstName = user?.firstName || 'there';
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-6">
            {/* Hero Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold mb-3">
                                {greeting}, {firstName}!
                            </h1>
                            <p className="text-lg text-purple-100 mb-6">
                                You have {stats.inProgress} active {stats.inProgress === 1 ? 'project' : 'projects'} and {stats.pending} pending
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/dashboard/projects/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Project
                                </Link>
                                <Link
                                    href="/dashboard/projects"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all font-semibold"
                                >
                                    View All Projects
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                                <div className="absolute inset-4 bg-white/20 rounded-full animate-pulse delay-75"></div>
                                <div className="absolute inset-8 bg-white/20 rounded-full animate-pulse delay-150"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                    🚀
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Total Projects"
                    value={stats.total}
                    icon={FolderKanban}
                    gradient="from-blue-500 to-cyan-500"
                    description="All time"
                />
                <ModernStatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    gradient="from-amber-500 to-yellow-500"
                    description="Awaiting start"
                    highlight={stats.pending > 0}
                />
                <ModernStatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={TrendingUp}
                    gradient="from-purple-500 to-pink-500"
                    description="Active now"
                    highlight={stats.inProgress > 0}
                />
                <ModernStatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    gradient="from-emerald-500 to-green-500"
                    description="Successfully delivered"
                />
            </div>

            {/* Charts Section */}
            {stats.total > 0 && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                            <BarChart2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
                            <p className="text-sm text-gray-500">Visual representation of your projects</p>
                        </div>
                    </div>
                    <DashboardCharts
                        projectsByStatus={[
                            { status: 'Pending', count: stats.pending },
                            { status: 'In Progress', count: stats.inProgress },
                            { status: 'Completed', count: stats.completed },
                        ]}
                        revenueData={[]}
                    />
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects - Takes 2 columns */}
                <div className="lg:col-span-2">
                    {recentProjects.length > 0 ? (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                        <FolderKanban className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
                                        <p className="text-sm text-gray-500">Your latest project updates</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/projects"
                                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentProjects.map((project: any) => (
                                    <ProjectCard key={project._id} project={project} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyStateCard />
                    )}
                </div>

                {/* Recent Activity Sidebar */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <p className="text-xs text-gray-500">Latest updates</p>
                        </div>
                    </div>
                    {activities.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {activities.slice(0, 5).map((activity: any) => (
                                <ActivityItem key={activity._id} activity={activity} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No recent activity</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard
                    href="/dashboard/projects/new"
                    icon={<Plus className="w-8 h-8" />}
                    title="New Project"
                    description="Start a new project request"
                    gradient="from-blue-500 to-cyan-500"
                />
                <QuickActionCard
                    href="/dashboard/notifications"
                    icon={<Bell className="w-8 h-8" />}
                    title="Notifications"
                    description="Check your updates"
                    gradient="from-purple-500 to-pink-500"
                />
                <QuickActionCard
                    href="/dashboard/resources"
                    icon={<Search className="w-8 h-8" />}
                    title="Resources"
                    description="Browse helpful resources"
                    gradient="from-emerald-500 to-teal-500"
                />
            </div>
        </div>
    );
}

// Modern Stat Card Component
function ModernStatCard({
    title,
    value,
    icon: Icon,
    gradient,
    description,
    highlight,
}: {
    title: string;
    value: number;
    icon: any;
    gradient: string;
    description: string;
    highlight?: boolean;
}) {
    return (
        <div className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg border ${highlight ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'} p-6 hover:shadow-xl transition-all duration-300`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {highlight && (
                        <div className="animate-pulse">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                    )}
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
    );
}

// Project Card Component
function ProjectCard({ project }: { project: any }) {
    const statusConfig = {
        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
        in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    };

    const config = statusConfig[project.status as keyof typeof statusConfig] || { bg: 'bg-gray-100', text: 'text-gray-800', label: project.status };

    return (
        <Link
            href={`/dashboard/projects/${project._id}`}
            className="group block p-5 border-2 border-gray-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition-colors truncate">
                        {project.projectName}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {project.projectDescription}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${config.bg} ${config.text} whitespace-nowrap`}>
                        {config.label}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: any }) {
    return (
        <div className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{activity.title}</p>
                {activity.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

// Empty State Card Component
function EmptyStateCard() {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-6">
                <div className="text-5xl">🚀</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No projects yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first project and let's bring your ideas to life!
            </p>
            <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
            >
                <Plus className="w-5 h-5" />
                Create Your First Project
            </Link>
        </div>
    );
}

// Quick Action Card Component
function QuickActionCard({
    href,
    icon,
    title,
    description,
    gradient,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="relative z-10">
                <div className="inline-flex p-4 bg-gray-100 rounded-xl group-hover:bg-white/20 transition-colors mb-4 group-hover:scale-110 transform duration-300">
                    <div className="text-gray-700 group-hover:text-white transition-colors">
                        {icon}
                    </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">{description}</p>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white absolute top-6 right-6 transition-colors" />
            </div>
        </Link>
    );
}
