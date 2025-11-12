// components/projects/ProjectDetailClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteProject } from '@/app/actions/projects';
import { getMessages, sendMessage } from '@/app/actions/messages';
import { useEffect } from 'react';
import { getProjectInvoices } from '@/app/actions/invoices';
import { getProjectAnalytics } from '@/app/actions/analytics';

interface AnalyticsSummary {
    pageViews: number;
    visitors: number;
    conversions: number;
    engagement: number;
}


interface Invoice {
    _id: string;
    invoiceNumber: string;
    status: string;
    total: number;
    currency: string;
    dueDate: string;
    issueDate: string;
    paidDate?: string;
}


interface Message {
    _id: string;
    sender: 'client' | 'admin';
    message: string;
    createdAt: string;
}

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

function AnalyticsTab({ projectId }: { projectId: string }) {
    const [summary, setSummary] = useState<AnalyticsSummary>({
        pageViews: 0,
        visitors: 0,
        conversions: 0,
        engagement: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [projectId]);

    const loadAnalytics = async () => {
        setLoading(true);
        const result = await getProjectAnalytics(projectId);
        if (result.success && result.data) {
            setSummary(result.data.summary);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="text-center py-8">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Page Views</div>
                    <div className="text-3xl font-bold mt-2">{summary.pageViews}</div>
                    <div className="text-sm text-gray-500 mt-1">Total views</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Visitors</div>
                    <div className="text-3xl font-bold mt-2">{summary.visitors}</div>
                    <div className="text-sm text-gray-500 mt-1">Unique visitors</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Conversions</div>
                    <div className="text-3xl font-bold mt-2">{summary.conversions}</div>
                    <div className="text-sm text-gray-500 mt-1">Goal completions</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-sm text-gray-600">Engagement</div>
                    <div className="text-3xl font-bold mt-2">{summary.engagement}</div>
                    <div className="text-sm text-gray-500 mt-1">Total interactions</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Analytics Overview</h3>
                <p className="text-gray-500">
                    Detailed analytics will be available once your project goes live.
                    You'll be able to track traffic, user behavior, and performance metrics.
                </p>
            </div>
        </div>
    );
}
function InvoicesTab({ projectId }: { projectId: string }) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, [projectId]);

    const loadInvoices = async () => {
        setLoading(true);
        const result = await getProjectInvoices(projectId);
        if (result.success && result.data) {
            setInvoices(result.data);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="text-center py-8">Loading invoices...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Invoices</h2>
            {invoices.length === 0 ? (
                <p className="text-gray-500">No invoices yet. Invoices will appear here.</p>
            ) : (
                <div className="space-y-4">
                    {invoices.map((invoice) => (
                        <div key={invoice._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                                    <p className="text-sm text-gray-600">
                                        Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(invoice.status)}`}>
                                    {invoice.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-2xl font-bold">
                                        {invoice.currency} {invoice.total.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                {invoice.status === 'sent' && (
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
// Add this component before the main ProjectDetailClient component
function MessagesTab({ projectId }: { projectId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadMessages();
    }, [projectId]);

    const loadMessages = async () => {
        setLoading(true);
        const result = await getMessages(projectId);
        if (result.success && result.data) {
            setMessages(result.data);
        }
        setLoading(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        const result = await sendMessage(projectId, newMessage);
        if (result.success) {
            setNewMessage('');
            await loadMessages();
        } else {
            alert(result.error || 'Failed to send message');
        }
        setSending(false);
    };

    if (loading) {
        return <div className="text-center py-8">Loading messages...</div>;
    }

    return (
        <div className="bg-white rounded-lg border flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg px-4 py-3 ${msg.sender === 'client'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p className="text-sm">{msg.message}</p>
                                <p
                                    className={`text-xs mt-2 ${msg.sender === 'client' ? 'text-blue-100' : 'text-gray-500'
                                        }`}
                                >
                                    {new Date(msg.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}


export default function ProjectDetailClient({ project }: { project: Project }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'messages' | 'invoices' | 'analytics'>(
        'overview'
    );
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        startTransition(async () => {
            const result = await deleteProject(project._id);

            if (result.success) {
                router.push('/dashboard/projects');
                router.refresh();
            } else {
                alert(result.error || 'Failed to delete project');
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/projects"
                    className="text-blue-600 hover:underline mb-4 inline-block"
                >
                    ← Back to Projects
                </Link>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{project.projectName}</h1>
                        <div className="flex gap-2 mt-2">
                            <span
                                className={`px-3 py-1 text-sm rounded-full ${project.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : project.status === 'in_progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : project.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
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
                            href={`/dashboard/projects/${project._id}/edit`}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
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
                        onClick={() => setActiveTab('analytics')}
                        className={`pb-3 px-1 border-b-2 ${activeTab === 'analytics'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Analytics
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
                                <div className="font-medium">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Last Updated</div>
                                <div className="font-medium">
                                    {new Date(project.updatedAt).toLocaleDateString()}
                                </div>
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
                                    <div className="font-medium">
                                        {new Date(project.timeline.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                            {project.timeline?.estimatedCompletion && (
                                <div>
                                    <div className="text-sm text-gray-600">Estimated Completion</div>
                                    <div className="font-medium">
                                        {new Date(project.timeline.estimatedCompletion).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                            {project.timeline?.completedDate && (
                                <div>
                                    <div className="text-sm text-gray-600">Completed Date</div>
                                    <div className="font-medium">
                                        {new Date(project.timeline.completedDate).toLocaleDateString()}
                                    </div>
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
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            {milestone.completed && <span className="text-white text-sm">✓</span>}
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

            {activeTab === 'messages' && <MessagesTab projectId={project._id} />}
            {activeTab === 'analytics' && <AnalyticsTab projectId={project._id} />}
            {activeTab === 'invoices' && <InvoicesTab projectId={project._id} />}
        </div>
    );
}