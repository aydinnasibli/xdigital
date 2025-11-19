// app/admin/reminders/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getUpcomingReminders } from '@/app/actions/client-notes';
import RemindersDashboard from './RemindersDashboard';

export default async function AdminRemindersPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    // Get reminders for the next 30 days
    const remindersResult = await getUpcomingReminders(30);
    const reminders = remindersResult.success ? remindersResult.data : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Client Note Reminders</h1>
                <p className="text-gray-600 mt-2">Manage upcoming reminders for client notes</p>
            </div>

            <RemindersDashboard initialReminders={reminders} />
        </div>
    );
}
