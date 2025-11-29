// app/dashboard/monitoring/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProjects } from '@/app/actions/projects';
import MonitoringInterface from './MonitoringInterface';

export default async function MonitoringPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const projectsResult = await getProjects();
    const projects = projectsResult.success ? projectsResult.data : [];

    return (
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Website Monitoring</h1>
                <p className="text-gray-400 mt-2">Track analytics, SEO, and performance metrics for your projects</p>
            </div>

            <MonitoringInterface projects={projects} />
        </div>
    );
}
