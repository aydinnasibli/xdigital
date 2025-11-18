// components/projects/ProjectDetailClient.tsx
'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteProject } from '@/app/actions/projects';
import { getMessages, sendMessage } from '@/app/actions/messages';
import { useEffect } from 'react';
import { getProjectInvoices } from '@/app/actions/invoices';
import { getProjectAnalytics } from '@/app/actions/monitoring';
import dynamic from 'next/dynamic';
import { usePusherChannel } from '@/lib/hooks/usePusher';
import { toast } from 'sonner';

// Dynamically import heavy dashboard components
const SEODashboard = dynamic(() => import('@/components/dashboard/SEODashboard'), {
    loading: () => <div className="text-center py-8">Loading SEO Dashboard...</div>,
});
const PerformanceDashboard = dynamic(() => import('@/components/dashboard/PerformanceDashboard'), {
    loading: () => <div className="text-center py-8">Loading Performance Dashboard...</div>,
});

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
    deploymentUrl?: string;
    vercelProjectId?: string;
    googleAnalyticsPropertyId?: string;
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
    const [configured, setConfigured] = useState(true);
    const [configMessage, setConfigMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);

    useEffect(() => {
        loadAnalytics();
    }, [projectId]);

    const loadAnalytics = async () => {
        setLoading(true);
        const result = await getProjectAnalytics(projectId);
        if (result.success && result.data) {
            if (result.data.configured === false) {
                setConfigured(false);
                setConfigMessage(result.data.message || 'Analytics not configured');
            } else {
                setConfigured(true);
                setSummary(result.data.summary || result.data);
            }
        }
        setLoading(false);
    };

    const handleDownloadReport = async () => {
        setGeneratingReport(true);
        try {
            const { generatePDFReport } = await import('@/app/actions/monitoring');
            const result = await generatePDFReport(projectId);

            if (result.success && result.data) {
                // Open HTML in new window for now (user can save as PDF)
                const reportWindow = window.open('', '_blank');
                if (reportWindow) {
                    reportWindow.document.write(result.data.html);
                    reportWindow.document.close();
                }
            } else {
                alert(result.error || 'Failed to generate report');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
        } finally {
            setGeneratingReport(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading analytics...</div>;
    }

    if (!configured) {
        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <div className="text-yellow-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Not Configured</h3>
                    <p className="text-gray-600 mb-4">{configMessage}</p>
                    <p className="text-sm text-gray-500">
                        Google Analytics will be set up by the admin when your project is deployed.
                        You'll be able to track traffic, user behavior, and performance metrics once configured.
                    </p>
                </div>
            </div>
        );
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
                <p className="text-gray-500 mb-4">
                    Detailed analytics will be available once your project goes live.
                    You'll be able to track traffic, user behavior, and performance metrics.
                </p>
                <button
                    onClick={handleDownloadReport}
                    disabled={generatingReport}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {generatingReport ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Generating Report...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Monthly Report
                        </>
                    )}
                </button>
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
                                    <button
                                        onClick={() => alert('Online payment integration is being set up. Please contact the admin for payment instructions.')}
                                        className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed hover:bg-gray-500"
                                        title="Payment integration coming soon"
                                    >
                                        Pay Now (Coming Soon)
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

    // Real-time message listener
    const handleNewMessage = useCallback((data: any) => {
        console.log('📨 New message received via Pusher:', data);
        setMessages(prev => [...prev, {
            _id: data._id,
            sender: data.sender,
            message: data.message,
            createdAt: data.createdAt,
        }]);
        // Show toast if message is from admin
        if (data.sender === 'admin') {
            toast.info('New message from admin');
        }
    }, []);

    usePusherChannel(`project-${projectId}`, 'new-message', handleNewMessage);

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
            toast.success('Message sent');
        } else {
            toast.error(result.error || 'Failed to send message');
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
    const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'messages' | 'invoices' | 'analytics' | 'seo' | 'performance'>(
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
                        onClick={() => setActiveTab('milestones')}
                        className={`pb-3 px-1 border-b-2 ${activeTab === 'milestones'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Milestones
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

                    {project.deploymentUrl && (
                        <>
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`pb-3 px-1 border-b-2 ${activeTab === 'seo'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                SEO
                            </button>
                            <button
                                onClick={() => setActiveTab('performance')}
                                className={`pb-3 px-1 border-b-2 ${activeTab === 'performance'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Performance
                            </button>
                        </>
                    )}

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
                    {/* Quick Access Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href={`/dashboard/projects/${project._id}/tasks`}
                            className="bg-white p-6 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                            <div className="text-3xl mb-3">✅</div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Tasks & Kanban</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage project tasks</p>
                        </Link>
                        <Link
                            href={`/dashboard/projects/${project._id}/files`}
                            className="bg-white p-6 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                            <div className="text-3xl mb-3">📁</div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Files & Documents</h3>
                            <p className="text-sm text-gray-600 mt-1">View and upload files</p>
                        </Link>
                        <Link
                            href={`/dashboard/projects/${project._id}/deliverables`}
                            className="bg-white p-6 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                            <div className="text-3xl mb-3">📦</div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Deliverables</h3>
                            <p className="text-sm text-gray-600 mt-1">Track deliverables</p>
                        </Link>
                    </div>

                    {/* Live Website */}
                    {project.deploymentUrl && (
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                        <span className="text-2xl">🌐</span>
                                        Your Website is Live!
                                    </h2>
                                    <p className="text-gray-700 mb-4">
                                        Your website has been successfully deployed and is now accessible online.
                                    </p>
                                    <a
                                        href={project.deploymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Visit Your Website
                                    </a>
                                </div>
                                <div className="hidden md:block text-6xl">🚀</div>
                            </div>
                            <div className="mt-4 p-3 bg-white/50 rounded border border-blue-200">
                                <p className="text-xs text-gray-600 mb-1">Website URL:</p>
                                <p className="text-sm font-mono text-blue-600 break-all">{project.deploymentUrl}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Project Description</h2>
                        <p className="text-gray-700">{project.projectDescription}</p>
                    </div>

                    {project.deliverables && project.deliverables.length > 0 && (
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Expected Deliverables</h2>
                            <ul className="space-y-2">
                                {project.deliverables.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-blue-600 mr-2">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`/dashboard/projects/${project._id}/deliverables`}
                                className="inline-block mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View Detailed Deliverables →
                            </Link>
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

            {activeTab === 'milestones' && (
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Start Date</div>
                                <div className="font-medium text-lg">
                                    {project.timeline?.startDate
                                        ? new Date(project.timeline.startDate).toLocaleDateString()
                                        : 'Not set by admin yet'}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Estimated Completion</div>
                                <div className="font-medium text-lg">
                                    {project.timeline?.estimatedCompletion
                                        ? new Date(project.timeline.estimatedCompletion).toLocaleDateString()
                                        : 'Not set by admin yet'}
                                </div>
                            </div>
                            {project.timeline?.completedDate && (
                                <div>
                                    <div className="text-sm text-gray-600">Completed Date</div>
                                    <div className="font-medium text-lg text-green-600">
                                        {new Date(project.timeline.completedDate).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Milestones */}
                    {project.milestones && project.milestones.length > 0 ? (
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Project Milestones</h2>
                            <div className="space-y-4">
                                {project.milestones.map((milestone, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-start gap-4 p-4 border rounded-lg ${
                                            milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            {milestone.completed && <span className="text-white text-lg">✓</span>}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{milestone.title}</h3>
                                            {milestone.description && (
                                                <p className="text-gray-600 mt-1">{milestone.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2 text-sm">
                                                {milestone.dueDate && (
                                                    <div className="text-gray-500">
                                                        📅 Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {milestone.completed && milestone.completedDate && (
                                                    <div className="text-green-600">
                                                        ✓ Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-lg border text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Milestones Yet</h3>
                            <p className="text-gray-600">
                                Milestones will be added by the admin as your project progresses.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && <MessagesTab projectId={project._id} />}
            {activeTab === 'analytics' && <AnalyticsTab projectId={project._id} />}
            {activeTab === 'seo' && project.deploymentUrl && <SEODashboard projectId={project._id} />}
            {activeTab === 'performance' && project.deploymentUrl && <PerformanceDashboard projectId={project._id} />}
            {activeTab === 'invoices' && <InvoicesTab projectId={project._id} />}
        </div>
    );
}