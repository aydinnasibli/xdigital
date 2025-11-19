// models/Reminder.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum ReminderPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface IReminder extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    reminderDate: Date;
    priority: ReminderPriority;
    isCompleted: boolean;
    completedAt?: Date;
    clientId?: Types.ObjectId; // Optional: link to a client
    tags?: string[];
    createdBy: Types.ObjectId; // Admin who created it
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        reminderDate: {
            type: Date,
            required: true,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(ReminderPriority),
            default: ReminderPriority.MEDIUM,
            index: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        completedAt: {
            type: Date,
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
ReminderSchema.index({ reminderDate: 1, isCompleted: 1 });
ReminderSchema.index({ createdBy: 1, reminderDate: 1 });
ReminderSchema.index({ clientId: 1, isCompleted: 1 });

const Reminder = (mongoose.models?.Reminder as Model<IReminder>) ||
    mongoose.model<IReminder>('Reminder', ReminderSchema);

export default Reminder;
