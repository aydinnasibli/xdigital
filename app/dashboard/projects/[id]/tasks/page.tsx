// app/dashboard/projects/[id]/tasks/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjectTasks } from '@/app/actions/tasks';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import Link from 'next/link';

export default async function ProjectTasksPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const { id: projectId } = await params;
    const tasksResult = await getProjectTasks(projectId);

    if (!tasksResult.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{tasksResult.error || 'Failed to load tasks'}</p>
                <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to Project
                </Link>
            </div>
        );
    }

    const tasks = tasksResult.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tasks & Kanban Board</h1>
                    <p className="text-gray-600 mt-2">Drag and drop tasks to update their status</p>
                </div>
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    ← Back to Project
                </Link>
            </div>

            <KanbanBoard projectId={projectId} initialTasks={tasks} />
        </div>
    );
}
