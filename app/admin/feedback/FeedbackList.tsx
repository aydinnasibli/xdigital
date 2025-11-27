// app/admin/feedback/FeedbackList.tsx
'use client';

import { useState } from 'react';
import { addAdminResponse } from '@/app/actions/feedback';
import { useRouter } from 'next/navigation';
import {
    Star,
    MessageSquare,
    Send,
    ChevronDown,
    ChevronUp,
    Bug,
    Lightbulb,
    CheckCircle,
} from 'lucide-react';

interface Feedback {
    _id: string;
    type: string;
    status: string;
    userName: string;
    userEmail: string;
    userImageUrl?: string;
    projectId?: any;
    title?: string;
    comment?: string;
    overallRating?: number;
    adminResponse?: {
        userName: string;
        response: string;
        respondedAt: Date;
    };
    createdAt: string;
}

export default function FeedbackList({ feedbacks }: { feedbacks: Feedback[] }) {
    const router = useRouter();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddResponse = async (feedbackId: string) => {
        if (!responseText.trim()) {
            setError('Please enter a response');
            return;
        }

        setLoading(true);
        setError('');
        const result = await addAdminResponse(feedbackId, responseText);

        if (result.success) {
            setResponseText('');
            setRespondingTo(null);
            router.refresh();
        } else {
            setError(result.error || 'Failed to add response');
        }
        setLoading(false);
    };

    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No feedback found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedbacks.map((feedback) => (
                <div
                    key={feedback._id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            {/* User Avatar */}
                            {feedback.userImageUrl ? (
                                <img
                                    src={feedback.userImageUrl}
                                    alt={feedback.userName}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600 font-semibold text-sm">
                                        {feedback.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{feedback.userName}</h4>
                                    <TypeBadge type={feedback.type} />
                                    <StatusBadge status={feedback.status} />
                                </div>
                                <p className="text-sm text-gray-600">{feedback.userEmail}</p>
                                {feedback.projectId && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Project: {feedback.projectId.projectName}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(feedback.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Expand Button */}
                        <button
                            onClick={() => setExpandedId(expandedId === feedback._id ? null : feedback._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            {expandedId === feedback._id ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Preview */}
                    {!expandedId && (
                        <div className="mt-3 ml-14">
                            {feedback.title && (
                                <h5 className="font-medium text-gray-900 mb-1">{feedback.title}</h5>
                            )}
                            {feedback.comment && (
                                <p className="text-gray-700 text-sm line-clamp-2">{feedback.comment}</p>
                            )}
                            {feedback.overallRating && (
                                <div className="flex items-center gap-2 mt-2">
                                    <StarRating rating={feedback.overallRating} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Expanded Details */}
                    {expandedId === feedback._id && (
                        <div className="mt-4 ml-14 space-y-4">
                            {/* Title */}
                            {feedback.title && (
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-1">{feedback.title}</h5>
                                </div>
                            )}

                            {/* Full Comment */}
                            {feedback.comment && (
                                <div>
                                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Feedback</h6>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                                        {feedback.comment}
                                    </p>
                                </div>
                            )}

                            {/* Rating */}
                            {feedback.overallRating && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                                    <StarRating rating={feedback.overallRating} />
                                    <span className="text-sm text-gray-600">({feedback.overallRating}/5)</span>
                                </div>
                            )}

                            {/* Existing Admin Response */}
                            {feedback.adminResponse && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 mb-1">
                                                Response by {feedback.adminResponse.userName}
                                            </p>
                                            <p className="text-sm text-blue-800">{feedback.adminResponse.response}</p>
                                            <p className="text-xs text-blue-600 mt-2">
                                                {new Date(feedback.adminResponse.respondedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Response Form */}
                            {!feedback.adminResponse && (
                                <div className="pt-4 border-t">
                                    {respondingTo === feedback._id ? (
                                        <div className="space-y-3">
                                            {error && (
                                                <p className="text-sm text-red-600">{error}</p>
                                            )}
                                            <textarea
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                placeholder="Type your response..."
                                                rows={4}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={loading}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddResponse(feedback._id)}
                                                    disabled={loading || !responseText.trim()}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-medium text-sm"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {loading ? 'Sending...' : 'Send Response'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setRespondingTo(null);
                                                        setResponseText('');
                                                        setError('');
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRespondingTo(feedback._id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Add Response
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function TypeBadge({ type }: { type: string }) {
    const typeConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
        bug_report: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bug', icon: Bug },
        feature_request: { bg: 'bg-green-100', text: 'text-green-800', label: 'Feature', icon: Lightbulb },
        general_feedback: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Feedback', icon: MessageSquare },
    };

    const config = typeConfig[type] || typeConfig.general_feedback;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string }> = {
        pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
        submitted: { bg: 'bg-blue-100', text: 'text-blue-800' },
        reviewed: { bg: 'bg-purple-100', text: 'text-purple-800' },
        approved: { bg: 'bg-green-100', text: 'text-green-800' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${config.bg} ${config.text}`}>
            {status}
        </span>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${
                        star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}
