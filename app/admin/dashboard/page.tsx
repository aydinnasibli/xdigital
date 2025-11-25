// app/admin/dashboard/page.tsx
import {
    getAdminProjectStats
} from '@/app/actions/admin/projects';
import {
    getAdminClientStats
} from '@/app/actions/admin/clients';
import {
    FolderKanban,
    Users,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    BarChart3,
    FileText
} from 'lucide-react';
import { DashboardCharts } from '@/components/analytics/DashboardCharts';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const [projectStats, clientStats] = await Promise.all([
        getAdminProjectStats(),
        getAdminClientStats(),
    ]);

    const projects = projectStats.success ? projectStats.data : null;
    const clients = clientStats.success ? clientStats.data : null;

    // Calculate trends (mock data - you can replace with real calculations)
    const projectTrend = ((projects?.thisMonth || 0) / Math.max((projects?.total || 1) - (projects?.thisMonth || 0), 1) * 100).toFixed(1);
    const clientTrend = ((clients?.newThisMonth || 0) / Math.max((clients?.totalClients || 1) - (clients?.newThisMonth || 0), 1) * 100).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                            <p className="text-blue-100">Welcome back! Here's what's happening today</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/templates"
                                className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Templates
                            </Link>
                            <Link
                                href="/admin/analytics"
                                className="px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium flex items-center gap-2 shadow-lg"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Analytics
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ModernStatCard
                    title="Total Projects"
                    value={projects?.total || 0}
                    subtitle={`${projects?.thisMonth || 0} this month`}
                    icon={FolderKanban}
                    gradient="from-blue-500 to-blue-600"
                    trend={Number(projectTrend)}
                    trendLabel="vs last period"
                />
                <ModernStatCard
                    title="Total Clients"
                    value={clients?.totalClients || 0}
                    subtitle={`${clients?.newThisMonth || 0} new this month`}
                    icon={Users}
                    gradient="from-emerald-500 to-emerald-600"
                    trend={Number(clientTrend)}
                    trendLabel="vs last period"
                />
                <ModernStatCard
                    title="Active Clients"
                    value={clients?.clientsWithActiveProjects || 0}
                    subtitle="With active projects"
                    icon={Users}
                    gradient="from-purple-500 to-purple-600"
                    trendLabel="Currently engaged"
                />
            </div>

            {/* Project Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernStatusCard
                    title="Pending"
                    value={projects?.pending || 0}
                    icon={Clock}
                    gradient="from-amber-400 to-yellow-500"
                    description="Awaiting start"
                />
                <ModernStatusCard
                    title="In Progress"
                    value={projects?.inProgress || 0}
                    icon={AlertCircle}
                    gradient="from-blue-400 to-blue-600"
                    description="Currently active"
                />
                <ModernStatusCard
                    title="Completed"
                    value={projects?.completed || 0}
                    icon={CheckCircle}
                    gradient="from-emerald-400 to-green-600"
                    description="Successfully delivered"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Client Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Client Activity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Active Projects</span>
                                <span className="text-2xl font-bold text-blue-700">
                                    {clients?.clientsWithActiveProjects || 0}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Clients with projects</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">New This Month</span>
                                <span className="text-2xl font-bold text-purple-700">
                                    {clients?.newThisMonth || 0}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Recently onboarded</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            {projects && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
                    <DashboardCharts
                        projectsByStatus={[
                            { status: 'Pending', count: projects.pending || 0 },
                            { status: 'In Progress', count: projects.inProgress || 0 },
                            { status: 'Completed', count: projects.completed || 0 },
                        ]}
                        revenueData={[]}
                    />
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <QuickActionCard
                    href="/admin/projects"
                    icon="📁"
                    title="Manage Projects"
                    description="View and update all projects"
                    gradient="from-blue-500 to-cyan-500"
                />
                <QuickActionCard
                    href="/admin/clients"
                    icon="👥"
                    title="Manage Clients"
                    description="View client details and notes"
                    gradient="from-purple-500 to-pink-500"
                />
            </div>
        </div>
    );
}

// Modern Stat Card Component
function ModernStatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    trend,
    trendLabel,
    urgent,
}: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: any;
    gradient: string;
    trend?: number;
    trendLabel?: string;
    urgent?: boolean;
}) {
    return (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{subtitle}</p>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                    {urgent && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                            Urgent
                        </span>
                    )}
                </div>
                {trendLabel && (
                    <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
                )}
            </div>
        </div>
    );
}

// Modern Status Card Component
function ModernStatusCard({
    title,
    value,
    icon: Icon,
    gradient,
    description,
}: {
    title: string;
    value: number;
    icon: any;
    gradient: string;
    description: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
            {/* Decorative Circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium opacity-90">{title}</p>
                        <p className="text-4xl font-bold mt-1">{value}</p>
                    </div>
                </div>
                <p className="text-sm opacity-80">{description}</p>
            </div>
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
    icon: string;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
        >
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="relative z-10">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">{description}</p>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white absolute top-6 right-6 transition-colors" />
            </div>
        </Link>
    );
}
