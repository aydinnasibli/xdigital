// app/admin/invoices/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { updateInvoice, getInvoiceById } from '@/app/actions/admin/invoices';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function EditInvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);

    const [formData, setFormData] = useState({
        dueDate: '',
        notes: '',
        taxRate: 0,
        discount: 0,
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);

    // Load invoice data
    useEffect(() => {
        loadInvoice();
    }, []);

    const loadInvoice = async () => {
        const result = await getInvoiceById(resolvedParams.id);

        if (!result.success || !result.data) {
            toast.error(result.error || 'Failed to load invoice');
            router.push('/admin/invoices');
            return;
        }

        const invoiceData = result.data;

        if (invoiceData.status !== 'draft') {
            toast.error('Only draft invoices can be edited');
            router.push(`/admin/invoices/${resolvedParams.id}`);
            return;
        }

        setInvoice(invoiceData);
        setFormData({
            dueDate: new Date(invoiceData.dueDate).toISOString().split('T')[0],
            notes: invoiceData.notes || '',
            taxRate: invoiceData.taxRate || 0,
            discount: invoiceData.discount || 0,
        });
        setItems(invoiceData.items || []);
        setLoading(false);
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };

        // Calculate total for this item
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        }

        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const calculateTax = () => {
        return (calculateSubtotal() * formData.taxRate) / 100;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() - formData.discount;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
            toast.error('Please fill in all item details');
            return;
        }

        if (!formData.dueDate) {
            toast.error('Please select a due date');
            return;
        }

        setSaving(true);
        const result = await updateInvoice(resolvedParams.id, {
            items,
            dueDate: new Date(formData.dueDate),
            notes: formData.notes,
            taxRate: formData.taxRate,
            discount: formData.discount,
        });

        if (result.success) {
            toast.success('Invoice updated successfully!');
            router.push(`/admin/invoices/${resolvedParams.id}`);
        } else {
            toast.error(result.error || 'Failed to update invoice');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/invoices/${resolvedParams.id}`}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
                    <p className="text-gray-600 mt-1">{invoice.invoiceNumber}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Invoice Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client
                            </label>
                            <input
                                type="text"
                                value={invoice.clientName || invoice.clientEmail}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project
                            </label>
                            <input
                                type="text"
                                value={invoice.projectName}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Line Items</h2>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                            handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        value={`$${item.total.toFixed(2)}`}
                                        disabled
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                                    />
                                </div>
                                <div className="col-span-1">
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals & Additional Info */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.taxRate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="Additional notes or payment terms..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal:</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tax ({formData.taxRate}%):</span>
                                <span>${calculateTax().toFixed(2)}</span>
                            </div>
                            {formData.discount > 0 && (
                                <div className="flex justify-between text-gray-700">
                                    <span>Discount:</span>
                                    <span>-${formData.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Link
                        href={`/admin/invoices/${resolvedParams.id}`}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
