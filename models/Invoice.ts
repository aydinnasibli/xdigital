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

export enum ItemType {
    SERVICE = 'service',
    EXPENSE = 'expense',
    TIME = 'time',
    MILESTONE = 'milestone',
}

interface IInvoiceItem {
    type: ItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    // For time-based items
    hours?: number;
    hourlyRate?: number;
    // For expenses
    expenseDate?: Date;
    expenseCategory?: string;
}

interface IPartialPayment {
    amount: number;
    paidDate: Date;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    notes?: string;
}

interface IBranding {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
}

export interface IInvoice extends Document {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    projectId: Types.ObjectId;
    milestoneId?: Types.ObjectId; // For milestone-based payment requests
    invoiceNumber: string;
    status: InvoiceStatus;
    items: IInvoiceItem[];
    subtotal: number;
    tax?: number;
    taxRate?: number;
    discount?: number;
    discountType?: 'fixed' | 'percentage';
    total: number;
    currency: string;

    // Partial payments
    partialPayments: IPartialPayment[];
    amountPaid: number;
    amountDue: number;

    // Dates
    dueDate: Date;
    issueDate: Date;
    paidDate?: Date;
    sentDate?: Date;

    // Payment
    paymentMethod?: PaymentMethod;
    paymentTerms?: string;

    // Customization
    branding?: IBranding;
    notes?: string;
    termsAndConditions?: string;
    footer?: string;

    // Late payment
    isOverdue: boolean;
    latePaymentAlertSent: boolean;
    latePaymentAlertDate?: Date;

    // Preview and send
    previewUrl?: string;
    pdfUrl?: string;

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
        milestoneId: {
            type: Schema.Types.ObjectId,
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
                type: {
                    type: String,
                    enum: Object.values(ItemType),
                    default: ItemType.SERVICE,
                },
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
                hours: Number,
                hourlyRate: Number,
                expenseDate: Date,
                expenseCategory: String,
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
        discountType: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
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
        // Partial payments
        partialPayments: [{
            amount: {
                type: Number,
                required: true,
                min: 0,
            },
            paidDate: {
                type: Date,
                required: true,
            },
            paymentMethod: {
                type: String,
                enum: Object.values(PaymentMethod),
                required: true,
            },
            transactionId: String,
            notes: String,
        }],
        amountPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        amountDue: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Dates
        dueDate: {
            type: Date,
            required: true,
            index: true,
        },
        issueDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        paidDate: Date,
        sentDate: Date,
        // Payment
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
        },
        paymentTerms: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        // Customization
        branding: {
            logoUrl: String,
            primaryColor: String,
            secondaryColor: String,
            companyName: String,
            companyAddress: String,
            companyPhone: String,
            companyEmail: String,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        termsAndConditions: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        footer: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        // Late payment
        isOverdue: {
            type: Boolean,
            default: false,
            index: true,
        },
        latePaymentAlertSent: {
            type: Boolean,
            default: false,
        },
        latePaymentAlertDate: Date,
        // Preview and send
        previewUrl: String,
        pdfUrl: String,
    },
    {
        timestamps: true,
    }
);

// Indexes
InvoiceSchema.index({ userId: 1, status: 1, createdAt: -1 });
InvoiceSchema.index({ clerkUserId: 1, status: 1, createdAt: -1 });
InvoiceSchema.index({ projectId: 1, createdAt: -1 });


const Invoice = (mongoose.models?.Invoice as Model<IInvoice>) || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;