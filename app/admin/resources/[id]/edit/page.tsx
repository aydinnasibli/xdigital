// app/admin/resources/[id]/edit/page.tsx
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { getAdminResource } from '@/app/actions/resources';
import ResourceForm from '../../ResourceForm';

export default async function EditResourcePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const admin = await isAdmin();
    if (!admin) {
        redirect('/');
    }

    const { id } = await params;
    const result = await getAdminResource(id);

    if (!result.success || !result.data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Resource not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Edit Resource</h1>
                <p className="text-gray-400 mt-2">Update resource information</p>
            </div>

            <ResourceForm resource={result.data} />
        </div>
    );
}
