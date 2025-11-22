// models/ReminderEmailLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReminderEmailLog extends Document {
    _id: mongoose.Types.ObjectId;
    adminEmail: string;
    lastSentDate: Date;
    reminderCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ReminderEmailLogSchema = new Schema<IReminderEmailLog>(
    {
        adminEmail: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        },
        lastSentDate: {
            type: Date,
            required: true,
        },
        reminderCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const ReminderEmailLog = (mongoose.models?.ReminderEmailLog as Model<IReminderEmailLog>) ||
    mongoose.model<IReminderEmailLog>('ReminderEmailLog', ReminderEmailLogSchema);

export default ReminderEmailLog;
