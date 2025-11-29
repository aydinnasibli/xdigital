// app/dashboard/resources/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getResources } from '@/app/actions/resources';
import ResourcesInterface from './ResourcesInterface';

export default async function ResourcesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const resourcesResult = await getResources();
    const resources = resourcesResult.success ? resourcesResult.data : [];

    const categories = [...new Set(resources.map((r: any) => r.category))] as string[];

    return (
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Resource Library</h1>
                <p className="text-gray-400 mt-2">Helpful guides, tutorials, and documents for your projects</p>
            </div>

            <ResourcesInterface initialResources={resources} categories={categories} />
        </div>
    );
}
