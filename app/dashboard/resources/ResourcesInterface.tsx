// app/dashboard/resources/ResourcesInterface.tsx
'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchResources } from '@/app/actions/resources';
import { toast } from 'sonner';
import Link from 'next/link';

interface Resource {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    type: string;
    category: string;
    thumbnailUrl?: string;
    isFeatured: boolean;
    viewCount: number;
    downloadCount: number;
}

export default function ResourcesInterface({ initialResources, categories }: { initialResources: Resource[]; categories: string[] }) {
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setResources(initialResources);
            setIsSearchMode(false);
            return;
        }

        setLoading(true);
        setIsSearchMode(true);
        const result = await searchResources(searchTerm);

        if (result.success) {
            setResources(result.data || []);
            if (result.data && result.data.length === 0) {
                toast.info('No resources found');
            }
        } else {
            toast.error(result.error || 'Search failed');
            setResources([]);
        }
        setLoading(false);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setResources(initialResources);
        setIsSearchMode(false);
        setSelectedCategory('all');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const filteredResources = selectedCategory === 'all'
        ? resources
        : resources.filter(r => r.category === selectedCategory);

    const featuredResources = filteredResources.filter(r => r.isFeatured);

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Search resources..."
                            className="w-full pl-12 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {isSearchMode && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                        <span>Showing search results for "{searchTerm}"</span>
                        <button
                            onClick={handleClearSearch}
                            className="text-blue-600 hover:underline"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                        selectedCategory === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/40 backdrop-blur-xl border hover:bg-gray-50'
                    }`}
                >
                    All Resources
                </button>
                {categories.map((category: string) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${
                            selectedCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-black/40 backdrop-blur-xl border hover:bg-gray-50'
                        }`}
                    >
                        {category.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Featured Resources */}
            {!isSearchMode && featuredResources.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Featured Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featuredResources.map((resource) => (
                            <Link
                                key={resource._id}
                                href={`/dashboard/resources/${resource.slug}`}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                {resource.thumbnailUrl && (
                                    <img
                                        src={resource.thumbnailUrl}
                                        alt={resource.title}
                                        className="w-full h-40 object-cover rounded mb-3"
                                    />
                                )}
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-2xl">
                                        {resource.type === 'video' ? '🎥' :
                                         resource.type === 'article' ? '📄' :
                                         resource.type === 'download' ? '⬇️' : '🔗'}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white">{resource.title}</h3>
                                        {resource.description && (
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                {resource.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                                        {resource.category}
                                    </span>
                                    <span>•</span>
                                    <span>{resource.viewCount || 0} views</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* All Resources */}
            <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm">
                {filteredResources.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📚</div>
                        <p>{isSearchMode ? 'No resources found for your search' : 'No resources available yet'}</p>
                        <p className="text-sm mt-2">
                            {isSearchMode ? 'Try a different search term' : 'Check back soon for helpful guides and tutorials'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredResources.map((resource) => (
                            <Link
                                key={resource._id}
                                href={`/dashboard/resources/${resource.slug}`}
                                className="block p-6 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">
                                        {resource.type === 'video' ? '🎥' :
                                         resource.type === 'article' ? '📄' :
                                         resource.type === 'download' ? '⬇️' : '🔗'}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{resource.title}</h3>
                                                {resource.description && (
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {resource.description}
                                                    </p>
                                                )}
                                            </div>
                                            {resource.isFeatured && (
                                                <span className="text-yellow-500 text-lg">⭐</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                {resource.category}
                                            </span>
                                            <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                                {resource.type}
                                            </span>
                                            <span>•</span>
                                            <span>{resource.viewCount || 0} views</span>
                                            {resource.downloadCount > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{resource.downloadCount} downloads</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
