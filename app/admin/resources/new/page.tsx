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
        <div className="space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Create New Resource</h1>
                <p className="text-gray-400 mt-2">
                    Add a new guide, tutorial, or document for clients
                </p>
            </div>

            <ResourceForm />
        </div>
    );
}
