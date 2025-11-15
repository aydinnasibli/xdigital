// models/TimeEntry.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITimeEntry extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    taskId?: Types.ObjectId;
    userId: Types.ObjectId; // Who logged the time
    userName: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    duration: number; // Duration in minutes
    hourlyRate?: number;
    billableAmount?: number;
    isBillable: boolean;
    isInvoiced: boolean;
    invoiceId?: Types.ObjectId;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        startTime: {
            type: Date,
            required: true,
            index: true,
        },
        endTime: {
            type: Date,
            index: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        hourlyRate: {
            type: Number,
            min: 0,
        },
        billableAmount: {
            type: Number,
            min: 0,
        },
        isBillable: {
            type: Boolean,
            default: true,
            index: true,
        },
        isInvoiced: {
            type: Boolean,
            default: false,
            index: true,
        },
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            index: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
TimeEntrySchema.index({ projectId: 1, startTime: -1 });
TimeEntrySchema.index({ userId: 1, startTime: -1 });
TimeEntrySchema.index({ isBillable: 1, isInvoiced: 1 });

// Virtual for hours
TimeEntrySchema.virtual('hours').get(function() {
    return this.duration / 60;
});

const TimeEntry = (mongoose.models?.TimeEntry as Model<ITimeEntry>) || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);

export default TimeEntry;
