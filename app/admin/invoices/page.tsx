// app/admin/invoices/page.tsx
import Link from 'next/link';
import { getAllInvoices } from '@/app/actions/admin/invoices';
import { Eye, Plus, Send, DollarSign } from 'lucide-react';

export default async function AdminInvoicesPage({
    searchParams,
}: {
    searchParams: { status?: string; clientId?: string; projectId?: string };
}) {
    const result = await getAllInvoices({
        status: searchParams.status,
        clientId: searchParams.clientId,
        projectId: searchParams.projectId,
    });

    const invoices = result.success ? result.data : [];

    // Calculate summary stats
    const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

    const pendingAmount = invoices
        .filter((inv: any) => inv.status === 'sent')
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

    const draftCount = invoices.filter((inv: any) => inv.status === 'draft').length;
    const overdueCount = invoices.filter((inv: any) =>
        inv.status === 'sent' && new Date(inv.dueDate) < new Date()
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-2">Manage all client invoices</p>
                </div>
                <Link
                    href="/admin/invoices/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-800">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-900">
                                ${totalRevenue.toLocaleString()}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
                    </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">
                        ${pendingAmount.toLocaleString()}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Drafts</p>
                    <p className="text-2xl font-bold text-blue-900">{draftCount}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-800">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            defaultValue={searchParams.status || ''}
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice #
                                </th>
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
                                    Due Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-gray-500">No invoices found</p>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice: any) => {
                                    const isOverdue = invoice.status === 'sent' &&
                                        new Date(invoice.dueDate) < new Date();

                                    return (
                                        <tr key={invoice._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(invoice.issueDate).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">
                                                    {invoice.clientName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {invoice.clientEmail}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {invoice.projectName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">
                                                    ${invoice.total.toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={invoice.status} isOverdue={isOverdue} />
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <p className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/invoices/${invoice._id}`}
                                                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    Showing <strong>{invoices.length}</strong> invoices
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status, isOverdue }: { status: string; isOverdue: boolean }) {
    if (isOverdue) {
        return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Overdue
            </span>
        );
    }

    const statusConfig = {
        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
        sent: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sent' },
        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}