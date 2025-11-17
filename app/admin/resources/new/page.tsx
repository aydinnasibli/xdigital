// app/admin/resources/new/page.tsx
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import ResourceForm from '../ResourceForm';

export default async function NewResourcePage() {
    const admin = await isAdmin();
    if (!admin) {
        redirect('/');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Resource</h1>
                <p className="text-gray-600 mt-2">
                    Add a new guide, tutorial, or document for clients
                </p>
            </div>

            <ResourceForm />
        </div>
    );
}
