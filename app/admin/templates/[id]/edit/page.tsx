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
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
                <p className="text-gray-600 mt-2">Update template information and settings</p>
            </div>

            <EditTemplateForm template={response.data} />
        </div>
    );
}
