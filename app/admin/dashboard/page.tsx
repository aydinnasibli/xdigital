// app/admin/dashboard/page.tsx
import {
    getAdminProjectStats
} from '@/app/actions/admin/projects';
import {
    getAdminClientStats
} from '@/app/actions/admin/clients';
import {
    getAdminInvoiceStats
} from '@/app/actions/admin/invoices';
import {
    getUnreadMessageCount
} from '@/app/actions/admin/messages';
import {
    FolderKanban,
    Users,
    DollarSign,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default async function AdminDashboardPage() {
    const [projectStats, clientStats, invoiceStats, messageCount] = await Promise.all([
        getAdminProjectStats(),
        getAdminClientStats(),
        getAdminInvoiceStats(),
        getUnreadMessageCount(),
    ]);

    const projects = projectStats.success ? projectStats.data : null;
    const clients = clientStats.success ? clientStats.data : null;
    const invoices = invoiceStats.success ? invoiceStats.data : null;
    const unreadMessages = messageCount.success ? messageCount.data.count : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of all xDigital operations</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Projects"
                    value={projects?.total || 0}
                    subtitle={`${projects?.thisMonth || 0} this month`}
                    icon={FolderKanban}
                    color="blue"
                />
                <StatCard
                    title="Total Clients"
                    value={clients?.totalClients || 0}
                    subtitle={`${clients?.newThisMonth || 0} new this month`}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${invoices?.totalRevenue?.toLocaleString() || 0}`}
                    subtitle={`$${invoices?.paidThisMonth?.toLocaleString() || 0} this month`}
                    icon={DollarSign}
                    color="purple"
                />
                <StatCard
                    title="Unread Messages"
                    value={unreadMessages}
                    subtitle="Requires attention"
                    icon={MessageSquare}
                    color="orange"
                />
            </div>

            {/* Project Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StatusCard
                    title="Pending Projects"
                    value={projects?.pending || 0}
                    icon={Clock}
                    color="yellow"
                />
                <StatusCard
                    title="In Progress"
                    value={projects?.inProgress || 0}
                    icon={AlertCircle}
                    color="blue"
                />
                <StatusCard
                    title="Completed"
                    value={projects?.completed || 0}
                    icon={CheckCircle}
                    color="green"
                />
            </div>

            {/* Invoice Overview */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Pending Invoices</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {invoices?.pendingInvoices || 0}
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">Overdue Invoices</p>
                        <p className="text-2xl font-bold text-red-600">
                            {invoices?.overdueInvoices || 0}
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Paid This Month</p>
                        <p className="text-2xl font-bold text-green-600">
                            ${invoices?.paidThisMonth?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Clients */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Activity</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Clients with Active Projects</span>
                        <span className="font-semibold text-gray-900">
                            {clients?.clientsWithActiveProjects || 0}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">New Clients This Month</span>
                        <span className="font-semibold text-gray-900">
                            {clients?.newThisMonth || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
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
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
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

function StatusCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: number;
    icon: any;
    color: 'yellow' | 'blue' | 'green';
}) {
    const colorClasses = {
        yellow: 'bg-yellow-50 text-yellow-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg shadow p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <Icon className="w-10 h-10 opacity-50" />
            </div>
        </div>
    );
}