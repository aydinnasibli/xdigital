// app/dashboard/search/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import SearchInterface from './SearchInterface';

export default async function SearchPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Search</h1>
                <p className="text-gray-600 mt-2">Search across all your projects, tasks, files, and more</p>
            </div>

            <SearchInterface />
        </div>
    );
}
