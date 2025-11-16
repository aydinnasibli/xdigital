// app/admin/projects/[id]/DeliverablesSection.tsx
'use client';

import { useState } from 'react';
import {
    createDeliverable,
    approveDeliverable,
    requestChanges,
} from '@/app/actions/deliverables';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { DeliverableStatus, DeliverableCategory } from '@/models/Deliverable';

interface Deliverable {
    _id: string;
    title: string;
    description?: string;
    category: DeliverableCategory;
    status: DeliverableStatus;
    currentVersion: number;
    dueDate?: Date;
    submittedDate?: Date;
    approvedDate?: Date;
    revisions?: any[];
    feedback?: any[];
    approval?: any;
}

export default function DeliverablesSection({
    projectId,
    deliverables,
}: {
    projectId: string;
    deliverables: Deliverable[];
}) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(3);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [newDeliverable, setNewDeliverable] = useState({
        title: '',
        description: '',
        category: DeliverableCategory.DEVELOPMENT,
        dueDate: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeliverable.title.trim()) return;

        setLoading(true);
        const result = await createDeliverable({
            projectId,
            title: newDeliverable.title,
            description: newDeliverable.description || undefined,
            category: newDeliverable.category,
            dueDate: newDeliverable.dueDate ? new Date(newDeliverable.dueDate) : undefined,
        });

        if (result.success) {
            setNewDeliverable({
                title: '',
                description: '',
                category: DeliverableCategory.DEVELOPMENT,
                dueDate: '',
            });
            setShowAddForm(false);
            router.refresh();
        } else {
            alert(result.error || 'Failed to create deliverable');
        }

        setLoading(false);
    };

    const handleApprove = async (deliverableId: string) => {
        if (!confirm('Are you sure you want to approve this deliverable?')) return;

        const result = await approveDeliverable(deliverableId, approvalNotes || undefined);
        if (result.success) {
            setApprovalNotes('');
            router.refresh();
        } else {
            alert(result.error || 'Failed to approve deliverable');
        }
    };

    const handleRequestChanges = async (deliverableId: string) => {
        if (!feedbackText.trim()) {
            alert('Please provide feedback');
            return;
        }

        const result = await requestChanges(deliverableId, feedbackText, feedbackRating);
        if (result.success) {
            setFeedbackText('');
            setFeedbackRating(3);
            setShowFeedbackForm(null);
            router.refresh();
        } else {
            alert(result.error || 'Failed to request changes');
        }
    };

    const getStatusColor = (status: DeliverableStatus) => {
        switch (status) {
            case DeliverableStatus.DRAFT:
                return 'bg-gray-100 text-gray-800';
            case DeliverableStatus.SUBMITTED:
                return 'bg-blue-100 text-blue-800';
            case DeliverableStatus.IN_REVIEW:
                return 'bg-purple-100 text-purple-800';
            case DeliverableStatus.CHANGES_REQUESTED:
                return 'bg-yellow-100 text-yellow-800';
            case DeliverableStatus.APPROVED:
                return 'bg-green-100 text-green-800';
            case DeliverableStatus.REJECTED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                        placeholder="Deliverable title *"
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
                            setNewDeliverable({
                                ...newDeliverable,
                                description: e.target.value,
                            })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={3}
                        disabled={loading}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={newDeliverable.category}
                                onChange={(e) =>
                                    setNewDeliverable({
                                        ...newDeliverable,
                                        category: e.target.value as DeliverableCategory,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                disabled={loading}
                            >
                                <option value={DeliverableCategory.DESIGN}>Design</option>
                                <option value={DeliverableCategory.CONTENT}>Content</option>
                                <option value={DeliverableCategory.DEVELOPMENT}>
                                    Development
                                </option>
                                <option value={DeliverableCategory.DOCUMENTATION}>
                                    Documentation
                                </option>
                                <option value={DeliverableCategory.MARKETING}>
                                    Marketing
                                </option>
                                <option value={DeliverableCategory.OTHER}>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={newDeliverable.dueDate}
                                onChange={(e) =>
                                    setNewDeliverable({
                                        ...newDeliverable,
                                        dueDate: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Deliverable'}
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
                    <p className="text-gray-500 text-center py-8">
                        No deliverables yet. Create one to get started.
                    </p>
                ) : (
                    deliverables.map((deliverable) => (
                        <div
                            key={deliverable._id}
                            className="p-4 border border-gray-200 rounded-lg"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900">
                                            {deliverable.title}
                                        </h4>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                                deliverable.status
                                            )}`}
                                        >
                                            {deliverable.status
                                                .replace(/_/g, ' ')
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    {deliverable.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {deliverable.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="capitalize">
                                            {deliverable.category}
                                        </span>
                                        <span>v{deliverable.currentVersion}</span>
                                        {deliverable.dueDate && (
                                            <span>
                                                Due:{' '}
                                                {new Date(
                                                    deliverable.dueDate
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                        {deliverable.revisions &&
                                            deliverable.revisions.length > 0 && (
                                                <span>
                                                    {deliverable.revisions.length} revision
                                                    {deliverable.revisions.length !== 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Section */}
                            {deliverable.feedback && deliverable.feedback.length > 0 && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                                        Feedback:
                                    </h5>
                                    {deliverable.feedback.map((fb: any, index: number) => (
                                        <div key={index} className="text-sm text-gray-600 mb-2">
                                            <div className="font-medium">{fb.userName}</div>
                                            <div>{fb.comment}</div>
                                            {fb.rating && (
                                                <div className="text-yellow-600 mt-1">
                                                    {'★'.repeat(fb.rating)}
                                                    {'☆'.repeat(5 - fb.rating)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Approval Info */}
                            {deliverable.status === DeliverableStatus.APPROVED &&
                                deliverable.approval && (
                                    <div className="mb-3 p-3 bg-green-50 rounded-lg text-sm">
                                        <div className="font-medium text-green-900">
                                            ✓ Approved by {deliverable.approval.approvedByName}
                                        </div>
                                        <div className="text-green-700 mt-1">
                                            {new Date(
                                                deliverable.approval.approvedAt
                                            ).toLocaleString()}
                                        </div>
                                        {deliverable.approval.notes && (
                                            <div className="text-green-700 mt-2">
                                                {deliverable.approval.notes}
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Action Buttons */}
                            {deliverable.status === DeliverableStatus.SUBMITTED && (
                                <div className="flex gap-2">
                                    {showFeedbackForm === deliverable._id ? (
                                        <div className="flex-1 p-3 bg-yellow-50 rounded-lg space-y-2">
                                            <textarea
                                                placeholder="Provide feedback for changes..."
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                rows={3}
                                            />
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-700">
                                                    Rating:
                                                </label>
                                                <select
                                                    value={feedbackRating}
                                                    onChange={(e) =>
                                                        setFeedbackRating(Number(e.target.value))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                >
                                                    <option value={1}>1 Star</option>
                                                    <option value={2}>2 Stars</option>
                                                    <option value={3}>3 Stars</option>
                                                    <option value={4}>4 Stars</option>
                                                    <option value={5}>5 Stars</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleRequestChanges(deliverable._id)
                                                    }
                                                    className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                                                >
                                                    Submit Feedback
                                                </button>
                                                <button
                                                    onClick={() => setShowFeedbackForm(null)}
                                                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleApprove(deliverable._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowFeedbackForm(deliverable._id)
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Request Changes
                                            </button>
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
