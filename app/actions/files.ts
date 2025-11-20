// app/actions/files.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import File, { FileCategory, FileVisibility } from '@/models/File';
import User from '@/models/User';
import mongoose from 'mongoose';
import { logActivity } from './activities';
import { ActivityType, ActivityEntity } from '@/models/Activity';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all files for a project
export async function getProjectFiles(projectId: string, folderId?: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = { projectId };
        if (folderId) {
            query.folderId = folderId;
        } else {
            query.folderId = { $exists: false };
        }

        const files = await File.find(query)
            .populate('uploadedBy', 'firstName lastName email imageUrl')
            .sort({ createdAt: -1 })
            .lean();

        const serializedFiles = files.map(file => {
            const baseFile = toSerializedObject(file);
            const baseUploadedBy = toSerializedObject(file.uploadedBy);
            return {
            ...baseFile,file,
            _id: file._id.toString(),
            projectId: file.projectId.toString(),
            uploadedBy: {
                ...baseFi...baseUploadedBy,
                _id: file.uploadedBy._id.toString(),
            },
                    };
        });

        return { success: true, data: serializedFiles };
    } catch (error) {
        logError(error as Error, { context: 'getProjectFiles', projectId });
        return { success: false, error: 'Failed to fetch files' };
    }
}

// Upload file metadata (actual upload handled by Cloudinary/S3 on client)
export async function createFile(data: {
    projectId: string;
    folderId?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category?: FileCategory;
    visibility?: FileVisibility;
    description?: string;
    tags?: string[];
    thumbnailUrl?: string;
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Determine if file is previewable
        const previewableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        const isPreviewable = previewableTypes.includes(data.fileType);

        const file = await File.create({
            ...data,
            uploadedBy: user._id,
            isPreviewable,
            previewUrl: isPreviewable ? data.fileUrl : undefined,
            currentVersion: 1,
            versions: [{
                versionNumber: 1,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileSize: data.fileSize,
                uploadedBy: user._id,
                uploadedAt: new Date(),
            }],
        });

        await logActivity({
            type: ActivityType.FILE_UPLOADED,
            entityType: ActivityEntity.FILE,
            entityId: file._id.toString(),
            projectId: data.projectId,
            title: `Uploaded file: ${data.fileName}`,
        });

        revalidatePath(`/dashboard/projects/${data.projectId}`);

        return { success: true, data: toSerializedObject(file) };
    } catch (error) {
        logError(error as Error, { context: 'createFile', projectId: data.projectId });
        return { success: false, error: 'Failed to create file' };
    }
}

// Upload new version of file
export async function uploadFileVersion(fileId: string, fileUrl: string, fileName: string, fileSize: number, notes?: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const file = await File.findById(fileId);

        if (!file) {
            return { success: false, error: 'File not found' };
        }

        file.currentVersion += 1;
        file.fileUrl = fileUrl;
        file.fileName = fileName;
        file.fileSize = fileSize;

        file.versions.push({
            versionNumber: file.currentVersion,
            fileUrl,
            fileName,
            fileSize,
            uploadedBy: user!._id,
            uploadedAt: new Date(),
            notes,
        });

        await file.save();

        await logActivity({
            type: ActivityType.FILE_UPDATED,
            entityType: ActivityEntity.FILE,
            entityId: fileId,
            projectId: file.projectId.toString(),
            title: `Updated file to v${file.currentVersion}: ${fileName}`,
        });

        revalidatePath(`/dashboard/projects/${file.projectId}`);

        return { success: true, data: toSerializedObject(file) };
    } catch (error) {
        logError(error as Error, { context: 'uploadFileVersion', fileId });
        return { success: false, error: 'Failed to upload file version' };
    }
}

// Add comment to file
export async function addFileComment(fileId: string, comment: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const file = await File.findById(fileId);

        if (!file) {
            return { success: false, error: 'File not found' };
        }

        file.comments.push({
            userId: user!._id,
            userName: `${user!.firstName} ${user!.lastName}`.trim() || user!.email,
            userImageUrl: user!.imageUrl,
            comment,
            createdAt: new Date(),
        });

        await file.save();

        await logActivity({
            type: ActivityType.FILE_COMMENTED,
            entityType: ActivityEntity.FILE,
            entityId: fileId,
            projectId: file.projectId.toString(),
            title: `Commented on file: ${file.fileName}`,
        });

        revalidatePath(`/dashboard/projects/${file.projectId}`);

        return { success: true, data: toSerializedObject(file) };
    } catch (error) {
        logError(error as Error, { context: 'addFileComment', fileId });
        return { success: false, error: 'Failed to add comment' };
    }
}

// Track file download
export async function trackFileDownload(fileId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const file = await File.findByIdAndUpdate(
            fileId,
            {
                $inc: { downloadCount: 1 },
                $set: { lastDownloadedAt: new Date() },
            },
            { new: true }
        );

        if (!file) {
            return { success: false, error: 'File not found' };
        }

        await logActivity({
            type: ActivityType.FILE_DOWNLOADED,
            entityType: ActivityEntity.FILE,
            entityId: fileId,
            projectId: file.projectId.toString(),
            title: `Downloaded file: ${file.fileName}`,
        });

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'trackFileDownload', fileId });
        return { success: false, error: 'Failed to track download' };
    }
}

// Delete file
export async function deleteFile(fileId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const file = await File.findByIdAndDelete(fileId);
        if (!file) {
            return { success: false, error: 'File not found' };
        }

        await logActivity({
            type: ActivityType.FILE_DELETED,
            entityType: ActivityEntity.FILE,
            entityId: fileId,
            projectId: file.projectId.toString(),
            title: `Deleted file: ${file.fileName}`,
        });

        revalidatePath(`/dashboard/projects/${file.projectId}`);

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'deleteFile', fileId });
        return { success: false, error: 'Failed to delete file' };
    }
}
