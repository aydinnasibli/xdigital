// app/admin/templates/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getTemplates } from '@/app/actions/projectTemplates';
import { ExternalLink, Eye, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import TemplateActions from './TemplateActions';

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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Project Templates</h1>
                            <p className="text-gray-400 mt-2">Create and manage reusable project templates</p>
                        </div>
                        <Link
                            href="/admin/templates/new"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Create Template
                        </Link>
                    </div>
                </div>
            </div>

            {/* Template Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="font-semibold text-white mb-2">Web Development</h3>
                    <p className="text-sm text-gray-400 mb-4">Templates for web projects</p>
                    <div className="text-2xl font-bold text-blue-400">{webDevTemplates.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <div className="text-3xl mb-3">📱</div>
                    <h3 className="font-semibold text-white mb-2">Social Media Marketing</h3>
                    <p className="text-sm text-gray-400 mb-4">Templates for SMM projects</p>
                    <div className="text-2xl font-bold text-purple-400">{smmTemplates.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="font-semibold text-white mb-2">Digital Solutions</h3>
                    <p className="text-sm text-gray-400 mb-4">Templates for consulting</p>
                    <div className="text-2xl font-bold text-emerald-400">{digitalTemplates.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
            </div>

            {/* Templates List */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800/50">
                    <h2 className="text-xl font-semibold text-white">All Templates</h2>
                </div>
                {templates.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-white">No templates yet</p>
                        <p className="text-sm mt-2">Create your first project template to streamline your workflow</p>
                        <Link
                            href="/admin/templates/new"
                            className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Create First Template
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800/50">
                        {templates.map((template: any) => (
                            <Link
                                key={template._id}
                                href={`/admin/templates/${template._id}/edit`}
                                className="block p-6 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <div className="flex gap-6">
                                    {/* Template Screenshot */}
                                    {template.screenshots && template.screenshots[0] ? (
                                        <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex-shrink-0">
                                            <Image
                                                src={template.screenshots[0]}
                                                alt={template.name}
                                                width={192}
                                                height={128}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-32 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gray-500 text-4xl">🎨</span>
                                        </div>
                                    )}

                                    {/* Template Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{template.name}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{template.description || 'No description'}</p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {template.demoUrl && (
                                                    <a
                                                        href={template.demoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
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
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"
                                                        title="View GitHub Repo"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                )}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <TemplateActions templateId={template._id} templateName={template.name} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Template Metadata */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs rounded-full">
                                                {template.package.toUpperCase()}
                                            </span>
                                            {template.category && (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs rounded-full">
                                                    {template.category}
                                                </span>
                                            )}
                                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs rounded-full">
                                                Used {template.usageCount} times
                                            </span>
                                            {template.isDefault && (
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs rounded-full">
                                                    Default Template
                                                </span>
                                            )}
                                        </div>

                                        {/* Features */}
                                        {template.features && template.features.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {template.features.slice(0, 5).map((feature: string, idx: number) => (
                                                        <span key={idx} className="text-xs text-gray-400">
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
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Template Info */}
            <div className="bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-semibold text-purple-300 mb-2">💡 What are Project Templates?</h3>
                <p className="text-gray-300 text-sm">
                    Project templates allow you to create standardized workflows with pre-defined milestones, tasks, and timelines.
                    When creating a new project, you can select a template to automatically populate all the standard items, saving time and ensuring consistency.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="font-medium text-white">✓ Pre-defined Milestones</div>
                        <div className="text-gray-400 text-xs mt-1">Standard project phases</div>
                    </div>
                    <div>
                        <div className="font-medium text-white">✓ Task Checklists</div>
                        <div className="text-gray-400 text-xs mt-1">Recurring tasks for each project type</div>
                    </div>
                    <div>
                        <div className="font-medium text-white">✓ Timeline Estimates</div>
                        <div className="text-gray-400 text-xs mt-1">Automatic scheduling</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
