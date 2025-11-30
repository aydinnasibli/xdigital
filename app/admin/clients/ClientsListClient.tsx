// app/admin/clients/ClientsListClient.tsx
'use client';

import { useState } from 'react';
import { Mail, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Client {
    _id: string;
    name: string;
    email: string;
    totalProjects: number;
    activeProjects: number;
    createdAt: string;
}

interface Props {
    clients: Client[];
    initialSearch?: string;
    initialActiveOnly?: string;
}

export default function ClientsListClient({ clients, initialSearch, initialActiveOnly }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/clients?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        // Debounce search
        const timeoutId = setTimeout(() => {
            router.push(`/admin/clients?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const handleRowClick = (clientId: string) => {
        router.push(`/admin/clients/${clientId}`);
    };

    return (
        <>
            {/* Filters */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Search className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Filter
                        </label>
                        <select
                            value={initialActiveOnly || ''}
                            onChange={(e) => handleFilterChange('activeOnly', e.target.value)}
                            className="w-full bg-white/5 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
                        >
                            <option value="" className="bg-gray-900">All Clients</option>
                            <option value="true" className="bg-gray-900">With Active Projects</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Total Projects
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Active Projects
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-gray-400">No clients found</p>
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr
                                        key={client._id}
                                        onClick={() => handleRowClick(client._id)}
                                        className="cursor-pointer hover:bg-white/10 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                                    <span className="text-purple-400 font-semibold">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-white">
                                                        {client.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-300">
                                                    {client.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {client.totalProjects}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${client.activeProjects > 0
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                }`}>
                                                {client.activeProjects}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(client.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-400">Total Clients</p>
                        <p className="text-2xl font-bold text-white mt-1">{clients.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">With Active Projects</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">
                            {clients.filter(c => c.activeProjects > 0).length}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
