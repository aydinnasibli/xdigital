// components/files/FileUpload.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createFile } from '@/app/actions/files';
import { toast } from 'sonner';

interface FileUploadProps {
    projectId: string;
    folderId?: string;
    onUploadComplete?: (file: any) => void;
    maxFiles?: number;
    accept?: Record<string, string[]>;
}

export function FileUpload({
    projectId,
    folderId,
    onUploadComplete,
    maxFiles = 5,
    accept,
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [errors, setErrors] = useState<string[]>([]);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            setUploading(true);
            setErrors([]);

            const uploadPromises = acceptedFiles.map(async (file) => {
                try {
                    // Update progress
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

                    // Upload file to our API
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`Upload failed: ${response.statusText}`);
                    }

                    const result = await response.json();

                    // Save file metadata to database
                    const fileData = await createFile({
                        projectId,
                        folderId,
                        fileName: result.data.fileName,
                        fileUrl: result.data.fileUrl,
                        cloudinaryPublicId: result.data.publicId, // Save Cloudinary publicId for cleanup
                        fileType: result.data.fileType,
                        fileSize: result.data.fileSize,
                    });

                    // Update progress to 100%
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

                    if (fileData.success) {
                        toast.success(`${file.name} uploaded successfully`);
                        if (onUploadComplete) {
                            onUploadComplete(fileData.data);
                        }
                    } else {
                        toast.error(`Failed to upload ${file.name}`);
                        setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
                    }

                    return fileData;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    const errorMessage = `Failed to upload ${file.name}`;
                    toast.error(errorMessage);
                    setErrors(prev => [...prev, errorMessage]);
                    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
                }
            });

            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            if (successCount > 1) {
                toast.success(`${successCount} files uploaded successfully`);
            }
            if (failCount > 1) {
                toast.error(`${failCount} files failed to upload`);
            }

            setUploading(false);
            setUploadProgress({});
        },
        [projectId, folderId, onUploadComplete]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        maxFiles,
        accept: accept || {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/plain': ['.txt'],
            'application/zip': ['.zip'],
        },
        disabled: uploading,
    });

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />

                <div className="space-y-2">
                    {isDragActive ? (
                        <p className="text-blue-600">Drop files here...</p>
                    ) : (
                        <>
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <p className="text-gray-600">
                                Drag & drop files here, or click to select files
                            </p>
                            <p className="text-xs text-gray-500">
                                Max {maxFiles} files, up to 10MB each
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="truncate">{fileName}</span>
                                <span className="text-gray-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Upload Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* File Rejections */}
            {fileRejections.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Rejected Files:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        {fileRejections.map(({ file, errors }) => (
                            <li key={file.name}>
                                • {file.name}: {errors.map(e => e.message).join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Status */}
            {uploading && (
                <div className="flex items-center justify-center text-blue-600">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Uploading files...</span>
                </div>
            )}
        </div>
    );
}
