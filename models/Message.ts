import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum MessageSender {
    CLIENT = 'client',
    ADMIN = 'admin',
}

interface IAttachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    sender: MessageSender;
    message: string;
    attachments?: IAttachment[];
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
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
        sender: {
            type: String,
            required: true,
            enum: Object.values(MessageSender),
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        attachments: [
            {
                fileName: {
                    type: String,
                    required: true,
                },
                fileUrl: {
                    type: String,
                    required: true,
                },
                fileType: {
                    type: String,
                    required: true,
                },
                fileSize: {
                    type: Number,
                    required: true,
                },
            },
        ],
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
MessageSchema.index({ projectId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ clerkUserId: 1, createdAt: -1 });

const Message = (mongoose.models.Message as Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;