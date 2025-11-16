// app/admin/projects/[id]/page.tsx
import Link from 'next/link';
import { getAdminProject } from '@/app/actions/admin/projects';
import { getAdminProjectMessages } from '@/app/actions/admin/messages';
import { getProjectInvoices } from '@/app/actions/invoices';
import { ArrowLeft, User, Mail, Calendar, Package } from 'lucide-react';
import UpdateStatusForm from './UpdateStatusForm';
import MessageSection from './MessageSection';
import MilestonesSection from './MilestonesSection';
import DeploymentSection from './DeploymentSection';

export default async function AdminProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;

}) {
    const resolvedParams = await params;
    const [projectResult, messagesResult, invoicesResult] = await Promise.all([
        getAdminProject(resolvedParams.id),
        getAdminProjectMessages(resolvedParams.id),
        getProjectInvoices(resolvedParams.id),
    ]);

    if (!projectResult.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{projectResult.error}</p>
            </div>
        );
    }

    const project = projectResult.data;
    const messages = messagesResult.success ? messagesResult.data : [];
    const invoices = invoicesResult.success ? invoicesResult.data : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/projects"
                    className="text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {project.projectName}
                    </h1>
                    <p className="text-gray-600 mt-1">{project.projectDescription}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Project Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem
                                label="Service Type"
                                value={formatServiceType(project.serviceType)}
                            />
                            <InfoItem
                                label="Package"
                                value={project.package}
                                capitalize
                            />
                            <InfoItem
                                label="Status"
                                value={<StatusBadge status={project.status} />}
                            />
                            <InfoItem
                                label="Created"
                                value={new Date(project.createdAt).toLocaleDateString()}
                            />
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Update Status
                        </h2>
                        <UpdateStatusForm
                            projectId={project._id}
                            currentStatus={project.status}
                        />
                    </div>

                    {/* Deployment Information */}
                    <DeploymentSection
                        projectId={project._id}
                        deploymentUrl={project.deploymentUrl}
                        vercelProjectId={project.vercelProjectId}
                        googleAnalyticsPropertyId={project.googleAnalyticsPropertyId}
                    />

                    {/* Milestones */}
                    <MilestonesSection
                        projectId={project._id}
                        milestones={project.milestones || []}
                    />

                    {/* Messages */}
                    <MessageSection
                        projectId={project._id}
                        messages={messages}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Client Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium text-gray-900">
                                        {project.client.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900">
                                        {project.client.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/admin/clients/${project.client.id}`}
                            className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            View Client Profile
                        </Link>
                    </div>

                    {/* Timeline */}
                    {project.timeline && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Timeline
                            </h3>
                            <div className="space-y-3">
                                {project.timeline.startDate && (
                                    <TimelineItem
                                        label="Start Date"
                                        date={project.timeline.startDate}
                                    />
                                )}
                                {project.timeline.estimatedCompletion && (
                                    <TimelineItem
                                        label="Estimated Completion"
                                        date={project.timeline.estimatedCompletion}
                                    />
                                )}
                                {project.timeline.completedDate && (
                                    <TimelineItem
                                        label="Completed"
                                        date={project.timeline.completedDate}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoices */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Invoices ({invoices.length})
                        </h3>
                        {invoices.length > 0 ? (
                            <div className="space-y-2">
                                {invoices.map((invoice: any) => (
                                    <div
                                        key={invoice._id}
                                        className="p-3 bg-gray-50 rounded flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {invoice.invoiceNumber}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ${invoice.total}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${invoice.status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No invoices yet</p>
                        )}
                        <Link
                            href={`/admin/invoices/create?projectId=${project._id}`}
                            className="mt-4 block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Create Invoice
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({
    label,
    value,
    capitalize = false,
}: {
    label: string;
    value: React.ReactNode;
    capitalize?: boolean;
}) {
    return (
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`font-medium text-gray-900 mt-1 ${capitalize ? 'capitalize' : ''}`}>
                {value}
            </p>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date: Date }) {
    return (
        <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="font-medium text-gray-900">
                    {new Date(date).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
        in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
        review: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review' },
        completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
        on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}

function formatServiceType(type: string): string {
    const types = {
        web_development: 'Web Development',
        social_media_marketing: 'Social Media Marketing',
        digital_solutions: 'Digital Solutions',
    };
    return types[type as keyof typeof types] || type;
}