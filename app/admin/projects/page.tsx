// app/admin/projects/page.tsx
import { getAllProjects } from '@/app/actions/admin/projects';
import ProjectsListClient from './ProjectsListClient';

interface PageProps {
    searchParams: Promise<{
        status?: string;
        serviceType?: string;
        search?: string
    }>;
}

export default async function AdminProjectsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const result = await getAllProjects({
        status: params.status,
        serviceType: params.serviceType,
        search: params.search,
    });

    const projects = result.success ? result.data : [];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white">All Projects</h1>
                    <p className="text-gray-400 mt-2">
                        Manage all client projects across xDigital
                    </p>
                </div>
            </div>

            {/* Projects List with Filters and Bulk Operations */}
            <ProjectsListClient
                projects={projects}
                initialStatus={params.status}
                initialServiceType={params.serviceType}
                initialSearch={params.search}
            />
        </div>
    );
}
