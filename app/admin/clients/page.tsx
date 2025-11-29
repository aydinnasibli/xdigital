// app/admin/clients/page.tsx
import Link from 'next/link';
import { getAllClients } from '@/app/actions/admin/clients';
import { Eye, Mail } from 'lucide-react';

export default async function AdminClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; activeOnly?: string }>;
}) {
    const resolvedParams = await searchParams;

    const result = await getAllClients({
        search: resolvedParams.search,
        hasActiveProjects: resolvedParams.activeOnly === 'true',
    });

    const clients = result.success ? result.data : [];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">All Clients</h1>
                <p className="text-gray-400 mt-2">
                    Manage all xDigital clients
                </p>
            </div>

            {/* Filters */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-white/5 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            defaultValue={resolvedParams.search || ''}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Filter
                        </label>
                        <select
                            className="w-full bg-white/5 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            defaultValue={resolvedParams.activeOnly || ''}
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
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <p className="text-gray-400">No clients found</p>
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client: any) => (
                                    <tr key={client._id} className="hover:bg-white/5 transition-colors">
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
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/clients/${client._id}`}
                                                className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
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
                            {clients.filter((c: any) => c.activeProjects > 0).length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}