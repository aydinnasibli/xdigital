// app/admin/clients/[id]/page.tsx
import Link from 'next/link';
import { getClientDetails } from '@/app/actions/admin/clients';
import { getClientNotes } from '@/app/actions/client-notes';
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
                <p className="text-red-600">{result.error}</p>
            </div>
        );
    }

    const { client, projects, invoices, stats } = result.data;
    const notes = notesResult.success ? notesResult.data : [];

    // Calculate stats
    const projectStats = stats.projects.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    const invoiceStats = stats.invoices.reduce((acc: any, item: any) => {
        acc[item._id] = { count: item.count, total: item.total };
        return acc;
    }, {});

    const totalRevenue = stats.invoices
        .filter((s: any) => s._id === 'paid')
        .reduce((sum: number, s: any) => sum + s.total, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/clients" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
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
                <StatCard
                    icon={FileText}
                    label="Total Invoices"
                    value={invoices.length}
                    color="purple"
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Projects */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Projects ({projects.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {projects.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No projects yet
                                </div>
                            ) : (
                                projects.map((project: any) => (
                                    <Link
                                        key={project._id}
                                        href={`/admin/projects/${project._id}`}
                                        className="block p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {project.projectName}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
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

                    {/* Invoices */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Invoices ({invoices.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {invoices.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No invoices yet
                                </div>
                            ) : (
                                invoices.map((invoice: any) => (
                                    <Link
                                        key={invoice._id}
                                        href={`/admin/invoices/${invoice._id}`}
                                        className="block p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Issued:{' '}
                                                    {new Date(
                                                        invoice.issueDate
                                                    ).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Due:{' '}
                                                    {new Date(
                                                        invoice.dueDate
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    ${invoice.total.toLocaleString()}
                                                </p>
                                                <InvoiceStatusBadge status={invoice.status} />
                                            </div>
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
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Project Status
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(projectStats).map(([status, count]: [string, any]) => (
                                <div
                                    key={status}
                                    className="flex items-center justify-between py-2"
                                >
                                    <span className="text-sm text-gray-600 capitalize">
                                        {status.replace('_', ' ')}
                                    </span>
                                    <span className="font-semibold text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Invoice Status Breakdown */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Invoice Status
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(invoiceStats).map(
                                ([status, data]: [string, any]) => (
                                    <div key={status}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {status}
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {data.count}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            ${data.total.toLocaleString()}
                                        </p>
                                    </div>
                                )
                            )}
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
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`${colorClasses[color]} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-medium text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
        in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
        review: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review' },
        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
        on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}

function InvoiceStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
        sent: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sent' },
        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
        <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} mt-1`}
        >
            {config.label}
        </span>
    );
}