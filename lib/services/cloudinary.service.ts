// lib/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { logError } from '@/lib/monitoring/sentry';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete a file from Cloudinary
 * @param publicId - The Cloudinary public ID of the file to delete
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    if (!publicId) {
        console.warn('No publicId provided for Cloudinary deletion');
        return false;
    }

    try {
        // Determine resource type from public_id
        // Cloudinary stores different file types differently
        const resourceType = publicId.includes('/video/') ? 'video' : 'auto';

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true, // Invalidate CDN cache
        });

        if (result.result === 'ok') {
            console.log(`Successfully deleted file from Cloudinary: ${publicId}`);
            return true;
        } else if (result.result === 'not found') {
            // File already deleted or doesn't exist
            console.warn(`File not found in Cloudinary: ${publicId}`);
            return true; // Consider this a success
        } else {
            console.error(`Failed to delete file from Cloudinary: ${publicId}`, result);
            return false;
        }
    } catch (error) {
        logError(error as Error, {
            context: 'deleteFromCloudinary',
            publicId,
        });
        return false;
    }
}

/**
 * Delete multiple files from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 * @returns Promise<number> - Number of successfully deleted files
 */
export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<number> {
    if (!publicIds || publicIds.length === 0) {
        return 0;
    }

    let successCount = 0;

    // Delete files in parallel for better performance
    const deletePromises = publicIds.map(async (publicId) => {
        const success = await deleteFromCloudinary(publicId);
        if (success) successCount++;
    });

    await Promise.allSettled(deletePromises);

    return successCount;
}

/**
 * Extract publicId from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns publicId or null
 */
export function extractPublicIdFromUrl(url: string): string | null {
    try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');

        if (uploadIndex === -1) {
            return null;
        }

        // Get everything after 'upload' (skip version if present)
        const pathAfterUpload = urlParts.slice(uploadIndex + 1);

        // Remove version if it starts with 'v' followed by numbers
        let startIndex = 0;
        if (pathAfterUpload[0] && /^v\d+$/.test(pathAfterUpload[0])) {
            startIndex = 1;
        }

        // Join the remaining parts and remove extension
        const fullPath = pathAfterUpload.slice(startIndex).join('/');
        const publicIdWithExtension = fullPath.split('?')[0]; // Remove query params
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;

        return publicId || null;
    } catch (error) {
        logError(error as Error, {
            context: 'extractPublicIdFromUrl',
            url,
        });
        return null;
    }
}
