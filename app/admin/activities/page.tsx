// app/admin/activities/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getAllActivities } from '@/app/actions/activities';
import ActivityFeed from './ActivityFeed';

export default async function AdminActivitiesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const activitiesResult = await getAllActivities({}, 100);
    const activities = activitiesResult.success ? activitiesResult.data : [];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">System Activities</h1>
                <p className="text-gray-400 mt-2">Monitor all user activities and system events</p>
            </div>

            <ActivityFeed initialActivities={activities} />
        </div>
    );
}
