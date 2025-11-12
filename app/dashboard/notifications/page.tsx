import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import NotificationsClient from '@/components/notifications/NotificationsClient';

export default async function NotificationsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-gray-600 mt-2">Stay updated with your projects</p>
            </div>

            <NotificationsClient />
        </div>
    );
}