// app/admin/invoices/[id]/InvoiceActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, Download, Printer } from 'lucide-react';
import { sendInvoice, markInvoiceAsPaid } from '@/app/actions/admin/invoices';
import { toast } from 'sonner';

interface InvoiceActionsProps {
    invoice: any;
}

export default function InvoiceActions({ invoice }: InvoiceActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleSendInvoice = async () => {
        if (!confirm('Are you sure you want to send this invoice to the client?')) {
            return;
        }

        setLoading(true);
        const result = await sendInvoice(invoice._id);
        if (result.success) {
            toast.success('Invoice sent successfully! Client notified via email');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to send invoice');
        }
        setLoading(false);
    };

    const handleMarkAsPaid = async () => {
        setLoading(true);
        const result = await markInvoiceAsPaid(invoice._id, paymentMethod);
        if (result.success) {
            toast.success('Invoice marked as paid! Client notified via email');
            setShowPaymentModal(false);
            setPaymentMethod('');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to mark invoice as paid');
        }
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // In production, generate PDF using library like jsPDF or html2pdf
        const content = document.getElementById('invoice-content');
        if (content) {
            window.print();
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap gap-3">
                    {invoice.status === 'draft' && (
                        <button
                            onClick={handleSendInvoice}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            Send to Client
                        </button>
                    )}

                    {invoice.status === 'sent' && (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
                        </button>
                    )}

                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>

                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Mark Invoice as Paid</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method (Optional)
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value="">Select payment method</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="stripe">Stripe</option>
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    This will mark the invoice as paid and update the payment date to today.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentMethod('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMarkAsPaid}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
