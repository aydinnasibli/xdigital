// app/admin/resources/[id]/edit/page.tsx
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { getResource } from '@/app/actions/resources';
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
    const result = await getResource(id);

    if (!result.success || !result.data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Resource not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
                <p className="text-gray-600 mt-2">Update resource information</p>
            </div>

            <ResourceForm resource={result.data} />
        </div>
    );
}
