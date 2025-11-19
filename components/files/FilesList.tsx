// components/files/FilesList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteFile } from '@/app/actions/files';
import { Trash2, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface File {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category?: string;
    currentVersion: number;
    isPreviewable: boolean;
    previewUrl?: string;
    createdAt: string;
}

interface FilesListProps {
    files: File[];
    projectId: string;
}

export function FilesList({ files, projectId }: FilesListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(fileId);

        const result = await deleteFile(fileId);

        if (result.success) {
            toast.success('File deleted successfully');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to delete file');
        }

        setDeletingId(null);
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

    if (files.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📁</div>
                <p>No files uploaded yet</p>
                <p className="text-sm mt-2">Upload your first file to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
                <div
                    key={file._id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        deletingId === file._id ? 'opacity-50 pointer-events-none' : ''
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">
                            {getFileIcon(file.fileType)}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                                {file.fileName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                v{file.currentVersion} • {formatFileSize(file.fileSize)}
                            </div>
                            {file.category && (
                                <div className="text-xs text-blue-600 mt-1 capitalize">
                                    {file.category}
                                </div>
                            )}
                            <div className="text-xs text-gray-400 mt-2">
                                {new Date(file.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-3 h-3" />
                            Download
                        </a>
                        {file.isPreviewable && file.previewUrl && (
                            <a
                                href={file.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center gap-1 transition-colors"
                            >
                                <Eye className="w-3 h-3" />
                                Preview
                            </a>
                        )}
                        <button
                            onClick={() => handleDelete(file._id, file.fileName)}
                            disabled={deletingId === file._id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete file"
                        >
                            {deletingId === file._id ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
