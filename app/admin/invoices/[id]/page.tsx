// app/admin/invoices/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInvoiceById, updateInvoice, sendInvoice, markInvoiceAsPaid, deleteInvoice } from '@/app/actions/admin/invoices';
import { ArrowLeft, Send, CheckCircle, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [invoice, setInvoice] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadInvoice();
    }, [params.id]);

    const loadInvoice = async () => {
        try {
            const result = await getInvoiceById(params.id);
            if (result.success && result.data) {
                setInvoice(result.data);
            } else {
                setError(result.error || 'Invoice not found');
            }
        } catch (err) {
            setError('Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvoice = async () => {
        if (!confirm('Send this invoice to the client?')) return;

        try {
            const result = await sendInvoice(params.id);
            if (result.success) {
                await loadInvoice();
            } else {
                setError(result.error || 'Failed to send invoice');
            }
        } catch (err) {
            setError('Failed to send invoice');
        }
    };

    const handleMarkAsPaid = async () => {
        if (!confirm('Mark this invoice as paid?')) return;

        try {
            const result = await markInvoiceAsPaid(params.id);
            if (result.success) {
                await loadInvoice();
            } else {
                setError(result.error || 'Failed to mark as paid');
            }
        } catch (err) {
            setError('Failed to mark as paid');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

        try {
            const result = await deleteInvoice(params.id);
            if (result.success) {
                router.push('/admin/invoices');
            } else {
                setError(result.error || 'Failed to delete invoice');
            }
        } catch (err) {
            setError('Failed to delete invoice');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading invoice...</div>
            </div>
        );
    }

    if (error && !invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link href="/admin/invoices" className="text-blue-600 hover:underline">
                        Back to Invoices
                    </Link>
                </div>
            </div>
        );
    }

    const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();

    return (
        <div className="space-y-6">
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
                        <p className="text-gray-600 mt-2">Invoice Details</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {invoice.status === 'draft' && (
                        <button
                            onClick={handleSendInvoice}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Send Invoice
                        </button>
                    )}

                    {invoice.status === 'sent' && (
                        <button
                            onClick={handleMarkAsPaid}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {error && invoice && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Invoice */}
            <div className="bg-white rounded-lg shadow p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                        <p className="text-gray-600 mt-1">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        {isOverdue ? (
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                                Overdue
                            </span>
                        ) : (
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                invoice.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {invoice.status === 'draft' ? 'Draft' :
                                 invoice.status === 'sent' ? 'Sent' :
                                 'Paid'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Client & Dates */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                        <p className="font-medium text-gray-900">{invoice.clientName}</p>
                        <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Project:</span> {invoice.projectName}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">Issue Date</p>
                            <p className="font-medium text-gray-900">
                                {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-300">
                            <tr>
                                <th className="text-left py-2 text-sm font-semibold text-gray-700 uppercase">
                                    Description
                                </th>
                                <th className="text-right py-2 text-sm font-semibold text-gray-700 uppercase w-20">
                                    Qty
                                </th>
                                <th className="text-right py-2 text-sm font-semibold text-gray-700 uppercase w-28">
                                    Unit Price
                                </th>
                                <th className="text-right py-2 text-sm font-semibold text-gray-700 uppercase w-32">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item: any, index: number) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-3 text-gray-900">{item.description}</td>
                                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                    <td className="py-3 text-right text-gray-600">
                                        ${item.unitPrice.toFixed(2)}
                                    </td>
                                    <td className="py-3 text-right font-medium text-gray-900">
                                        ${item.total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span>${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        {invoice.tax > 0 && (
                            <div className="flex justify-between text-gray-700">
                                <span>Tax ({invoice.taxRate}%)</span>
                                <span>${invoice.tax.toFixed(2)}</span>
                            </div>
                        )}
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>Discount</span>
                                <span>-${invoice.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-300 pt-2">
                            <span>Total</span>
                            <span>${invoice.total.toFixed(2)}</span>
                        </div>
                        {invoice.paidAmount > 0 && (
                            <>
                                <div className="flex justify-between text-green-600">
                                    <span>Paid</span>
                                    <span>-${invoice.paidAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Balance Due</span>
                                    <span>${(invoice.total - invoice.paidAmount).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}

                {/* Payment Info */}
                {invoice.paidDate && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                            <span className="font-semibold">Paid on:</span>{' '}
                            {new Date(invoice.paidDate).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
