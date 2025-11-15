// app/dashboard/projects/[id]/activity/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectActivities } from '@/app/actions/activities';
import Link from 'next/link';

export default async function ProjectActivityPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const { id: projectId } = await params;
    const activitiesResult = await getProjectActivities(projectId, 50);

    const activities = activitiesResult.success ? activitiesResult.data : [];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'project_created':
                return '📁';
            case 'project_updated':
                return '✏️';
            case 'task_created':
            case 'task_completed':
            case 'task_status_changed':
                return '✅';
            case 'deliverable_created':
            case 'deliverable_submitted':
            case 'deliverable_approved':
            case 'deliverable_rejected':
                return '📦';
            case 'file_uploaded':
            case 'file_updated':
            case 'file_downloaded':
            case 'file_commented':
            case 'file_deleted':
                return '📄';
            case 'message_sent':
                return '💬';
            case 'invoice_created':
            case 'invoice_updated':
            case 'invoice_paid':
                return '💰';
            default:
                return '📌';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Activity</h1>
                    <p className="text-gray-600 mt-2">Complete activity history and audit trail</p>
                </div>
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    ← Back to Project
                </Link>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                {activities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📝</div>
                        <p>No activity yet</p>
                        <p className="text-sm mt-2">Activity will appear here as the project progresses</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {activities.map((activity: any) => (
                            <div key={activity._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">{getActivityIcon(activity.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{activity.title}</h3>
                                                {activity.description && (
                                                    <p className="text-gray-600 mt-1 text-sm">{activity.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        {activity.userImageUrl && (
                                                            <img
                                                                src={activity.userImageUrl}
                                                                alt={activity.userName}
                                                                className="w-5 h-5 rounded-full"
                                                            />
                                                        )}
                                                        <span className="font-medium">{activity.userName}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                                                </div>
                                                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                                    <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono">
                                                        {activity.metadata.oldValue && activity.metadata.newValue && (
                                                            <div>
                                                                Changed from <span className="font-bold text-red-600">{activity.metadata.oldValue}</span> to <span className="font-bold text-green-600">{activity.metadata.newValue}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                                                {activity.entityType}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
