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

interface IReaction {
    emoji: string;
    userId: Types.ObjectId;
    userName: string;
    createdAt: Date;
}

interface IMention {
    userId: Types.ObjectId;
    userName: string;
    position: number; // Character position in message
}

interface IReadReceipt {
    userId: Types.ObjectId;
    userName: string;
    readAt: Date;
}

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    clerkUserId: string;
    sender: MessageSender;
    message: string; // Plain text or rich text HTML
    messageRaw?: string; // Raw markdown or plain text before rendering
    attachments?: IAttachment[];

    // Threading
    parentMessageId?: Types.ObjectId; // For threaded replies
    threadReplies?: Types.ObjectId[]; // IDs of replies to this message

    // Reactions
    reactions?: IReaction[];

    // Mentions
    mentions?: IMention[];

    // Read receipts
    isRead: boolean;
    readAt?: Date;
    readReceipts?: IReadReceipt[];

    // Pinning
    isPinned: boolean;
    pinnedAt?: Date;
    pinnedBy?: Types.ObjectId;

    // Editing
    isEdited: boolean;
    editedAt?: Date;

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
        messageRaw: {
            type: String,
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
        // Threading
        parentMessageId: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            index: true,
        },
        threadReplies: [{
            type: Schema.Types.ObjectId,
            ref: 'Message',
        }],
        // Reactions
        reactions: [{
            emoji: {
                type: String,
                required: true,
            },
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            userName: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        // Mentions
        mentions: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            userName: {
                type: String,
                required: true,
            },
            position: {
                type: Number,
                required: true,
            },
        }],
        // Read receipts
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: Date,
        readReceipts: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            userName: {
                type: String,
                required: true,
            },
            readAt: {
                type: Date,
                default: Date.now,
            },
        }],
        // Pinning
        isPinned: {
            type: Boolean,
            default: false,
            index: true,
        },
        pinnedAt: Date,
        pinnedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        // Editing
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
MessageSchema.index({ projectId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ clerkUserId: 1, createdAt: -1 });

const Message = (mongoose.models?.Message as Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;