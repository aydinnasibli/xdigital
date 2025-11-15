// app/dashboard/projects/[id]/deliverables/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectDeliverables } from '@/app/actions/deliverables';
import Link from 'next/link';

export default async function ProjectDeliverablesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const { id: projectId } = await params;
    const deliverablesResult = await getProjectDeliverables(projectId);

    const deliverables = deliverablesResult.success ? deliverablesResult.data : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'submitted':
            case 'in_review':
                return 'bg-blue-100 text-blue-800';
            case 'changes_requested':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Deliverables</h1>
                    <p className="text-gray-600 mt-2">Track project deliverables and approvals</p>
                </div>
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    ← Back to Project
                </Link>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                {deliverables.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">✅</div>
                        <p>No deliverables yet</p>
                        <p className="text-sm mt-2">Deliverables will be added by the admin as the project progresses</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {deliverables.map((deliverable: any) => (
                            <div key={deliverable._id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{deliverable.title}</h3>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(deliverable.status)}`}>
                                                {deliverable.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        {deliverable.description && (
                                            <p className="text-gray-600 mt-2">{deliverable.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            <div>Category: <span className="font-medium capitalize">{deliverable.category}</span></div>
                                            <div>Version: <span className="font-medium">v{deliverable.currentVersion}</span></div>
                                            {deliverable.revisions && deliverable.revisions.length > 0 && (
                                                <div>Revisions: <span className="font-medium">{deliverable.revisions.length}</span></div>
                                            )}
                                        </div>
                                        {deliverable.dueDate && (
                                            <div className="text-sm text-gray-500 mt-2">
                                                Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        {deliverable.feedback && deliverable.feedback.length > 0 && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="font-medium text-sm text-gray-900 mb-2">Feedback:</div>
                                                {deliverable.feedback.map((fb: any, index: number) => (
                                                    <div key={index} className="text-sm text-gray-600 mb-2">
                                                        <div className="font-medium">{fb.userName}</div>
                                                        <div>{fb.comment}</div>
                                                        {fb.rating && (
                                                            <div className="text-yellow-600 mt-1">
                                                                {'⭐'.repeat(fb.rating)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {deliverable.status === 'approved' && deliverable.approval && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm">
                                        <div className="font-medium text-green-900">✓ Approved by {deliverable.approval.approvedByName}</div>
                                        <div className="text-green-700 mt-1">{new Date(deliverable.approval.approvedAt).toLocaleString()}</div>
                                        {deliverable.approval.notes && (
                                            <div className="text-green-700 mt-2">{deliverable.approval.notes}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
