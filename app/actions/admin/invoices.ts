// app/actions/admin/invoices.ts
'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Invoice, { InvoiceStatus } from '@/models/Invoice';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/auth/admin';
import mongoose from 'mongoose';
import { createNotification } from '@/lib/services/notification.service';
import { NotificationType } from '@/models/Notification';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface CreateInvoiceData {
    clientId: string;
    projectId: string;
    items: InvoiceItem[];
    dueDate: Date;
    notes?: string;
    taxRate?: number;
    discount?: number;
}

// Get single invoice by ID
export async function getInvoiceById(invoiceId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return { success: false, error: 'Invalid invoice ID' };
        }

        await dbConnect();

        const invoice = await Invoice.findById(invoiceId)
            .populate('userId', 'email firstName lastName')
            .populate('projectId', 'projectName')
            .lean();

        if (!invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        const user = invoice.userId as any;
        const project = invoice.projectId as any;

        const serializedInvoice = {
            ...invoice,
            _id: invoice._id.toString(),
            userId: user._id.toString(),
            projectId: project._id.toString(),
            clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            clientEmail: user.email,
            projectName: project.projectName,
        };

        return { success: true, data: serializedInvoice };
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return { success: false, error: 'Failed to fetch invoice' };
    }
}

// Get all invoices
export async function getAllInvoices(filters?: {
    status?: string;
    clientId?: string;
    projectId?: string;
}): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const query: any = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.clientId && mongoose.Types.ObjectId.isValid(filters.clientId)) {
            query.userId = filters.clientId;
        }

        if (filters?.projectId && mongoose.Types.ObjectId.isValid(filters.projectId)) {
            query.projectId = filters.projectId;
        }

        const invoices = await Invoice.find(query)
            .populate('userId', 'email firstName lastName')
            .populate('projectId', 'projectName')
            .sort({ createdAt: -1 })
            .lean();

        const serializedInvoices = invoices.map(inv => {
            const user = inv.userId as any;
            const project = inv.projectId as any;

            return {
                ...inv,
                _id: inv._id.toString(),
                userId: user._id.toString(),
                projectId: project._id.toString(),
                clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                clientEmail: user.email,
                projectName: project.projectName,
            };
        });

        return { success: true, data: serializedInvoices };
    } catch (error) {
        console.error('Error fetching all invoices:', error);
        return { success: false, error: 'Failed to fetch invoices' };
    }
}

// Create new invoice
export async function createInvoice(data: CreateInvoiceData): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(data.clientId)) {
            return { success: false, error: 'Invalid client ID' };
        }

        if (!mongoose.Types.ObjectId.isValid(data.projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        // Verify project belongs to client
        const project = await Project.findOne({
            _id: data.projectId,
            userId: data.clientId,
        });

        if (!project) {
            return { success: false, error: 'Project not found for this client' };
        }

        // Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
        const tax = data.taxRate ? (subtotal * data.taxRate) / 100 : 0;
        const discount = data.discount || 0;
        const total = subtotal + tax - discount;

        // Generate invoice number
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 }).lean();
        const lastNumber = lastInvoice?.invoiceNumber
            ? parseInt(lastInvoice.invoiceNumber.replace('INV-', ''))
            : 0;
        const invoiceNumber = `INV-${String(lastNumber + 1).padStart(5, '0')}`;

        const newInvoice = await Invoice.create({
            userId: data.clientId,
            clerkUserId: project.clerkUserId,
            projectId: data.projectId,
            invoiceNumber,
            status: InvoiceStatus.DRAFT,
            items: data.items,
            subtotal,
            tax,
            taxRate: data.taxRate,
            discount,
            total,
            currency: 'USD',
            dueDate: data.dueDate,
            issueDate: new Date(),
            notes: data.notes,
        });

        revalidatePath('/admin/invoices');
        revalidatePath(`/admin/projects/${data.projectId}`);

        return {
            success: true,
            data: {
                ...newInvoice.toObject(),
                _id: newInvoice._id.toString(),
                userId: newInvoice.userId.toString(),
                projectId: newInvoice.projectId.toString(),
            },
        };
    } catch (error) {
        console.error('Error creating invoice:', error);
        return { success: false, error: 'Failed to create invoice' };
    }
}

// Update invoice
export async function updateInvoice(
    invoiceId: string,
    updates: Partial<CreateInvoiceData>
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return { success: false, error: 'Invalid invoice ID' };
        }

        await dbConnect();

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        // Only allow editing if draft
        if (invoice.status !== InvoiceStatus.DRAFT) {
            return { success: false, error: 'Can only edit draft invoices' };
        }

        // Recalculate if items changed
        if (updates.items) {
            const subtotal = updates.items.reduce((sum, item) => sum + item.total, 0);
            const taxRate = updates.taxRate ?? invoice.taxRate ?? 0;
            const tax = (subtotal * taxRate) / 100;
            const discount = updates.discount ?? invoice.discount ?? 0;
            const total = subtotal + tax - discount;

            Object.assign(invoice, {
                ...updates,
                subtotal,
                tax,
                total,
            });
        } else {
            Object.assign(invoice, updates);
        }

        await invoice.save();

        revalidatePath('/admin/invoices');
        revalidatePath(`/admin/invoices/${invoiceId}`);

        return {
            success: true,
            data: {
                ...invoice.toObject(),
                _id: invoice._id.toString(),
                userId: invoice.userId.toString(),
                projectId: invoice.projectId.toString(),
            },
        };
    } catch (error) {
        console.error('Error updating invoice:', error);
        return { success: false, error: 'Failed to update invoice' };
    }
}

