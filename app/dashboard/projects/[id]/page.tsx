// app/dashboard/projects/[id]/page.tsx
import Link from 'next/link';
import { getProject } from '@/app/actions/projects';
import ProjectDetailClient from '@/components/projects/ProjectDetailComponent';

export default async function ProjectDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const result = await getProject(params.id);

    if (!result.success) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{result.error || 'Project not found'}</p>
                <Link href="/dashboard/projects" className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to Projects
                </Link>
            </div>
        );
    }

    const project = result.data;

    if (!project) {
        return (
            <div className="text-center py-12">
                <p>Project not found</p>
                <Link href="/dashboard/projects" className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to Projects
                </Link>
            </div>
        );
    }

    return <ProjectDetailClient project={project} />;
}