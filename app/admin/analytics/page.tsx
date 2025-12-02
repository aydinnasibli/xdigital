// app/admin/analytics/page.tsx
import { getAllProjects } from '@/app/actions/admin/projects';
import { getAdminClientStats } from '@/app/actions/admin/clients';
import { getWebsiteAnalytics } from '@/app/actions/googleAnalytics';
import { BarChart3, TrendingUp, Users, FolderKanban, Clock, CheckCircle2, AlertCircle, DollarSign, Eye, MousePointer, Globe } from 'lucide-react';
import { isAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AdminAnalyticsPage() {
    const admin = await isAdmin();
    if (!admin) {
        redirect('/');
    }

    const [projectsResult, clientsResult, gaResult] = await Promise.all([
        getAllProjects(),
        getAdminClientStats(),
        getWebsiteAnalytics(30),
    ]);

    const projects = projectsResult.success ? projectsResult.data : [];
    const clientStats = clientsResult.success ? clientsResult.data : null;
    const websiteAnalytics = gaResult.success ? gaResult.data : null;

    // Calculate analytics
    const now = new Date();
    const thisMonthProjects = projects.filter((p: any) => {
        const createdAt = new Date(p.createdAt);
        return (
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
        );
    }).length;

    const lastMonthProjects = projects.filter((p: any) => {
        const createdAt = new Date(p.createdAt);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
            createdAt.getMonth() === lastMonth.getMonth() &&
            createdAt.getFullYear() === lastMonth.getFullYear()
        );
    }).length;

    // Projects by status
    const projectsByStatus = projects.reduce((acc: any, project: any) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});

    // Projects by service type
    const projectsByService = projects.reduce((acc: any, project: any) => {
        acc[project.serviceType] = (acc[project.serviceType] || 0) + 1;
        return acc;
    }, {});

    // Monthly project trends (last 6 months)
    const monthlyProjects = getMonthlyData(projects);

    // Calculate completion rate
    const completedProjects = projectsByStatus.completed || 0;
    const completionRate = projects.length > 0 ? ((completedProjects / projects.length) * 100).toFixed(1) : 0;

    // Active projects
    const activeProjects = (projectsByStatus.in_progress || 0) + (projectsByStatus.pending || 0);

    // Client activity
    const activeClients = new Set(
        projects
            .filter((p: any) => p.status === 'in_progress' || p.status === 'pending')
            .map((p: any) => p.userId)
    ).size;

    // Calculate growth rates
    const projectGrowth = lastMonthProjects > 0
        ? (((thisMonthProjects - lastMonthProjects) / lastMonthProjects) * 100).toFixed(1)
        : thisMonthProjects > 0 ? '100' : '0';

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-gray-400 mt-2">Comprehensive overview of business performance and trends</p>
            </div>

            {/* Key Metrics Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Projects"
                    value={projects.length}
                    subtitle="All time"
                    icon={FolderKanban}
                    color="purple"
                />
                <MetricCard
                    title="This Month"
                    value={thisMonthProjects}
                    subtitle={`${projectGrowth}% vs last month`}
                    icon={TrendingUp}
                    color="blue"
                    trend={Number(projectGrowth)}
                />
                <MetricCard
                    title="Active Projects"
                    value={activeProjects}
                    subtitle="In progress or pending"
                    icon={Clock}
                    color="orange"
                />
                <MetricCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    subtitle={`${completedProjects} completed`}
                    icon={CheckCircle2}
                    color="green"
                />
            </div>

            {/* Key Metrics Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Clients"
                    value={clientStats?.totalClients || 0}
                    subtitle={`${clientStats?.newThisMonth || 0} new this month`}
                    icon={Users}
                    color="purple"
                />
                <MetricCard
                    title="Active Clients"
                    value={activeClients}
                    subtitle="With ongoing projects"
                    icon={Users}
                    color="blue"
                />
                <MetricCard
                    title="On Hold Projects"
                    value={projectsByStatus.on_hold || 0}
                    subtitle="Require attention"
                    icon={AlertCircle}
                    color="orange"
                />
            </div>

            {/* Website Analytics Section */}
            {websiteAnalytics && (
                <>
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Website Analytics</h2>
                        <p className="text-gray-400">Last 30 days of website traffic and user engagement</p>
                    </div>

                    {/* Website Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Page Views"
                            value={websiteAnalytics.pageViews.toLocaleString()}
                            subtitle="Total views"
                            icon={Eye}
                            color="blue"
                        />
                        <MetricCard
                            title="Visitors"
                            value={websiteAnalytics.visitors.toLocaleString()}
                            subtitle="Unique visitors"
                            icon={Users}
                            color="purple"
                        />
                        <MetricCard
                            title="Sessions"
                            value={websiteAnalytics.sessions.toLocaleString()}
                            subtitle="Total sessions"
                            icon={MousePointer}
                            color="green"
                        />
                        <MetricCard
                            title="Bounce Rate"
                            value={`${(websiteAnalytics.bounceRate * 100).toFixed(1)}%`}
                            subtitle="Visitor engagement"
                            icon={TrendingUp}
                            color="orange"
                        />
                    </div>

                    {/* Website Analytics Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Pages */}
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
                                <span>Top Pages</span>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </h2>
                            <div className="space-y-3">
                                {websiteAnalytics.topPages.slice(0, 5).map((page: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-gray-300 text-sm truncate flex-1">{page.page}</span>
                                        <span className="text-white font-semibold ml-3">{page.views.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Traffic Sources */}
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
                                <span>Traffic Sources</span>
                                <Globe className="w-5 h-5 text-gray-400" />
                            </h2>
                            <div className="space-y-3">
                                {websiteAnalytics.trafficSources.slice(0, 5).map((source: any, idx: number) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-300 text-sm capitalize">{source.source}</span>
                                            <span className="text-white font-semibold">{source.sessions.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full"
                                                style={{
                                                    width: `${(source.sessions / websiteAnalytics.sessions) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Device Breakdown */}
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Device Breakdown</h2>
                            <div className="space-y-3">
                                {websiteAnalytics.deviceBreakdown.map((device: any, idx: number) => {
                                    const percentage = ((device.sessions / websiteAnalytics.sessions) * 100).toFixed(1);
                                    return (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-300 text-sm capitalize">{device.device}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-semibold">{device.sessions.toLocaleString()}</span>
                                                    <span className="text-gray-500 text-sm">({percentage}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Geographic Data */}
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Top Countries</h2>
                            <div className="space-y-3">
                                {websiteAnalytics.geographicData.slice(0, 5).map((geo: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-gray-300 text-sm">{geo.country}</span>
                                        <span className="text-white font-semibold">{geo.sessions.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects by Status */}
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
                        <span>Projects by Status</span>
                        <span className="text-sm text-gray-400 font-normal">{projects.length} total</span>
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(projectsByStatus)
                            .sort(([, a]: any, [, b]: any) => b - a)
                            .map(([status, count]: [string, any]) => {
                                const percentage = projects.length > 0 ? ((count / projects.length) * 100).toFixed(1) : 0;
                                return (
                                    <div key={status} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                                                <span className="text-gray-300 capitalize text-sm">
                                                    {status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-semibold">{count}</span>
                                                <span className="text-gray-500 text-sm">({percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${getStatusBgColor(status)}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Projects by Service Type */}
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
                        <span>Projects by Service</span>
                        <span className="text-sm text-gray-400 font-normal">{projects.length} total</span>
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(projectsByService)
                            .sort(([, a]: any, [, b]: any) => b - a)
                            .map(([service, count]: [string, any]) => {
                                const percentage = projects.length > 0 ? ((count / projects.length) * 100).toFixed(1) : 0;
                                return (
                                    <div key={service} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-300 text-sm">
                                                {formatServiceType(service)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-semibold">{count}</span>
                                                <span className="text-gray-500 text-sm">({percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Monthly Project Trends */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Project Trends (Last 6 Months)
                </h2>
                <div className="space-y-3">
                    {monthlyProjects.map((month) => (
                        <div key={month.month} className="flex items-center justify-between">
                            <span className="text-gray-300 font-medium w-24">{month.month}</span>
                            <div className="flex items-center gap-3 flex-1">
                                <div className="flex-1 bg-gray-700/50 rounded-full h-8">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 rounded-full flex items-center justify-end px-3"
                                        style={{
                                            width: `${(month.count / Math.max(...monthlyProjects.map(m => m.count))) * 100}%`,
                                        }}
                                    >
                                        <span className="text-white font-semibold text-sm">
                                            {month.count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    trend?: number;
}) {
    const colors = {
        green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
        blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: 'text-blue-400' },
        purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', icon: 'text-purple-400' },
        orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: 'text-orange-400' },
    };

    const colorScheme = colors[color as keyof typeof colors];

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg border ${colorScheme.bg} ${colorScheme.border}`}>
                    <Icon className={`w-6 h-6 ${colorScheme.icon}`} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                        {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            <p className="text-sm text-gray-300 mt-1">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
    );
}

// Helper Functions
function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-500',
        in_progress: 'bg-blue-500',
        completed: 'bg-green-500',
        on_hold: 'bg-gray-500',
        cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
}

function getStatusBgColor(status: string) {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-500',
        in_progress: 'bg-blue-500',
        completed: 'bg-green-500',
        on_hold: 'bg-gray-500',
        cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
}

function formatServiceType(service: string) {
    const formatted: Record<string, string> = {
        web_development: 'Web Development',
        social_media_marketing: 'Social Media Marketing',
        digital_solutions: 'Digital Solutions',
    };
    return formatted[service] || service;
}

function getMonthlyData(projects: any[]) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const count = projects.filter((project: any) => {
            const createdAt = new Date(project.createdAt);
            return (
                createdAt.getMonth() === date.getMonth() &&
                createdAt.getFullYear() === date.getFullYear()
            );
        }).length;

        months.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count,
        });
    }

    return months;
}
