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
import { logError } from '@/lib/monitoring/sentry';
import { deleteMultipleFromCloudinary, extractPublicIdFromUrl } from '@/lib/services/cloudinary.service';

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
            type PopulatedUser = { _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string; email: string; imageUrl?: string };
            const uploadedBy = file.uploadedBy as unknown as PopulatedUser;

            return {
                ...toSerializedObject<Record<string, unknown>>(file),
                uploadedBy: toSerializedObject(uploadedBy),
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
    cloudinaryPublicId?: string; // Add this field
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
                cloudinaryPublicId: data.cloudinaryPublicId,
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
export async function uploadFileVersion(fileId: string, fileUrl: string, fileName: string, fileSize: number, cloudinaryPublicId?: string, notes?: string): Promise<ActionResponse> {
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
        file.cloudinaryPublicId = cloudinaryPublicId;

        file.versions.push({
            versionNumber: file.currentVersion,
            fileUrl,
            fileName,
            fileSize,
            cloudinaryPublicId,
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

        // First, find the file to get all Cloudinary public IDs
        const file = await File.findById(fileId);
        if (!file) {
            return { success: false, error: 'File not found' };
        }

        // Collect all Cloudinary public IDs (current version + all previous versions)
        const publicIdsToDelete: string[] = [];

        // Add current version - extract from URL if publicId not stored (for old files)
        if (file.cloudinaryPublicId) {
            publicIdsToDelete.push(file.cloudinaryPublicId);
        } else if (file.fileUrl) {
            // Try to extract publicId from URL (for files uploaded before publicId was stored)
            const extractedId = extractPublicIdFromUrl(file.fileUrl);
            if (extractedId) {
                publicIdsToDelete.push(extractedId);
            }
        }

        // Add all version history
        if (file.versions && file.versions.length > 0) {
            file.versions.forEach((version) => {
                if (version.cloudinaryPublicId && !publicIdsToDelete.includes(version.cloudinaryPublicId)) {
                    publicIdsToDelete.push(version.cloudinaryPublicId);
                } else if (version.fileUrl && !version.cloudinaryPublicId) {
                    // Try to extract from URL for old versions
                    const extractedId = extractPublicIdFromUrl(version.fileUrl);
                    if (extractedId && !publicIdsToDelete.includes(extractedId)) {
                        publicIdsToDelete.push(extractedId);
                    }
                }
            });
        }

        // Delete from Cloudinary first (fail gracefully if it fails)
        if (publicIdsToDelete.length > 0) {
            try {
                const deletedCount = await deleteMultipleFromCloudinary(publicIdsToDelete);
                console.log(`Deleted ${deletedCount}/${publicIdsToDelete.length} files from Cloudinary`);
            } catch (cloudinaryError) {
                // Log error but don't fail the entire operation
                logError(cloudinaryError as Error, {
                    context: 'deleteFile - Cloudinary cleanup',
                    fileId,
                    publicIds: publicIdsToDelete,
                });
                console.warn('Failed to delete some files from Cloudinary, continuing with database deletion');
            }
        }

        // Now delete from database
        await File.findByIdAndDelete(fileId);

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
