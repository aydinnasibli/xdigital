// app/admin/projects/[id]/FilesSection.tsx
'use client';

import { useState } from 'react';
import { deleteFile } from '@/app/actions/files';
import { useRouter } from 'next/navigation';
import { Trash2, Download, Eye } from 'lucide-react';

interface File {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category?: string;
    currentVersion: number;
    uploadedBy: any;
    isPreviewable: boolean;
    previewUrl?: string;
    createdAt: string;
}

export default function FilesSection({
    projectId,
    files,
}: {
    projectId: string;
    files: File[];
}) {
    const router = useRouter();

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

        const result = await deleteFile(fileId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error || 'Failed to delete file');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
        if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
        return '📎';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Files & Documents ({files.length})
                </h2>
                <p className="text-sm text-gray-500">
                    Clients can upload files from their dashboard
                </p>
            </div>

            <div className="space-y-3">
                {files.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No files uploaded yet
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                            <div
                                key={file._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">
                                        {getFileIcon(file.fileType)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {file.fileName}
                                        </h4>
                                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                                            <div>v{file.currentVersion} • {formatFileSize(file.fileSize)}</div>
                                            {file.category && (
                                                <div className="text-blue-600 capitalize">
                                                    {file.category}
                                                </div>
                                            )}
                                            <div>
                                                Uploaded by: {file.uploadedBy?.firstName || file.uploadedBy?.email || 'Unknown'}
                                            </div>
                                            <div className="text-gray-400">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        <Download className="w-3 h-3" />
                                        Download
                                    </a>
                                    {file.isPreviewable && file.previewUrl && (
                                        <a
                                            href={file.previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Preview
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(file._id, file.fileName)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                        title="Delete file"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
