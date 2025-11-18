// app/admin/feedback/FeedbackList.tsx
'use client';

import { useState } from 'react';
import { approveTestimonial, rejectTestimonial, addAdminResponse } from '@/app/actions/feedback';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Star,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    CheckCircle,
    XCircle,
    Send,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

interface Feedback {
    _id: string;
    type: string;
    status: string;
    userName: string;
    userEmail: string;
    userImageUrl?: string;
    projectId?: any;
    npsScore?: number;
    overallRating?: number;
    ratings?: {
        communication?: number;
        quality?: number;
        timeliness?: number;
        professionalism?: number;
        valueForMoney?: number;
    };
    testimonial?: string;
    title?: string;
    comment?: string;
    wouldRecommend?: boolean;
    improvements?: string;
    highlights?: string;
    adminResponse?: {
        userName: string;
        response: string;
        respondedAt: Date;
    };
    submittedAt?: string;
    createdAt: string;
}

export default function FeedbackList({ feedbacks }: { feedbacks: Feedback[] }) {
    const router = useRouter();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApprove = async (feedbackId: string) => {
        setLoading(true);
        const result = await approveTestimonial(feedbackId);
        if (result.success) {
            toast.success('Testimonial approved successfully');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to approve testimonial');
        }
        setLoading(false);
    };

    const handleReject = async (feedbackId: string) => {
        setLoading(true);
        const result = await rejectTestimonial(feedbackId);
        if (result.success) {
            toast.success('Testimonial rejected');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to reject testimonial');
        }
        setLoading(false);
    };

    const handleAddResponse = async (feedbackId: string) => {
        if (!responseText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setLoading(true);
        const result = await addAdminResponse(feedbackId, responseText);
        if (result.success) {
            toast.success('Response added successfully');
            setResponseText('');
            setRespondingTo(null);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to add response');
        }
        setLoading(false);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
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
                <div key={feedback._id} className="border rounded-lg p-4 hover:border-blue-300 transition">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            {feedback.userImageUrl && (
                                <img
                                    src={feedback.userImageUrl}
                                    alt={feedback.userName}
                                    className="w-10 h-10 rounded-full"
                                />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{feedback.userName}</h4>
                                    <TypeBadge type={feedback.type} />
                                    <StatusBadge status={feedback.status} />
                                </div>
                                <p className="text-sm text-gray-600">{feedback.userEmail}</p>
                                {feedback.projectId && (
                                    <p className="text-sm text-gray-500">
                                        Project: {feedback.projectId.projectName}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(feedback.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleExpand(feedback._id)}
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
                    <div className="mt-3 space-y-2">
                        {feedback.npsScore !== undefined && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">NPS Score:</span>
                                <NPSBadge score={feedback.npsScore} />
                            </div>
                        )}
                        {feedback.overallRating && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Overall Rating:</span>
                                <StarRating rating={feedback.overallRating} />
                            </div>
                        )}
                        {feedback.testimonial && (
                            <p className="text-gray-700 line-clamp-2">{feedback.testimonial}</p>
                        )}
                        {feedback.comment && (
                            <p className="text-gray-700 line-clamp-2">{feedback.comment}</p>
                        )}
                    </div>

                    {/* Expanded Details */}
                    {expandedId === feedback._id && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Detailed Ratings */}
                            {feedback.ratings && (
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(feedback.ratings).map(([key, value]) => (
                                        value && (
                                            <div key={key}>
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                </span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <StarRating rating={value} />
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Full Content */}
                            {feedback.title && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Title:</span>
                                    <p className="text-gray-900 mt-1">{feedback.title}</p>
                                </div>
                            )}
                            {feedback.testimonial && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Testimonial:</span>
                                    <p className="text-gray-900 mt-1">{feedback.testimonial}</p>
                                </div>
                            )}
                            {feedback.comment && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Comment:</span>
                                    <p className="text-gray-900 mt-1">{feedback.comment}</p>
                                </div>
                            )}
                            {feedback.highlights && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Highlights:</span>
                                    <p className="text-gray-900 mt-1">{feedback.highlights}</p>
                                </div>
                            )}
                            {feedback.improvements && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Improvements:</span>
                                    <p className="text-gray-900 mt-1">{feedback.improvements}</p>
                                </div>
                            )}
                            {feedback.wouldRecommend !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Would Recommend:</span>
                                    {feedback.wouldRecommend ? (
                                        <ThumbsUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <ThumbsDown className="w-4 h-4 text-red-600" />
                                    )}
                                </div>
                            )}

                            {/* Admin Response */}
                            {feedback.adminResponse && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                            Admin Response by {feedback.adminResponse.userName}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{feedback.adminResponse.response}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(feedback.adminResponse.respondedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {/* Testimonial Actions */}
                                {feedback.type === 'testimonial' && feedback.status === 'submitted' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(feedback._id)}
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(feedback._id)}
                                            disabled={loading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </>
                                )}

                                {/* Response Action */}
                                {!feedback.adminResponse && (
                                    <button
                                        onClick={() => setRespondingTo(respondingTo === feedback._id ? null : feedback._id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Add Response
                                    </button>
                                )}
                            </div>

                            {/* Response Form */}
                            {respondingTo === feedback._id && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Type your response..."
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                                        disabled={loading}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddResponse(feedback._id)}
                                            disabled={loading || !responseText.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            {loading ? 'Sending...' : 'Send Response'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setRespondingTo(null);
                                                setResponseText('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
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
    const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
        project_survey: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Project Survey' },
        milestone_feedback: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Milestone' },
        nps_survey: { bg: 'bg-green-100', text: 'text-green-800', label: 'NPS' },
        testimonial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Testimonial' },
        general_feedback: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'General' },
        bug_report: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bug Report' },
        feature_request: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Feature' },
    };

    const config = typeConfig[type] || typeConfig.general_feedback;

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
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
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${config.bg} ${config.text}`}>
            {status}
        </span>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );
}

function NPSBadge({ score }: { score: number }) {
    const getColor = () => {
        if (score >= 9) return 'bg-green-100 text-green-800';
        if (score >= 7) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getLabel = () => {
        if (score >= 9) return 'Promoter';
        if (score >= 7) return 'Passive';
        return 'Detractor';
    };

    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getColor()}`}>
            {score} - {getLabel()}
        </span>
    );
}