// Send invoice (change status from draft to sent)
export async function sendInvoice(invoiceId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return { success: false, error: 'Invalid invoice ID' };
        }

        await dbConnect();

        const invoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            {
                status: InvoiceStatus.SENT,
                issueDate: new Date(),
            },
            { new: true }
        ).lean();

        if (!invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        // Notify client about new invoice
        await createNotification({
            userId: invoice.clerkUserId,
            projectId: invoice.projectId.toString(),
            type: NotificationType.INVOICE,
            title: 'New Invoice',
            message: `Invoice ${invoice.invoiceNumber} for $${invoice.total.toFixed(2)} has been sent. Due by ${new Date(invoice.dueDate).toLocaleDateString()}.`,
            link: `/dashboard/projects/${invoice.projectId.toString()}`,
            sendEmail: true,
            emailSubject: `Invoice ${invoice.invoiceNumber} - $${invoice.total.toFixed(2)}`,
        });

        revalidatePath('/admin/invoices');
        revalidatePath(`/dashboard/projects/${invoice.projectId.toString()}`);

        return {
            success: true,
            data: {
                ...invoice,
                _id: invoice._id.toString(),
                userId: invoice.userId.toString(),
                projectId: invoice.projectId.toString(),
            },
        };
    } catch (error) {
        console.error('Error sending invoice:', error);
        return { success: false, error: 'Failed to send invoice' };
    }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(
    invoiceId: string,
    paymentMethod?: string
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return { success: false, error: 'Invalid invoice ID' };
        }

        await dbConnect();

        const invoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            {
                status: InvoiceStatus.PAID,
                paidDate: new Date(),
                paymentMethod,
            },
            { new: true }
        ).lean();

        if (!invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        // Notify client that payment was received
        await createNotification({
            userId: invoice.clerkUserId,
            projectId: invoice.projectId.toString(),
            type: NotificationType.INVOICE,
            title: 'Payment Received',
            message: `Payment for invoice ${invoice.invoiceNumber} ($${invoice.total.toFixed(2)}) has been confirmed. Thank you!`,
            link: `/dashboard/projects/${invoice.projectId.toString()}`,
            sendEmail: true,
            emailSubject: `Payment Confirmed - Invoice ${invoice.invoiceNumber}`,
        });

        revalidatePath('/admin/invoices');
        revalidatePath(`/dashboard/projects/${invoice.projectId.toString()}`);

        return {
            success: true,
            data: {
                ...invoice,
                _id: invoice._id.toString(),
                userId: invoice.userId.toString(),
                projectId: invoice.projectId.toString(),
            },
        };
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        return { success: false, error: 'Failed to mark invoice as paid' };
    }
}

// Delete invoice (only drafts)
export async function deleteInvoice(invoiceId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return { success: false, error: 'Invalid invoice ID' };
        }

        await dbConnect();

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        if (invoice.status !== InvoiceStatus.DRAFT) {
            return { success: false, error: 'Can only delete draft invoices' };
        }

        await Invoice.findByIdAndDelete(invoiceId);

        revalidatePath('/admin/invoices');

        return { success: true, data: { message: 'Invoice deleted successfully' } };
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return { success: false, error: 'Failed to delete invoice' };
    }
}

// Get invoice statistics for admin dashboard
export async function getAdminInvoiceStats(): Promise<ActionResponse> {
    try {
        await requireAdmin();
        await dbConnect();

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalRevenue, pendingInvoices, overdueInvoices, paidThisMonth] = await Promise.all([
            Invoice.aggregate([
                { $match: { status: InvoiceStatus.PAID } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Invoice.countDocuments({ status: InvoiceStatus.SENT }),
            Invoice.countDocuments({
                status: InvoiceStatus.SENT,
                dueDate: { $lt: now },
            }),
            Invoice.aggregate([
                {
                    $match: {
                        status: InvoiceStatus.PAID,
                        paidDate: { $gte: firstDayOfMonth },
                    },
                },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);

        return {
            success: true,
            data: {
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingInvoices,
                overdueInvoices,
                paidThisMonth: paidThisMonth[0]?.total || 0,
            },
        };
    } catch (error) {
        console.error('Error fetching invoice stats:', error);
        return { success: false, error: 'Failed to fetch invoice stats' };
    }
}