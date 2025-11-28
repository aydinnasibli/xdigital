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
    Zap,
    Sparkles
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-400">{projectResult.error || 'Failed to load dashboard'}</p>
                </div>
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
        <div className="space-y-8 p-6">
            {/* Hero Section - Dark Glass Design */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]"></div>

                <div className="relative p-8 md:p-12">
                    <div className="flex items-start justify-between gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm text-gray-400">Dashboard Overview</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white">
                                    {greeting}, {firstName}
                                </h1>
                                <p className="text-lg text-gray-400">
                                    You have <span className="text-purple-400 font-semibold">{stats.inProgress}</span> active {stats.inProgress === 1 ? 'project' : 'projects'}
                                    {stats.pending > 0 && (
                                        <> and <span className="text-amber-400 font-semibold">{stats.pending}</span> pending</>
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/dashboard/projects/new"
                                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 text-white font-medium"
                                >
                                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                                    New Project
                                </Link>
                                <Link
                                    href="/dashboard/projects"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all duration-200 text-gray-300 hover:text-white"
                                >
                                    View All Projects
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                    🚀
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Stats Grid - Dark Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DarkStatCard
                    title="Total Projects"
                    value={stats.total}
                    icon={FolderKanban}
                    accentColor="from-blue-500 to-cyan-500"
                    description="All time"
                />
                <DarkStatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    accentColor="from-amber-500 to-orange-500"
                    description="Awaiting start"
                    highlight={stats.pending > 0}
                />
                <DarkStatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={TrendingUp}
                    accentColor="from-purple-500 to-pink-500"
                    description="Active now"
                    highlight={stats.inProgress > 0}
                />
                <DarkStatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    accentColor="from-emerald-500 to-green-500"
                    description="Delivered"
                />
            </div>

            {/* Charts Section - Dark Glass */}
            {stats.total > 0 && (
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                            <BarChart2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Analytics Overview</h2>
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
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                                        <FolderKanban className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                                        <p className="text-sm text-gray-500">Your latest updates</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/projects"
                                    className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                                >
                                    View All
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentProjects.map((project: any) => (
                                    <DarkProjectCard key={project._id} project={project} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <DarkEmptyState />
                    )}
                </div>

                {/* Recent Activity Sidebar */}
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
                            <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Activity</h2>
                            <p className="text-xs text-gray-500">Recent updates</p>
                        </div>
                    </div>
                    {activities.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {activities.slice(0, 8).map((activity: any) => (
                                <DarkActivityItem key={activity._id} activity={activity} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Zap className="w-6 h-6 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500">No recent activity</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DarkQuickAction
                    href="/dashboard/projects/new"
                    icon={<Plus className="w-6 h-6" />}
                    title="New Project"
                    description="Start a project request"
                    accentColor="from-blue-500 to-cyan-500"
                />
                <DarkQuickAction
                    href="/dashboard/notifications"
                    icon={<Bell className="w-6 h-6" />}
                    title="Notifications"
                    description="Check updates"
                    accentColor="from-purple-500 to-pink-500"
                />
                <DarkQuickAction
                    href="/dashboard/resources"
                    icon={<Search className="w-6 h-6" />}
                    title="Resources"
                    description="Browse guides"
                    accentColor="from-emerald-500 to-teal-500"
                />
            </div>
        </div>
    );
}

// Dark Stat Card Component
function DarkStatCard({
    title,
    value,
    icon: Icon,
    accentColor,
    description,
    highlight,
}: {
    title: string;
    value: number;
    icon: any;
    accentColor: string;
    description: string;
    highlight?: boolean;
}) {
    return (
        <div className={`group relative overflow-hidden bg-black/40 backdrop-blur-xl border ${highlight ? 'border-purple-500/30' : 'border-gray-800/50'} rounded-xl p-5 hover:bg-black/60 transition-all duration-300`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

            <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${accentColor} bg-opacity-10 border border-white/10`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    {highlight && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-purple-400 font-medium">Active</span>
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}

// Dark Project Card Component
function DarkProjectCard({ project }: { project: any }) {
    const statusConfig = {
        completed: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Completed' },
        in_progress: { dot: 'bg-blue-500', text: 'text-blue-400', label: 'In Progress' },
        pending: { dot: 'bg-amber-500', text: 'text-amber-400', label: 'Pending' },
    };

    const config = statusConfig[project.status as keyof typeof statusConfig] || { dot: 'bg-gray-500', text: 'text-gray-400', label: project.status };

    return (
        <Link
            href={`/dashboard/projects/${project._id}`}
            className="group block p-4 bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 rounded-xl transition-all duration-200"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-purple-300 transition-colors truncate">
                        {project.projectName}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                        {project.projectDescription}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${config.dot} rounded-full`}></div>
                    <span className={`text-xs font-medium ${config.text}`}>
                        {config.label}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Dark Activity Item Component
function DarkActivityItem({ activity }: { activity: any }) {
    return (
        <div className="flex gap-3 p-3 bg-white/5 hover:bg-white/10 border border-gray-800/30 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{activity.title}</p>
                {activity.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.description}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

// Dark Empty State Component
function DarkEmptyState() {
    return (
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm rounded-full border border-gray-800/50 mb-6">
                <div className="text-4xl">🚀</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Get started by creating your first project and let's bring your ideas to life
            </p>
            <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 text-white font-medium"
            >
                <Plus className="w-4 h-4" />
                Create Your First Project
            </Link>
        </div>
    );
}

// Dark Quick Action Component
function DarkQuickAction({
    href,
    icon,
    title,
    description,
    accentColor,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    accentColor: string;
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-gray-800/50 hover:border-gray-700 rounded-xl p-5 transition-all duration-200"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

            <div className="relative z-10 space-y-3">
                <div className="inline-flex p-3 bg-white/5 group-hover:bg-white/10 rounded-xl transition-colors">
                    <div className="text-gray-300 group-hover:text-white transition-colors">
                        {icon}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-white text-base mb-1">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
        </Link>
    );
}
