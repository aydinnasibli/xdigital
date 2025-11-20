// components/search/GlobalSearch.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { globalSearch } from '@/app/actions/search';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: 'project' | 'message' | 'invoice' | 'file' | 'task';
    id: string;
    title: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    createdAt: string;
}

export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Keyboard shortcut (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Debounced search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.length >= 2) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const performSearch = async () => {
        setLoading(true);
        const response = await globalSearch(searchTerm);
        if (response.success) {
            setResults(response.data || []);
        }
        setLoading(false);
    };

    const handleResultClick = useCallback((result: SearchResult) => {
        // Navigate based on result type
        switch (result.type) {
            case 'project':
                router.push(`/dashboard/projects/${result.id}`);
                break;
            case 'message':
            case 'file':
            case 'task':
                if (result.projectId) {
                    router.push(`/dashboard/projects/${result.projectId}`);
                }
                break;
            case 'invoice':
                router.push(`/dashboard/invoices/${result.id}`);
                break;
        }
        setIsOpen(false);
        setSearchTerm('');
    }, [router]);

    const getResultIcon = (type: SearchResult['type']) => {
        const icons = {
            project: '📁',
            message: '💬',
            invoice: '💰',
            file: '📄',
            task: '✓',
        };
        return icons[type] || '📄';
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-gray-600">Search...</span>
                <span className="text-xs text-gray-400 ml-auto">⌘K</span>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsOpen(false)}
            />

            {/* Search Modal */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
                <div className="bg-white rounded-lg shadow-2xl">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-4 py-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search projects, messages, files, tasks..."
                            className="flex-1 ml-3 outline-none text-gray-900 placeholder-gray-400"
                            autoFocus
                        />
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {searchTerm.length < 2 ? (
                            <div className="p-8 text-center text-gray-400">
                                Type at least 2 characters to search
                            </div>
                        ) : results.length === 0 && !loading ? (
                            <div className="p-8 text-center text-gray-400">
                                No results found for "{searchTerm}"
                            </div>
                        ) : (
                            <div className="py-2">
                                {results.map((result, index) => (
                                    <button
                                        key={`${result.type}-${result.id}-${index}`}
                                        onClick={() => handleResultClick(result)}
                                        className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
                                    >
                                        <span className="text-2xl">{getResultIcon(result.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {result.title}
                                                </h4>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                                                    {result.type}
                                                </span>
                                            </div>
                                            {result.description && (
                                                <p className="text-sm text-gray-600 truncate mt-1">
                                                    {result.description}
                                                </p>
                                            )}
                                            {result.projectName && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    📁 {result.projectName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(result.createdAt).toLocaleDateString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                        <span>Press ESC to close</span>
                        <span>{results.length} results</span>
                    </div>
                </div>
            </div>
        </>
    );
}
