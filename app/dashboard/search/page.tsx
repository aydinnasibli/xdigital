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
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Search</h1>
                <p className="text-gray-400 mt-2">Search across all your projects, tasks, files, and more</p>
            </div>

            <SearchInterface />
        </div>
    );
}
