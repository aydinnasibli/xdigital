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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Clients</h1>
                    <p className="text-gray-600 mt-2">
                        Manage all xDigital clients
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            defaultValue={resolvedParams.search || ''}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            defaultValue={resolvedParams.activeOnly || ''}
                        >
                            <option value="">All Clients</option>
                            <option value="true">With Active Projects</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Projects
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Active Projects
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-gray-500">No clients found</p>
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client: any) => (
                                    <tr key={client._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-gray-900">
                                                        {client.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {client.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {client.totalProjects}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.activeProjects > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {client.activeProjects}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            ${client.totalRevenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(client.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/clients/${client._id}`}
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
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
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-blue-800">Total Clients</p>
                        <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-blue-800">With Active Projects</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {clients.filter((c: any) => c.activeProjects > 0).length}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-blue-800">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-900">
                            ${clients.reduce((sum: number, c: any) => sum + c.totalRevenue, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}