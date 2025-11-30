// app/admin/reminders/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import RemindersDashboard from './RemindersDashboard';
import { getAllReminders, getAllClients } from '@/app/actions/reminders';

export default async function AdminRemindersPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string; days?: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const params = await searchParams;
    const filter = params.filter || 'active';
    const days = params.days ? parseInt(params.days) : 30;

    // Fetch initial data on server
    const [remindersResult, clientsResult] = await Promise.all([
        getAllReminders({
            includeCompleted: filter !== 'active',
            days: filter === 'all' ? undefined : days,
        }),
        getAllClients(),
    ]);

    const reminders = remindersResult.success ? remindersResult.data : [];
    const clients = clientsResult.success ? clientsResult.data : [];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Reminders</h1>
                <p className="text-gray-400 mt-2">Create and manage reminders for your tasks and client follow-ups</p>
            </div>

            <RemindersDashboard
                initialReminders={reminders}
                initialClients={clients}
                initialFilter={filter as 'all' | 'active' | 'completed' | 'overdue'}
                initialDays={days}
            />
        </div>
    );
}
