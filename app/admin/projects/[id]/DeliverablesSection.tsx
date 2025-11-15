// app/admin/projects/[id]/DeliverablesSection.tsx
'use client';

import { useState } from 'react';
import { createDeliverable, approveDeliverable, requestChanges } from '@/app/actions/deliverables';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function DeliverablesSection({
    projectId,
    deliverables,
}: {
    projectId: string;
    deliverables: any[];
}) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDeliverable, setNewDeliverable] = useState({
        title: '',
        description: '',
        category: 'design',
        dueDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const router = useRouter();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeliverable.title.trim()) return;

        setLoading(true);
        const result = await createDeliverable({
            projectId,
            title: newDeliverable.title,
            description: newDeliverable.description || undefined,
            category: newDeliverable.category as any,
            dueDate: newDeliverable.dueDate ? new Date(newDeliverable.dueDate) : undefined,
        });

        if (result.success) {
            setNewDeliverable({ title: '', description: '', category: 'design', dueDate: '' });
            setShowAddForm(false);
            router.refresh();
        } else {
            alert(result.error || 'Failed to add deliverable');
        }

        setLoading(false);
    };

    const handleApprove = async (deliverableId: string) => {
        if (!confirm('Approve this deliverable?')) return;

        setActionLoading(deliverableId);
        const result = await approveDeliverable(deliverableId, approvalNotes || undefined);

        if (result.success) {
            setApprovalNotes('');
            router.refresh();
        } else {
            alert(result.error || 'Failed to approve deliverable');
        }

        setActionLoading(null);
    };

    const handleRequestChanges = async (deliverableId: string) => {
        if (!feedback.trim()) {
            alert('Please provide feedback');
            return;
        }

        setActionLoading(deliverableId);
        const result = await requestChanges(deliverableId, feedback);

        if (result.success) {
            setFeedback('');
            setShowFeedbackForm(null);
            router.refresh();
        } else {
            alert(result.error || 'Failed to request changes');
        }

        setActionLoading(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'submitted':
            case 'in_review':
                return 'bg-blue-100 text-blue-800';
            case 'changes_requested':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'design': return '🎨';
            case 'content': return '📝';
            case 'development': return '💻';
            case 'documentation': return '📄';
            case 'marketing': return '📢';
            default: return '📦';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Deliverables ({deliverables.length})
                </h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Deliverable
                </button>
            </div>

            {/* Add Deliverable Form */}
            {showAddForm && (
                <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                    <input
                        type="text"
                        placeholder="Deliverable title"
                        value={newDeliverable.title}
                        onChange={(e) =>
                            setNewDeliverable({ ...newDeliverable, title: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        disabled={loading}
                        required
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={newDeliverable.description}
                        onChange={(e) =>
                            setNewDeliverable({ ...newDeliverable, description: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={3}
                        disabled={loading}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={newDeliverable.category}
                            onChange={(e) =>
                                setNewDeliverable({ ...newDeliverable, category: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            disabled={loading}
                        >
                            <option value="design">Design</option>
                            <option value="content">Content</option>
                            <option value="development">Development</option>
                            <option value="documentation">Documentation</option>
                            <option value="marketing">Marketing</option>
                            <option value="other">Other</option>
                        </select>
                        <input
                            type="date"
                            value={newDeliverable.dueDate}
                            onChange={(e) =>
                                setNewDeliverable({ ...newDeliverable, dueDate: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Deliverables List */}
            <div className="space-y-4">
                {deliverables.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No deliverables yet</p>
                ) : (
                    deliverables.map((deliverable) => (
                        <div
                            key={deliverable._id}
                            className="p-4 border rounded-lg bg-white hover:bg-gray-50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="text-2xl">{getCategoryIcon(deliverable.category)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{deliverable.title}</h4>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deliverable.status)}`}>
                                                {deliverable.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        {deliverable.description && (
                                            <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="capitalize">Category: {deliverable.category}</span>
                                            <span>Version: v{deliverable.currentVersion}</span>
                                            {deliverable.dueDate && (
                                                <span>Due: {new Date(deliverable.dueDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Revisions */}
                            {deliverable.revisions && deliverable.revisions.length > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                            Latest Submission (v{deliverable.currentVersion})
                                        </span>
                                    </div>
                                    {deliverable.revisions[deliverable.revisions.length - 1].notes && (
                                        <p className="text-sm text-blue-700 mb-2">
                                            {deliverable.revisions[deliverable.revisions.length - 1].notes}
                                        </p>
                                    )}
                                    {deliverable.revisions[deliverable.revisions.length - 1].fileName && (
                                        <div className="text-sm text-blue-700">
                                            File: {deliverable.revisions[deliverable.revisions.length - 1].fileName}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Feedback */}
                            {deliverable.feedback && deliverable.feedback.length > 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                    <div className="text-sm font-medium text-yellow-900 mb-2">Feedback:</div>
                                    {deliverable.feedback.map((fb: any, index: number) => (
                                        <div key={index} className="text-sm text-yellow-700 mb-2">
                                            <div className="font-medium">{fb.userName}</div>
                                            <div>{fb.comment}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Approval */}
                            {deliverable.status === 'approved' && deliverable.approval && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-900">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Approved by {deliverable.approval.approvedByName}
                                        </span>
                                    </div>
                                    <div className="text-xs text-green-700 mt-1">
                                        {new Date(deliverable.approval.approvedAt).toLocaleString()}
                                    </div>
                                    {deliverable.approval.notes && (
                                        <div className="text-sm text-green-700 mt-2">{deliverable.approval.notes}</div>
                                    )}
                                </div>
                            )}

                            {/* Actions for submitted deliverables */}
                            {(deliverable.status === 'submitted' || deliverable.status === 'in_review') && (
                                <div className="mt-4 pt-4 border-t space-y-3">
                                    {showFeedbackForm === deliverable._id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                placeholder="Provide feedback for requested changes..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRequestChanges(deliverable._id)}
                                                    disabled={actionLoading === deliverable._id}
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                                                >
                                                    {actionLoading === deliverable._id ? 'Requesting...' : 'Submit Feedback'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowFeedbackForm(null);
                                                        setFeedback('');
                                                    }}
                                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Approval notes (optional)"
                                                    value={approvalNotes}
                                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(deliverable._id)}
                                                    disabled={actionLoading === deliverable._id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {actionLoading === deliverable._id ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => setShowFeedbackForm(deliverable._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Request Changes
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
