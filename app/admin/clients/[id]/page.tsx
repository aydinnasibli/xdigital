// app/admin/clients/[id]/page.tsx
import Link from 'next/link';
import { getClientDetails } from '@/app/actions/admin/clients';
import { getClientNotes } from '@/app/actions/clientNotes';
import { ArrowLeft, Mail, Calendar, FolderKanban, FileText, DollarSign } from 'lucide-react';
import ClientNotesSection from './ClientNotesSection';

export default async function AdminClientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;

}) {
    const resolvedParams = await params;
    const [result, notesResult] = await Promise.all([
        getClientDetails(resolvedParams.id),
        getClientNotes(resolvedParams.id),
    ]);

    if (!result.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400">{result.error}</p>
            </div>
        );
    }

    const { client, projects, stats } = result.data;
    const notes = notesResult.success ? notesResult.data : [];

    // Calculate stats
    const projectStats = stats.projects.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/clients" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                        <div className="flex items-center gap-2 mt-2 text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span>{client.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={FolderKanban}
                    label="Total Projects"
                    value={projects.length}
                    color="blue"
                />
                <StatCard
                    icon={FolderKanban}
                    label="Active Projects"
                    value={
                        projectStats['pending'] +
                        projectStats['in_progress'] || 0
                    }
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Projects */}
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800/50">
                            <h2 className="text-xl font-semibold text-white">
                                Projects ({projects.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-800/50">
                            {projects.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">
                                    No projects yet
                                </div>
                            ) : (
                                projects.map((project: any) => (
                                    <Link
                                        key={project._id}
                                        href={`/admin/projects/${project._id}`}
                                        className="block p-6 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white mb-1">
                                                    {project.projectName}
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                                    {project.projectDescription}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="capitalize">
                                                        {project.serviceType.replace('_', ' ')}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="capitalize">
                                                        {project.package}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(
                                                            project.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <StatusBadge status={project.status} />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Client Notes */}
                    <ClientNotesSection clientId={resolvedParams.id} notes={notes} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Client Information
                        </h3>
                        <div className="space-y-3">
                            <InfoItem label="Email" value={client.email} />
                            <InfoItem
                                label="Joined"
                                value={new Date(client.createdAt).toLocaleDateString()}
                            />
                            {client.phone && <InfoItem label="Phone" value={client.phone} />}
                        </div>
                    </div>

                    {/* Project Status Breakdown */}
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Project Status
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(projectStats).map(([status, count]: [string, any]) => (
                                <div
                                    key={status}
                                    className="flex items-center justify-between py-2 border-b border-gray-800/30 last:border-0"
                                >
                                    <span className="text-sm text-gray-400 capitalize">
                                        {status.replace('_', ' ')}
                                    </span>
                                    <span className="font-semibold text-white">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: any;
    label: string;
    value: number | string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: 'text-blue-400' },
        green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
        purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', icon: 'text-purple-400' },
        orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: 'text-orange-400' },
    };

    const colors = colorClasses[color];

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-white mt-2">{value}</p>
                </div>
                <div className={`${colors.bg} border ${colors.border} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="font-medium text-white mt-1">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
        pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' },
        in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'In Progress' },
        review: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Review' },
        completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
        on_hold: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'On Hold' },
        cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border} shrink-0`}
        >
            {config.label}
        </span>
    );
}