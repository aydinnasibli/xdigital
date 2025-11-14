import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum InvoiceStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    BANK_TRANSFER = 'bank_transfer',
    PAYPAL = 'paypal',
    STRIPE = 'stripe',
    OTHER = 'other',
}

interface IInvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface IInvoice extends Document {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    projectId: Types.ObjectId;
    invoiceNumber: string;
    status: InvoiceStatus;
    items: IInvoiceItem[];
    subtotal: number;
    tax?: number;
    taxRate?: number;
    discount?: number;
    total: number;
    currency: string;
    dueDate: Date;
    issueDate: Date;
    paidDate?: Date;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        clerkUserId: {
            type: String,
            required: true,
            index: true,
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.DRAFT,
        },
        items: [
            {
                description: {
                    type: String,
                    required: true,
                    trim: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                unitPrice: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                total: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            min: 0,
            default: 0,
        },
        taxRate: {
            type: Number,
            min: 0,
            max: 100,
        },
        discount: {
            type: Number,
            min: 0,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        issueDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        paidDate: Date,
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
InvoiceSchema.index({ userId: 1, status: 1, createdAt: -1 });
InvoiceSchema.index({ clerkUserId: 1, status: 1, createdAt: -1 });
InvoiceSchema.index({ projectId: 1, createdAt: -1 });


const Invoice = (mongoose.models.Invoice as Model<IInvoice>) || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;