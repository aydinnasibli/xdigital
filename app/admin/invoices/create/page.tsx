// app/admin/invoices/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/app/actions/admin/invoices';
import { getAllClients } from '@/app/actions/admin/clients';
import { getClientProjects } from '@/app/actions/admin/projects';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
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
    const [loadingProjects, setLoadingProjects] = useState(false);

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

    // Load clients on mount
    useEffect(() => {
        loadClients();
    }, []);

    // Load projects when client changes
    useEffect(() => {
        if (formData.clientId) {
            loadProjects(formData.clientId);
        } else {
            setProjects([]);
            setFormData(prev => ({ ...prev, projectId: '' }));
        }
    }, [formData.clientId]);

    const loadClients = async () => {
        const result = await getAllClients({});
        if (result.success) {
            setClients(result.data || []);
        }
    };

    const loadProjects = async (clientId: string) => {
        setLoadingProjects(true);
        const result = await getClientProjects(clientId);
        if (result.success) {
            setProjects(result.data || []);
        }
        setLoadingProjects(false);
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
        setError('');

        // Validation
        if (!formData.clientId) {
            setError('Please select a client');
            return;
        }

        if (!formData.projectId) {
            setError('Please select a project');
            return;
        }

        if (!formData.dueDate) {
            setError('Please set a due date');
            return;
        }

        if (items.length === 0 || items.every(item => !item.description)) {
            setError('Please add at least one item');
            return;
        }

        setLoading(true);

        try {
            const result = await createInvoice({
                clientId: formData.clientId,
                projectId: formData.projectId,
                items: items.filter(item => item.description), // Only include items with descriptions
                dueDate: new Date(formData.dueDate),
                notes: formData.notes,
                taxRate: formData.taxRate,
                discount: formData.discount,
            });

            if (result.success) {
                router.push('/admin/invoices');
            } else {
                setError(result.error || 'Failed to create invoice');
            }
        } catch (err) {
            setError('An error occurred while creating the invoice');
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                        <p className="text-gray-600 mt-1">Create a new invoice for a client project</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client & Project Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Client Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client *
                            </label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
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
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!formData.clientId || loadingProjects}
                                required
                            >
                                <option value="">
                                    {loadingProjects ? 'Loading projects...' : 'Select a project'}
                                </option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Invoice Items */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Invoice Items</h2>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end">
                                <div className="col-span-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) =>
                                            handleItemChange(index, 'description', e.target.value)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        placeholder="Website design, hosting, etc."
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit Price
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                            handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total
                                    </label>
                                    <input
                                        type="text"
                                        value={`$${item.total.toFixed(2)}`}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                                        disabled
                                    />
                                </div>

                                <div className="col-span-1 flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Rate (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={formData.taxRate}
                                onChange={(e) =>
                                    setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="0.00"
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
                                placeholder="0.00"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                rows={3}
                                placeholder="Payment terms, additional information..."
                            />
                        </div>
                    </div>
                </div>

                {/* Invoice Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Invoice Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal:</span>
                            <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {formData.taxRate > 0 && (
                            <div className="flex justify-between text-gray-700">
                                <span>Tax ({formData.taxRate}%):</span>
                                <span className="font-medium">${calculateTax().toFixed(2)}</span>
                            </div>
                        )}
                        {formData.discount > 0 && (
                            <div className="flex justify-between text-gray-700">
                                <span>Discount:</span>
                                <span className="font-medium text-red-600">-${formData.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-300 pt-3">
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/invoices"
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
}
