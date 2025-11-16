// app/admin/templates/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getTemplates } from '@/app/actions/project-templates';
import { ExternalLink, Eye, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';

export default async function TemplatesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    // Fetch all templates from database
    const response = await getTemplates();
    const templates = response.success ? response.data : [];

    // Count templates by service type
    const webDevTemplates = templates.filter((t: any) => t.serviceType === 'web_development');
    const smmTemplates = templates.filter((t: any) => t.serviceType === 'social_media_marketing');
    const digitalTemplates = templates.filter((t: any) => t.serviceType === 'digital_solutions');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Templates</h1>
                    <p className="text-gray-600 mt-2">Create and manage reusable project templates</p>
                </div>
                <Link
                    href="/admin/templates/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Create Template
                </Link>
            </div>

            {/* Template Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Web Development</h3>
                    <p className="text-sm text-gray-600 mb-4">Templates for web projects</p>
                    <div className="text-2xl font-bold text-blue-600">{webDevTemplates.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-3xl mb-3">📱</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Social Media Marketing</h3>
                    <p className="text-sm text-gray-600 mb-4">Templates for SMM projects</p>
                    <div className="text-2xl font-bold text-purple-600">{smmTemplates.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Digital Solutions</h3>
                    <p className="text-sm text-gray-600 mb-4">Templates for consulting</p>
                    <div className="text-2xl font-bold text-green-600">{digitalTemplates.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
            </div>

            {/* Templates List */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">All Templates</h2>
                </div>
                {templates.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📋</div>
                        <p>No templates yet</p>
                        <p className="text-sm mt-2">Create your first project template to streamline your workflow</p>
                        <Link
                            href="/admin/templates/new"
                            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create First Template
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y">
                        {templates.map((template: any) => (
                            <div key={template._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex gap-6">
                                    {/* Template Screenshot */}
                                    {template.screenshots && template.screenshots[0] ? (
                                        <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <Image
                                                src={template.screenshots[0]}
                                                alt={template.name}
                                                width={192}
                                                height={128}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-32 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gray-400 text-4xl">🎨</span>
                                        </div>
                                    )}

                                    {/* Template Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{template.description || 'No description'}</p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {template.demoUrl && (
                                                    <a
                                                        href={template.demoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Preview Demo"
                                                    >
                                                        <Eye size={18} />
                                                    </a>
                                                )}
                                                {template.githubRepoUrl && (
                                                    <a
                                                        href={template.githubRepoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                        title="View GitHub Repo"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                )}
                                                <Link
                                                    href={`/admin/templates/${template._id}/edit`}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                    title="Edit Template"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Template Metadata */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                {template.package.toUpperCase()}
                                            </span>
                                            {template.category && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                    {template.category}
                                                </span>
                                            )}
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                Used {template.usageCount} times
                                            </span>
                                            {template.isDefault && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                    Default Template
                                                </span>
                                            )}
                                        </div>

                                        {/* Features */}
                                        {template.features && template.features.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {template.features.slice(0, 5).map((feature: string, idx: number) => (
                                                        <span key={idx} className="text-xs text-gray-600">
                                                            ✓ {feature}
                                                        </span>
                                                    ))}
                                                    {template.features.length > 5 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{template.features.length - 5} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 What are Project Templates?</h3>
                <p className="text-blue-800 text-sm">
                    Project templates allow you to create standardized workflows with pre-defined milestones, tasks, deliverables, and timelines.
                    When creating a new project, you can select a template to automatically populate all the standard items, saving time and ensuring consistency.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="font-medium text-blue-900">✓ Pre-defined Milestones</div>
                        <div className="text-blue-700 text-xs mt-1">Standard project phases</div>
                    </div>
                    <div>
                        <div className="font-medium text-blue-900">✓ Task Checklists</div>
                        <div className="text-blue-700 text-xs mt-1">Recurring tasks for each project type</div>
                    </div>
                    <div>
                        <div className="font-medium text-blue-900">✓ Timeline Estimates</div>
                        <div className="text-blue-700 text-xs mt-1">Automatic scheduling</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
