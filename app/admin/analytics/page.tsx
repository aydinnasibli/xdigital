// app/admin/analytics/page.tsx
import { getAllProjects } from '@/app/actions/admin/projects';
import { getAllInvoices } from '@/app/actions/admin/invoices';
import { getAdminClientStats } from '@/app/actions/admin/clients';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default async function AdminAnalyticsPage() {
    const [projectsResult, invoicesResult, clientsResult] = await Promise.all([
        getAllProjects(),
        getAllInvoices(),
        getAdminClientStats(),
    ]);

    const projects = projectsResult.success ? projectsResult.data : [];
    const invoices = invoicesResult.success ? invoicesResult.data : [];
    const clientStats = clientsResult.success ? clientsResult.data : null;

    // Calculate analytics
    const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

    const thisMonthRevenue = invoices
        .filter((inv: any) => {
            const paidDate = inv.paidDate ? new Date(inv.paidDate) : null;
            const now = new Date();
            return (
                inv.status === 'paid' &&
                paidDate &&
                paidDate.getMonth() === now.getMonth() &&
                paidDate.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

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
    const monthlyRevenue = getMonthlyRevenue(invoices);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of business performance and trends</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    subtitle="All time"
                    icon={DollarSign}
                    color="green"
                />
                <MetricCard
                    title="This Month"
                    value={`$${thisMonthRevenue.toLocaleString()}`}
                    subtitle="Revenue"
                    icon={TrendingUp}
                    color="blue"
                />
                <MetricCard
                    title="Total Projects"
                    value={projects.length}
                    subtitle="All time"
                    icon={BarChart3}
                    color="purple"
                />
                <MetricCard
                    title="Total Clients"
                    value={clientStats?.totalClients || 0}
                    subtitle={`${clientStats?.newThisMonth || 0} new this month`}
                    icon={Users}
                    color="orange"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Projects by Status
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(projectsByStatus).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                                    <span className="text-gray-700 capitalize">
                                        {status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-900 font-semibold">{count}</span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getStatusBgColor(status)}`}
                                            style={{
                                                width: `${(count / projects.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projects by Service Type */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Projects by Service
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(projectsByService).map(([service, count]: [string, any]) => (
                            <div key={service} className="flex items-center justify-between">
                                <span className="text-gray-700">
                                    {formatServiceType(service)}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-900 font-semibold">{count}</span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{
                                                width: `${(count / projects.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Project Trend */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Project Activity (Last 6 Months)
                    </h2>
                    <div className="space-y-2">
                        {monthlyProjects.map((month) => (
                            <div key={month.label} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{month.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {month.count}
                                    </span>
                                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-purple-500 h-1.5 rounded-full"
                                            style={{
                                                width: `${(month.count / Math.max(...monthlyProjects.map(m => m.count))) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Revenue Trend (Last 6 Months)
                    </h2>
                    <div className="space-y-2">
                        {monthlyRevenue.map((month) => (
                            <div key={month.label} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{month.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        ${month.amount.toLocaleString()}
                                    </span>
                                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full"
                                            style={{
                                                width: `${(month.amount / Math.max(...monthlyRevenue.map(m => m.amount))) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoice Status Overview */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Paid Invoices</p>
                        <p className="text-2xl font-bold text-green-600">
                            {invoices.filter((inv: any) => inv.status === 'paid').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            ${invoices
                                .filter((inv: any) => inv.status === 'paid')
                                .reduce((sum: number, inv: any) => sum + inv.total, 0)
                                .toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Pending Invoices</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {invoices.filter((inv: any) => inv.status === 'sent').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            ${invoices
                                .filter((inv: any) => inv.status === 'sent')
                                .reduce((sum: number, inv: any) => sum + inv.total, 0)
                                .toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Draft Invoices</p>
                        <p className="text-2xl font-bold text-gray-600">
                            {invoices.filter((inv: any) => inv.status === 'draft').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            ${invoices
                                .filter((inv: any) => inv.status === 'draft')
                                .reduce((sum: number, inv: any) => sum + inv.total, 0)
                                .toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: any;
    color: 'green' | 'blue' | 'purple' | 'orange';
}) {
    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className={`${colorClasses[color]} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-500',
        in_progress: 'bg-blue-500',
        review: 'bg-purple-500',
        completed: 'bg-green-500',
        on_hold: 'bg-gray-500',
        cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
}

function getStatusBgColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-500',
        in_progress: 'bg-blue-500',
        review: 'bg-purple-500',
        completed: 'bg-green-500',
        on_hold: 'bg-gray-500',
        cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
}

function formatServiceType(type: string): string {
    const types: Record<string, string> = {
        web_development: 'Web Development',
        social_media_marketing: 'Social Media Marketing',
        digital_solutions: 'Digital Solutions',
    };
    return types[type] || type;
}

function getMonthlyData(projects: any[]) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = projects.filter((p: any) => {
            const createdDate = new Date(p.createdAt);
            return (
                createdDate.getFullYear() === date.getFullYear() &&
                createdDate.getMonth() === date.getMonth()
            );
        }).length;

        months.push({
            label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count,
        });
    }

    return months;
}

function getMonthlyRevenue(invoices: any[]) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const amount = invoices
            .filter((inv: any) => {
                if (inv.status !== 'paid' || !inv.paidDate) return false;
                const paidDate = new Date(inv.paidDate);
                return (
                    paidDate.getFullYear() === date.getFullYear() &&
                    paidDate.getMonth() === date.getMonth()
                );
            })
            .reduce((sum: number, inv: any) => sum + inv.total, 0);

        months.push({
            label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            amount,
        });
    }

    return months;
}