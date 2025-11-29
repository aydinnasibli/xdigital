// app/dashboard/payments/page.tsx
import { DollarSign, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';

// Mock payment data - will be replaced with real payment integration later
const mockPayments = [
    {
        id: '1',
        amount: 2500,
        description: 'Website Development - Initial Payment',
        date: '2025-01-15',
        status: 'paid',
        method: 'Credit Card',
        transactionId: 'TXN-2025-001',
    },
    {
        id: '2',
        amount: 1200,
        description: 'Social Media Marketing - Monthly Package',
        date: '2025-01-10',
        status: 'paid',
        method: 'Bank Transfer',
        transactionId: 'TXN-2025-002',
    },
    {
        id: '3',
        amount: 3500,
        description: 'E-commerce Platform Development',
        date: '2025-01-05',
        status: 'paid',
        method: 'PayPal',
        transactionId: 'TXN-2025-003',
    },
];

export default function PaymentsPage() {
    const totalPaid = mockPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Payment History</h1>
                <p className="text-gray-400 mt-2">View all your payment transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
                    <div className="relative flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-500/30">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white relative">${totalPaid.toLocaleString()}</h3>
                    <p className="text-sm text-gray-300 mt-1 relative">Total Paid</p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white">{mockPayments.length}</h3>
                    <p className="text-sm text-gray-400 mt-1">Total Payments</p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                        {mockPayments[0] ? new Date(mockPayments[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Last Payment</p>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800/50">
                    <h2 className="text-xl font-semibold text-white">Transaction History</h2>
                    <p className="text-sm text-gray-400 mt-1">All your payment transactions</p>
                </div>

                {mockPayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Payments Yet</h3>
                        <p className="text-gray-400">
                            Your payment history will appear here once you make your first payment.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {mockPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">
                                                {payment.transactionId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300">{payment.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400">
                                                {new Date(payment.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400">{payment.method}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-white">
                                                ${payment.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    payment.status === 'paid'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : payment.status === 'pending'
                                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}
                                            >
                                                {payment.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                                                {payment.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-300 mb-1">Payment Integration Coming Soon</h3>
                        <p className="text-sm text-gray-300">
                            This is mock payment data for demonstration. Real payment integration with Stripe/PayPal will be
                            implemented soon. You'll be able to view real transaction details, download receipts, and make
                            payments directly through the platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
