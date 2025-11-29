// app/admin/projects/[id]/page.tsx
import Link from 'next/link';
import { getAdminProject } from '@/app/actions/admin/projects';
import { getProjectTasks } from '@/app/actions/tasks';
import { getProjectFiles } from '@/app/actions/files';
import { ArrowLeft, User, Mail, Calendar, Package } from 'lucide-react';
import UpdateStatusForm from './UpdateStatusForm';
import MilestonesSection from './MilestonesSection';
import DeploymentSection from './DeploymentSection';
import TimelineSection from './TimelineSection';
import TasksSection from './TasksSection';
import FilesSection from './FilesSection';
import EditProjectSection from './EditProjectSection';
import CloneAsTemplateButton from './CloneAsTemplateButton';

export default async function AdminProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;

}) {
    const resolvedParams = await params;
    const [projectResult, tasksResult, filesResult] = await Promise.all([
        getAdminProject(resolvedParams.id),
        getProjectTasks(resolvedParams.id),
        getProjectFiles(resolvedParams.id),
    ]);

    if (!projectResult.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400">{projectResult.error}</p>
            </div>
        );
    }

    const project = projectResult.data;
    const tasks = tasksResult.success ? tasksResult.data : [];
    const files = filesResult.success ? filesResult.data : [];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/projects"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white">
                            {project.projectName}
                        </h1>
                        <p className="text-gray-400 mt-1">{project.projectDescription}</p>
                    </div>
                    <CloneAsTemplateButton
                        projectId={project._id}
                        projectName={project.projectName}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Project Section */}
                    <EditProjectSection project={project} />

                    {/* Update Status */}
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Update Status
                        </h2>
                        <UpdateStatusForm
                            projectId={project._id}
                            currentStatus={project.status}
                        />
                    </div>

                    {/* Timeline */}
                    <TimelineSection
                        projectId={project._id}
                        timeline={project.timeline}
                    />

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

                    {/* Tasks */}
                    <TasksSection
                        projectId={project._id}
                        tasks={tasks}
                    />

                    {/* Files */}
                    <FilesSection
                        projectId={project._id}
                        files={files}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Client Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                    <User className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Name</p>
                                    <p className="font-medium text-white">
                                        {project.client.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="font-medium text-white">
                                        {project.client.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/admin/clients/${project.client.id}`}
                            className="mt-6 block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            View Client Profile
                        </Link>
                    </div>

                    {/* Timeline */}
                    {project.timeline && (
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Timeline
                            </h3>
                            <div className="space-y-4">
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
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`font-medium text-white mt-1 ${capitalize ? 'capitalize' : ''}`}>
                {value}
            </p>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date: Date }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="font-medium text-white">
                    {new Date(date).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig = {
        pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' },
        in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'In Progress' },
        review: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Review' },
        completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
        on_hold: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'On Hold' },
        cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <span
            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
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