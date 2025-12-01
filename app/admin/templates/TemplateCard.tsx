'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, ExternalLink } from 'lucide-react';
import TemplateActions from './TemplateActions';

interface TemplateCardProps {
    template: any;
}

export default function TemplateCard({ template }: TemplateCardProps) {
    return (
        <Link
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
    );
}
