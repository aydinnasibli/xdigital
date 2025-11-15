// app/admin/invoices/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/app/actions/admin/invoices';
import { getAllClients } from '@/app/actions/admin/clients';
import { getAllProjects } from '@/app/actions/admin/projects';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientId: '',
        projectId: '',
        dueDate: '',
        notes: '',
        taxRate: 0,
        discount: 0,
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (formData.clientId) {
            loadProjects();
        }
    }, [formData.clientId]);

    const loadClients = async () => {
        const result = await getAllClients();
        if (result.success) {
            setClients(result.data || []);
        }
    };

    const loadProjects = async () => {
        const result = await getAllProjects({ clientId: formData.clientId });
        if (result.success) {
            setProjects(result.data || []);
        }
    };

    const updateItemField = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate total
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
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
        setError('');
        setLoading(true);

        try {
            const result = await createInvoice({
                clientId: formData.clientId,
                projectId: formData.projectId,
                items,
                dueDate: new Date(formData.dueDate),
                notes: formData.notes || undefined,
                taxRate: formData.taxRate || undefined,
                discount: formData.discount || undefined,
            });

            if (result.success) {
                router.push('/admin/invoices');
            } else {
                setError(result.error || 'Failed to create invoice');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/invoices"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                    <p className="text-gray-600 mt-2">Create a new invoice for a client project</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Client & Project Selection */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Client & Project</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client *
                            </label>
                            <select
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: '' })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a client</option>
                                {clients.map((client) => (
                                    <option key={client._id} value={client._id}>
                                        {client.firstName} {client.lastName} ({client.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project *
                            </label>
                            <select
                                required
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                disabled={!formData.clientId}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">Select a project</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-12 md:col-span-5">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItemField(index, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItemField(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="Price"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItemField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-2">
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-900">
                                        ${item.total.toFixed(2)}
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Discount ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        {formData.taxRate > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax ({formData.taxRate}%)</span>
                                <span className="font-medium">${calculateTax().toFixed(2)}</span>
                            </div>
                        )}

                        {formData.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount</span>
                                <span className="font-medium text-red-600">-${formData.discount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-lg shadow p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optional)
                    </label>
                    <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add any additional notes or payment instructions..."
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </button>
                    <Link
                        href="/admin/invoices"
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
