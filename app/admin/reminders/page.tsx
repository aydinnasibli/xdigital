// app/admin/reminders/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import RemindersDashboard from './RemindersDashboard';

export default async function AdminRemindersPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                <p className="text-gray-600 mt-2">Create and manage reminders for your tasks and client follow-ups</p>
            </div>

            <RemindersDashboard />
        </div>
    );
}
