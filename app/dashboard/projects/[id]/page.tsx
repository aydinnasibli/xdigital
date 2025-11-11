// app/(dashboard)/dashboard/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
    _id: string;
    projectName: string;
    projectDescription: string;
    serviceType: string;
    package: string;
    status: string;
    timeline?: {
        startDate?: string;
        estimatedCompletion?: string;
        completedDate?: string;
    };
    deliverables?: string[];
    milestones?: Array<{
        title: string;
        description?: string;
        dueDate?: string;
        completed: boolean;
        completedDate?: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'messages' | 'invoices'>('overview');

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            const data = await res.json();

            if (data.success) {
                setProject(data.project);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/dashboard/projects');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading project...</div>;
    }

    if (!project) {
        return <div className="text-center py-12">Project not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/projects" className="text-blue-600 hover:underline mb-4 inline-block">
                    ← Back to Projects
                </Link>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{project.projectName}</h1>
                        <div className="flex gap-2 mt-2">
                            <span className={`px-3 py-1 text-sm rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                                {project.serviceType.replace('_', ' ')}
                            </span>
                            <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                                {project.package} Package
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/dashboard/projects/${projectId}/edit`}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 px-1 border-b-2 ${activeTab === 'overview'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`pb-3 px-1 border-b-2 ${activeTab === 'timeline'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Timeline & Milestones
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`pb-3 px-1 border-b-2 ${activeTab === 'messages'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`pb-3 px-1 border-b-2 ${activeTab === 'invoices'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Invoices
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Project Description</h2>
                        <p className="text-gray-700">{project.projectDescription}</p>
                    </div>

                    {project.deliverables && project.deliverables.length > 0 && (
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Deliverables</h2>
                            <ul className="space-y-2">
                                {project.deliverables.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-gray-600 mr-2">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Created</div>
                                <div className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Last Updated</div>
                                <div className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'timeline' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                        <div className="space-y-3">
                            {project.timeline?.startDate && (
                                <div>
                                    <div className="text-sm text-gray-600">Start Date</div>
                                    <div className="font-medium">{new Date(project.timeline.startDate).toLocaleDateString()}</div>
                                </div>
                            )}
                            {project.timeline?.estimatedCompletion && (
                                <div>
                                    <div className="text-sm text-gray-600">Estimated Completion</div>
                                    <div className="font-medium">{new Date(project.timeline.estimatedCompletion).toLocaleDateString()}</div>
                                </div>
                            )}
                            {project.timeline?.completedDate && (
                                <div>
                                    <div className="text-sm text-gray-600">Completed Date</div>
                                    <div className="font-medium">{new Date(project.timeline.completedDate).toLocaleDateString()}</div>
                                </div>
                            )}
                            {!project.timeline?.startDate && (
                                <p className="text-gray-500">Timeline will be set by admin</p>
                            )}
                        </div>
                    </div>

                    {project.milestones && project.milestones.length > 0 && (
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Milestones</h2>
                            <div className="space-y-4">
                                {project.milestones.map((milestone, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 border rounded">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                                            }`}>
                                            {milestone.completed && (
                                                <span className="text-white text-sm">✓</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{milestone.title}</h3>
                                            {milestone.description && (
                                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                            )}
                                            {milestone.dueDate && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Messages</h2>
                    <p className="text-gray-500">No messages yet. Messages will appear here.</p>
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Invoices</h2>
                    <p className="text-gray-500">No invoices yet. Invoices will appear here.</p>
                </div>
            )}
        </div>
    );
}