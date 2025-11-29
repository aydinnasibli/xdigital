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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400 mt-2">Stay updated with your projects</p>
            </div>

            <NotificationsClient />
        </div>
    );
}