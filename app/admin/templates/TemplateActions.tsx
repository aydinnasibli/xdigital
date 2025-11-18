// app/admin/templates/TemplateActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTemplate } from '@/app/actions/project-templates';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TemplateActions({ templateId, templateName }: { templateId: string; templateName: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${templateName}"? This will deactivate the template.`)) {
            return;
        }

        setLoading(true);
        const result = await deleteTemplate(templateId);
        if (result.success) {
            toast.success('Template deleted successfully');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to delete template');
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            title="Delete Template"
        >
            <Trash2 size={18} />
        </button>
    );
}
