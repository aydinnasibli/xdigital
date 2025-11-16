// app/admin/invoices/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, Download, Printer } from 'lucide-react';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import Project from '@/models/Project';
import dbConnect from '@/lib/database/mongodb';
import InvoiceActions from './InvoiceActions';

interface InvoiceDetailPageProps {
    params: Promise<{ id: string }>;
}

async function getInvoiceData(invoiceId: string) {
    await dbConnect();

    const invoice = await Invoice.findById(invoiceId)
        .populate('userId', 'email firstName lastName')
        .populate('projectId', 'projectName')
        .lean();

    if (!invoice) {
        return null;
    }

    const user = invoice.userId as any;
    const project = invoice.projectId as any;

    return {
        ...invoice,
        _id: invoice._id.toString(),
        userId: user._id.toString(),
        projectId: project._id.toString(),
        clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        clientEmail: user.email,
        projectName: project.projectName,
    };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
    const { id } = await params;
    const invoice = await getInvoiceData(id);

    if (!invoice) {
        notFound();
    }

    const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();
    const statusColor =
        invoice.status === 'paid'
            ? 'bg-green-100 text-green-800'
            : invoice.status === 'sent'
            ? isOverdue
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/invoices"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                        <p className="text-gray-600 mt-1">
                            Issued on {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full font-semibold ${statusColor}`}>
                        {isOverdue ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <InvoiceActions invoice={invoice} />

            {/* Invoice Preview */}
            <div className="bg-white rounded-lg shadow-lg p-8" id="invoice-content">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                        <p className="text-gray-600">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-gray-900">xDigital</h3>
                        <p className="text-sm text-gray-600 mt-1">Web Development Agency</p>
                        <p className="text-sm text-gray-600">contact@xdigital.com</p>
                    </div>
                </div>

                {/* Client & Invoice Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h4>
                        <p className="font-semibold text-gray-900">{invoice.clientName}</p>
                        <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Project:</strong> {invoice.projectName}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                <strong>Issue Date:</strong>{' '}
                                {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Due Date:</strong>{' '}
                                <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                            </p>
                        </div>
                        {invoice.status === 'paid' && invoice.paidDate && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800">
                                    <strong>Paid on:</strong>{' '}
                                    {new Date(invoice.paidDate).toLocaleDateString()}
                                </p>
                                {invoice.paymentMethod && (
                                    <p className="text-sm text-green-800">
                                        <strong>Method:</strong> {invoice.paymentMethod}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                    Quantity
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                    Unit Price
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoice.items.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900 text-center">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                                        ${item.unitPrice.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                                        ${item.total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-80">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-700">
                                <span>Subtotal:</span>
                                <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                            </div>

                            {invoice.tax && invoice.tax > 0 && (
                                <div className="flex justify-between text-sm text-gray-700">
                                    <span>Tax ({invoice.taxRate || 0}%):</span>
                                    <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                                </div>
                            )}

                            {invoice.discount && invoice.discount > 0 && (
                                <div className="flex justify-between text-sm text-gray-700">
                                    <span>Discount:</span>
                                    <span className="font-medium text-red-600">
                                        -${invoice.discount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <div className="border-t-2 border-gray-300 pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span>${invoice.total.toFixed(2)} {invoice.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">Thank you for your business!</p>
                    <p className="text-xs text-gray-500 mt-2">
                        For any questions regarding this invoice, please contact us at contact@xdigital.com
                    </p>
                </div>
            </div>
        </div>
    );
}
