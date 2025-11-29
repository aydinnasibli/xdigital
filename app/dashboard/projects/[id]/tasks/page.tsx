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
            <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center backdrop-blur-sm">
                    <p className="text-red-400">{tasksResult.error || 'Failed to load tasks'}</p>
                    <Link href={`/dashboard/projects/${projectId}`} className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
                        ← Back to Project
                    </Link>
                </div>
            </div>
        );
    }

    const tasks = tasksResult.data || [];

    return (
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tasks & Kanban Board</h1>
                        <p className="text-gray-400 mt-2">View your project tasks and their current status</p>
                    </div>
                    <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 text-purple-400 hover:text-purple-300 rounded-lg transition-all"
                    >
                        ← Back to Project
                    </Link>
                </div>
            </div>

            <KanbanBoard projectId={projectId} tasks={tasks} readOnly={true} />
        </div>
    );
}
