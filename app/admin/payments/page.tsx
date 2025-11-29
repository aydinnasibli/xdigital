// app/admin/payments/page.tsx
import { DollarSign, TrendingUp, CreditCard, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function AdminPaymentsPage() {
    // Mock payment data - will be replaced with real data from payment integration
    const mockPayments = [
        {
            id: '1',
            clientName: 'John Doe',
            clientEmail: 'john@example.com',
            projectName: 'E-commerce Website',
            amount: 2500,
            status: 'completed',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-2025-001',
            date: '2025-01-15',
        },
        {
            id: '2',
            clientName: 'Jane Smith',
            clientEmail: 'jane@example.com',
            projectName: 'Mobile App Development',
            amount: 5000,
            status: 'completed',
            paymentMethod: 'Bank Transfer',
            transactionId: 'TXN-2025-002',
            date: '2025-01-14',
        },
        {
            id: '3',
            clientName: 'Mike Johnson',
            clientEmail: 'mike@example.com',
            projectName: 'SEO Optimization',
            amount: 1500,
            status: 'pending',
            paymentMethod: 'PayPal',
            transactionId: 'TXN-2025-003',
            date: '2025-01-13',
        },
        {
            id: '4',
            clientName: 'Sarah Williams',
            clientEmail: 'sarah@example.com',
            projectName: 'Social Media Management',
            amount: 800,
            status: 'completed',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-2025-004',
            date: '2025-01-12',
        },
        {
            id: '5',
            clientName: 'David Brown',
            clientEmail: 'david@example.com',
            projectName: 'Brand Identity Design',
            amount: 3200,
            status: 'failed',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-2025-005',
            date: '2025-01-11',
        },
    ];

    const totalRevenue = mockPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = mockPayments.filter(p => p.status === 'pending');
    const completedPayments = mockPayments.filter(p => p.status === 'completed');
    const failedPayments = mockPayments.filter(p => p.status === 'failed');

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Payments & Revenue</h1>
                        <p className="text-gray-400 mt-2">
                            Track all payments and revenue across projects
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-500/10 border-l-4 border-blue-500 backdrop-blur-sm rounded-r-xl p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-300">Mock Payment Data</h3>
                        <p className="text-sm text-gray-300 mt-1">
                            This page currently displays sample payment data. Once payment gateway integration is complete,
                            real transaction data will be shown here automatically.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                    trend="+12.5%"
                    trendUp={true}
                />
                <StatCard
                    title="Completed Payments"
                    value={completedPayments.length}
                    icon={CheckCircle}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Payments"
                    value={pendingPayments.length}
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Failed Payments"
                    value={failedPayments.length}
                    icon={AlertCircle}
                    color="bg-red-500"
                />
            </div>

            {/* Payments Table */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800/50">
                    <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {mockPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-white">{payment.clientName}</p>
                                            <p className="text-sm text-gray-400">{payment.clientEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {payment.projectName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-emerald-400">
                                            ${payment.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={payment.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            {payment.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {payment.transactionId}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                        <PaymentMethodRow method="Credit Card" count={3} percentage={60} />
                        <PaymentMethodRow method="Bank Transfer" count={1} percentage={20} />
                        <PaymentMethodRow method="PayPal" count={1} percentage={20} />
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <ActivityItem
                            text="Payment received from John Doe"
                            time="2 hours ago"
                            type="success"
                        />
                        <ActivityItem
                            text="New payment pending from Mike Johnson"
                            time="5 hours ago"
                            type="pending"
                        />
                        <ActivityItem
                            text="Payment failed for David Brown"
                            time="1 day ago"
                            type="error"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
    trendUp,
}: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
    trendUp?: boolean;
}) {
    const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
        'bg-green-500': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
        'bg-blue-500': { bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: 'text-blue-400' },
        'bg-yellow-500': { bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: 'text-amber-400' },
        'bg-red-500': { bg: 'bg-red-500/20', border: 'border-red-500/30', icon: 'text-red-400' },
    };

    const colors = colorMap[color] || colorMap['bg-blue-500'];

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            <TrendingUp className="w-4 h-4" />
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`${colors.bg} border ${colors.border} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
        completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
        pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' },
        failed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Failed' },
    };

    const { bg, text, border, label } = config[status] || config.pending;

    return (
        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${bg} ${text} ${border}`}>
            {label}
        </span>
    );
}

function PaymentMethodRow({ method, count, percentage }: { method: string; count: number; percentage: number }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">{method}</span>
                <span className="text-sm font-semibold text-white">{count} payments</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

function ActivityItem({ text, time, type }: { text: string; time: string; type: 'success' | 'pending' | 'error' }) {
    const iconColor = {
        success: 'text-emerald-400',
        pending: 'text-amber-400',
        error: 'text-red-400',
    }[type];

    return (
        <div className="flex items-start gap-3">
            <div className={`${iconColor} mt-0.5`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
            <div className="flex-1">
                <p className="text-sm text-white">{text}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}
