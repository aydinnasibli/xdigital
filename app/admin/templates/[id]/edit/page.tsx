// app/admin/templates/[id]/edit/page.tsx
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { getTemplate } from '@/app/actions/projectTemplates';
import EditTemplateForm from './EditTemplateForm';

export default async function EditTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const admin = await isAdmin();
    if (!admin) {
        redirect('/');
    }

    const { id } = await params;
    const response = await getTemplate(id);

    if (!response.success || !response.data) {
        redirect('/admin/templates');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Edit Template</h1>
                <p className="text-gray-400 mt-2">Update template information and settings</p>
            </div>

            <EditTemplateForm template={response.data} />
        </div>
    );
}
