// app/admin/clients/page.tsx
import { getAllClients } from '@/app/actions/admin/clients';
import ClientsListClient from './ClientsListClient';

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white">All Clients</h1>
                    <p className="text-gray-400 mt-2">
                        Manage all xDigital clients
                    </p>
                </div>
            </div>

            {/* Clients List with Filters */}
            <ClientsListClient
                clients={clients}
                initialSearch={resolvedParams.search}
                initialActiveOnly={resolvedParams.activeOnly}
            />
        </div>
    );
}
