// components/search/GlobalSearchDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { globalSearch } from '@/app/actions/search';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: string;
    id: string;
    title: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    createdAt: string;
}

export function GlobalSearchDialog() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults([]);
        }
    }, [open]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const result = await globalSearch(query);
                if (result.success && result.data) {
                    setResults(result.data);
                }
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        let url = '';
        switch (result.type) {
            case 'project':
                url = `/dashboard/projects/${result.id}`;
                break;
            case 'message':
                url = `/dashboard/projects/${result.projectId}`;
                break;
            case 'invoice':
                url = `/dashboard/projects/${result.projectId}`;
                break;
            case 'file':
                url = `/dashboard/projects/${result.projectId}/files`;
                break;
            case 'task':
                url = `/dashboard/projects/${result.projectId}/tasks`;
                break;
            default:
                url = '/dashboard';
        }
        router.push(url);
        setOpen(false);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'project': return '📁';
            case 'message': return '💬';
            case 'invoice': return '💰';
            case 'file': return '📄';
            case 'task': return '✅';
            default: return '🔍';
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white rounded-lg shadow-2xl border">
                    {/* Search Input */}
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔍</span>
                            <input
                                type="text"
                                placeholder="Search projects, messages, files, tasks..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 outline-none text-lg"
                                autoFocus
                            />
                            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border">ESC</kbd>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading && (
                            <div className="p-8 text-center text-gray-500">
                                Searching...
                            </div>
                        )}

                        {!loading && query.length >= 2 && results.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No results found for "{query}"
                            </div>
                        )}

                        {!loading && query.length < 2 && (
                            <div className="p-8 text-center text-gray-500">
                                Type at least 2 characters to search
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="divide-y">
                                {results.map((result) => (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getResultIcon(result.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {result.title}
                                                    </div>
                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">
                                                        {result.type}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 truncate mt-1">
                                                    {result.description}
                                                </div>
                                                {result.projectName && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Project: {result.projectName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <div>Press <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd> to select</div>
                        <div>Press <kbd className="px-1.5 py-0.5 bg-white rounded border">ESC</kbd> to close</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
