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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payments & Revenue</h1>
                    <p className="text-gray-600 mt-2">
                        Track all payments and revenue across projects
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Mock Payment Data</h3>
                        <p className="text-sm text-blue-700 mt-1">
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
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{payment.clientName}</p>
                                            <p className="text-sm text-gray-500">{payment.clientEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {payment.projectName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">
                                            ${payment.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={payment.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            {payment.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {payment.transactionId}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
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
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                        <PaymentMethodRow method="Credit Card" count={3} percentage={60} />
                        <PaymentMethodRow method="Bank Transfer" count={1} percentage={20} />
                        <PaymentMethodRow method="PayPal" count={1} percentage={20} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
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
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className="w-4 h-4" />
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`${color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
        failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    };

    const { bg, text, label } = config[status] || config.pending;

    return (
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}>
            {label}
        </span>
    );
}

function PaymentMethodRow({ method, count, percentage }: { method: string; count: number; percentage: number }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">{method}</span>
                <span className="text-sm font-semibold text-gray-900">{count} payments</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

function ActivityItem({ text, time, type }: { text: string; time: string; type: 'success' | 'pending' | 'error' }) {
    const iconColor = {
        success: 'text-green-600',
        pending: 'text-yellow-600',
        error: 'text-red-600',
    }[type];

    return (
        <div className="flex items-start gap-3">
            <div className={`${iconColor} mt-0.5`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-900">{text}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}
