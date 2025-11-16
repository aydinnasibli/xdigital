// app/admin/resources/page.tsx
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { getResources } from '@/app/actions/resources';
import Link from 'next/link';
import ResourcesList from './ResourcesList';

export default async function AdminResourcesPage() {
    const admin = await isAdmin();
    if (!admin) {
        redirect('/');
    }

    // Get ALL resources (published and unpublished) for admin
    const resourcesResult = await getResources();
    const resources = resourcesResult.success ? resourcesResult.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
                    <p className="text-gray-600 mt-2">
                        Manage resources, guides, and tutorials for clients
                    </p>
                </div>
                <Link
                    href="/admin/resources/new"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    + Create Resource
                </Link>
            </div>

            <ResourcesList resources={resources} />
        </div>
    );
}
