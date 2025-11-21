// models/FileFolder.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFileFolder extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    description?: string;
    parentFolderId?: Types.ObjectId; // For nested folders
    path: string; // Full path like "/Designs/Logos"
    color?: string; // Optional color coding
    icon?: string; // Optional icon
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FileFolderSchema = new Schema<IFileFolder>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        parentFolderId: {
            type: Schema.Types.ObjectId,
            ref: 'FileFolder',
            index: true,
        },
        path: {
            type: String,
            required: true,
            index: true,
            validate: {
                validator: function(v: string) {
                    // Prevent path traversal attacks (no ../, ..\, absolute paths)
                    return !/(\.\.[\/\\]|^[\/\\]|^[a-zA-Z]:)/.test(v);
                },
                message: 'Invalid path: Path cannot contain ../, start with /, or be an absolute path'
            },
        },
        color: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            trim: true,
        },
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
FileFolderSchema.index({ projectId: 1, parentFolderId: 1 });
FileFolderSchema.index({ projectId: 1, path: 1 });

const FileFolder = (mongoose.models?.FileFolder as Model<IFileFolder>) || mongoose.model<IFileFolder>('FileFolder', FileFolderSchema);

export default FileFolder;
