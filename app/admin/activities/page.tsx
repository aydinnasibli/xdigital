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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Activities</h1>
                <p className="text-gray-600 mt-2">Monitor all user activities and system events</p>
            </div>

            <ActivityFeed initialActivities={activities} />
        </div>
    );
}
