// app/dashboard/search/SearchInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, FolderKanban, MessageSquare, FileText, CheckSquare, Package, File as FileIcon } from 'lucide-react';
import { globalSearch } from '@/app/actions/search';
import { toast } from 'sonner';
import Link from 'next/link';

interface SearchResult {
    type: 'project' | 'message' | 'invoice' | 'file' | 'task' | 'deliverable';
    id: string;
    title: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    createdAt: string;
}

const entityOptions = [
    { value: 'projects', label: 'Projects', icon: FolderKanban },
    { value: 'tasks', label: 'Tasks', icon: CheckSquare },
    { value: 'files', label: 'Files', icon: FileIcon },
    { value: 'messages', label: 'Messages', icon: MessageSquare },
    { value: 'invoices', label: 'Invoices', icon: FileText },
    { value: 'deliverables', label: 'Deliverables', icon: Package },
];

export default function SearchInterface() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.length < 2) {
            toast.error('Please enter at least 2 characters');
            return;
        }

        setLoading(true);
        setHasSearched(true);

        const result = await globalSearch(
            searchTerm,
            selectedEntities.length > 0 ? selectedEntities : undefined
        );

        if (result.success) {
            setResults(result.data || []);
            if (result.data && result.data.length === 0) {
                toast.info('No results found');
            }
        } else {
            toast.error(result.error || 'Search failed');
            setResults([]);
        }
        setLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleEntity = (entity: string) => {
        if (selectedEntities.includes(entity)) {
            setSelectedEntities(selectedEntities.filter(e => e !== entity));
        } else {
            setSelectedEntities([...selectedEntities, entity]);
        }
    };

    const clearFilters = () => {
        setSelectedEntities([]);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'project': return FolderKanban;
            case 'task': return CheckSquare;
            case 'file': return FileIcon;
            case 'message': return MessageSquare;
            case 'invoice': return FileText;
            case 'deliverable': return Package;
            default: return FileIcon;
        }
    };

    const getResultLink = (result: SearchResult) => {
        switch (result.type) {
            case 'project':
                return `/dashboard/projects/${result.id}`;
            case 'task':
                return result.projectId ? `/dashboard/projects/${result.projectId}#tasks` : '#';
            case 'file':
                return result.projectId ? `/dashboard/projects/${result.projectId}#files` : '#';
            case 'message':
                return result.projectId ? `/dashboard/projects/${result.projectId}#messages` : '#';
            case 'invoice':
                return `/dashboard/invoices/${result.id}`;
            case 'deliverable':
                return result.projectId ? `/dashboard/projects/${result.projectId}#deliverables` : '#';
            default:
                return '#';
        }
    };

    const getTypeColor = (type: string) => {
        const colors: any = {
            project: 'bg-blue-100 text-blue-800',
            task: 'bg-purple-100 text-purple-800',
            file: 'bg-green-100 text-green-800',
            message: 'bg-yellow-100 text-yellow-800',
            invoice: 'bg-orange-100 text-orange-800',
            deliverable: 'bg-pink-100 text-pink-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Search across projects, tasks, files, messages..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition ${
                            showFilters || selectedEntities.length > 0
                                ? 'bg-blue-50 border-blue-300 text-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                        {selectedEntities.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                {selectedEntities.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-900">Filter by type</h3>
                            {selectedEntities.length > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {entityOptions.map((entity) => {
                                const Icon = entity.icon;
                                const isSelected = selectedEntities.includes(entity.value);
                                return (
                                    <button
                                        key={entity.value}
                                        onClick={() => toggleEntity(entity.value)}
                                        className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{entity.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {hasSearched && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Search Results
                            {results.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-600">
                                    ({results.length} {results.length === 1 ? 'result' : 'results'})
                                </span>
                            )}
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Searching...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No results found</p>
                            <p className="text-sm mt-1">Try adjusting your search term or filters</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {results.map((result) => {
                                const Icon = getResultIcon(result.type);
                                return (
                                    <Link
                                        key={`${result.type}-${result.id}`}
                                        href={getResultLink(result)}
                                        className="block p-6 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                                <Icon className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {result.title}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getTypeColor(result.type)}`}>
                                                        {result.type}
                                                    </span>
                                                </div>
                                                {result.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {result.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {result.projectName && (
                                                        <>
                                                            <span>{result.projectName}</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Search Tips */}
            {!hasSearched && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Search Tips</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Enter at least 2 characters to start searching</li>
                        <li>• Use filters to narrow down results by type</li>
                        <li>• Search works across project names, descriptions, messages, file names, and more</li>
                        <li>• Results are sorted by most recent first</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
