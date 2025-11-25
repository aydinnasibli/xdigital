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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600 mt-2">View all your payment transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <CheckCircle className="w-5 h-5 opacity-80" />
                    </div>
                    <h3 className="text-3xl font-bold">${totalPaid.toLocaleString()}</h3>
                    <p className="text-sm opacity-90 mt-1">Total Paid</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{mockPayments.length}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Payments</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {mockPayments[0] ? new Date(mockPayments[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Last Payment</p>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                    <p className="text-sm text-gray-600 mt-1">All your payment transactions</p>
                </div>

                {mockPayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                        <p className="text-gray-600">
                            Your payment history will appear here once you make your first payment.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {mockPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.transactionId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{payment.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {new Date(payment.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{payment.method}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                ${payment.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    payment.status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : payment.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
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
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-1">Payment Integration Coming Soon</h3>
                        <p className="text-sm text-blue-800">
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
