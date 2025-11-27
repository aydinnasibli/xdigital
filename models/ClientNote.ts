// models/ClientNote.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum NoteType {
    GENERAL = 'general',
    IMPORTANT = 'important',
    RISK = 'risk',
    OPPORTUNITY = 'opportunity',
    REMINDER = 'reminder',
}

export interface IClientNote extends Document {
    _id: mongoose.Types.ObjectId;
    clientId: Types.ObjectId; // User ID of the client
    clerkClientId: string;
    authorId: Types.ObjectId; // Admin who created the note
    authorName: string;
    type: NoteType;
    title?: string;
    content: string;
    tags?: string[];
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ClientNoteSchema = new Schema<IClientNote>(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        clerkClientId: {
            type: String,
            required: true,
            index: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(NoteType),
            default: NoteType.GENERAL,
            index: true,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        isPinned: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
ClientNoteSchema.index({ clientId: 1, createdAt: -1 });
ClientNoteSchema.index({ authorId: 1, createdAt: -1 });
ClientNoteSchema.index({ isPinned: 1, clientId: 1 });

const ClientNote = (mongoose.models?.ClientNote as Model<IClientNote>) || mongoose.model<IClientNote>('ClientNote', ClientNoteSchema);

export default ClientNote;
