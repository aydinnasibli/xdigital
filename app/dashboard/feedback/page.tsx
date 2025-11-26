// app/dashboard/feedback/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, CheckCircle, X, Star, Bug, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserFeedback, submitFeedback } from '@/app/actions/feedback';
import { getProjects } from '@/app/actions/projects';
import { FeedbackType, FeedbackStatus } from '@/models/Feedback';

interface Project {
    _id: string;
    projectName: string;
}

interface Feedback {
    _id: string;
    type: FeedbackType;
    status: FeedbackStatus;
    projectId?: string;
    projectName?: string;
    title?: string;
    comment?: string;
    overallRating?: number;
    createdAt: string;
    adminResponse?: {
        userName: string;
        response: string;
        respondedAt: string;
    };
}

type FeedbackFormType = 'general' | 'bug' | 'feature';

export default function FeedbackPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [selectedType, setSelectedType] = useState<FeedbackFormType>('general');
    const [formData, setFormData] = useState({
        projectId: '',
        title: '',
        message: '',
        rating: 0,
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [projectsResult, feedbackResult] = await Promise.all([
                getProjects(),
                getUserFeedback(),
            ]);

            if (projectsResult.success) {
                setProjects(projectsResult.data || []);
            }
            if (feedbackResult.success) {
                setFeedbacks(feedbackResult.data || []);
            }
        } catch (error) {
            setErrorMessage('Failed to load data');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.message.trim()) {
            setErrorMessage('Please provide your feedback');
            return;
        }

        if (selectedType !== 'general' && !formData.title.trim()) {
            setErrorMessage('Please provide a title');
            return;
        }

        setSubmitting(true);
        try {
            const feedbackType =
                selectedType === 'bug' ? FeedbackType.BUG_REPORT :
                selectedType === 'feature' ? FeedbackType.FEATURE_REQUEST :
                FeedbackType.GENERAL_FEEDBACK;

            const result = await submitFeedback({
                type: feedbackType,
                projectId: formData.projectId || undefined,
                title: formData.title || undefined,
                comment: formData.message,
                overallRating: formData.rating > 0 ? formData.rating : undefined,
            });

            if (result.success) {
                setSuccessMessage('Thank you! Your feedback has been submitted successfully.');
                setShowForm(false);
                resetForm();
                void loadData();
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setErrorMessage(result.error || 'Failed to submit feedback');
            }
        } catch (error) {
            setErrorMessage('An error occurred while submitting feedback');
        }
        setSubmitting(false);
    };

    const resetForm = () => {
        setFormData({
            projectId: '',
            title: '',
            message: '',
            rating: 0,
        });
        setSelectedType('general');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-green-900">Success!</h3>
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
                <p className="text-gray-600 mt-2">Share your thoughts, report issues, or suggest improvements</p>
            </div>

            {/* Quick Action Cards */}
            {!showForm && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => { setSelectedType('general'); setShowForm(true); }}
                        className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                    >
                        <MessageSquare className="w-10 h-10 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">General Feedback</h3>
                        <p className="text-sm text-gray-600">Share your experience or suggestions</p>
                    </button>

                    <button
                        onClick={() => { setSelectedType('bug'); setShowForm(true); }}
                        className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:shadow-lg transition-all text-left group"
                    >
                        <Bug className="w-10 h-10 text-red-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Report a Bug</h3>
                        <p className="text-sm text-gray-600">Let us know about any issues</p>
                    </button>

                    <button
                        onClick={() => { setSelectedType('feature'); setShowForm(true); }}
                        className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left group"
                    >
                        <Lightbulb className="w-10 h-10 text-green-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Request a Feature</h3>
                        <p className="text-sm text-gray-600">Suggest new features or improvements</p>
                    </button>
                </div>
            )}

            {/* Feedback Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedType === 'bug' ? 'Report a Bug' :
                                 selectedType === 'feature' ? 'Request a Feature' :
                                 'General Feedback'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {selectedType === 'bug' ? 'Help us fix issues by providing details' :
                                 selectedType === 'feature' ? 'Tell us what you\'d like to see' :
                                 'We value your feedback'}
                            </p>
                        </div>
                        <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{errorMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Project Selection (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Related Project (Optional)
                            </label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">No specific project</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title (Required for bug/feature) */}
                        {selectedType !== 'general' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {selectedType === 'bug' ? 'Bug Title' : 'Feature Title'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={selectedType === 'bug' ? 'Brief description of the issue' : 'Brief name for the feature'}
                                    required
                                />
                            </div>
                        )}

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {selectedType === 'bug' ? 'Describe the issue' :
                                 selectedType === 'feature' ? 'Describe the feature' :
                                 'Your feedback'} *
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder={selectedType === 'bug' ? 'What happened? Include steps to reproduce if possible...' :
                                            selectedType === 'feature' ? 'What would you like to see? How would it help you?' :
                                            'Share your thoughts with us...'}
                                required
                            />
                        </div>

                        {/* Rating (Only for general feedback) */}
                        {selectedType === 'general' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Overall Rating (Optional)
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating })}
                                            className={`p-2 rounded-lg transition-all ${
                                                formData.rating >= rating
                                                    ? 'text-yellow-500'
                                                    : 'text-gray-300 hover:text-gray-400'
                                            }`}
                                        >
                                            <Star className={`w-8 h-8 ${formData.rating >= rating ? 'fill-yellow-500' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Feedback
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Previous Feedback */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Your Feedback History</h2>
                    <p className="text-sm text-gray-600 mt-1">Track your submissions and responses</p>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                        <p className="text-gray-600">Share your first feedback to help us improve</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {feedbacks.map((feedback) => (
                            <div key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <TypeBadge type={feedback.type} />
                                            <StatusBadge status={feedback.status} />
                                        </div>
                                        {feedback.title && (
                                            <h3 className="font-semibold text-gray-900 mb-1">{feedback.title}</h3>
                                        )}
                                        {feedback.projectName && (
                                            <p className="text-sm text-gray-600 mb-2">Project: {feedback.projectName}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
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

                                {expandedId === feedback._id && (
                                    <div className="mt-4 pt-4 border-t space-y-4">
                                        {feedback.comment && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Details</h4>
                                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                                                    {feedback.comment}
                                                </p>
                                            </div>
                                        )}

                                        {feedback.overallRating && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                <StarRating rating={feedback.overallRating} />
                                            </div>
                                        )}

                                        {feedback.adminResponse && (
                                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                <div className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-blue-900 mb-2">
                                                            Response from {feedback.adminResponse.userName}
                                                        </p>
                                                        <p className="text-sm text-blue-800 mb-2">
                                                            {feedback.adminResponse.response}
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            {new Date(feedback.adminResponse.respondedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TypeBadge({ type }: { type: FeedbackType }) {
    const config: Record<string, { bg: string; text: string; label: string; icon: typeof Bug }> = {
        bug_report: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bug Report', icon: Bug },
        feature_request: { bg: 'bg-green-100', text: 'text-green-800', label: 'Feature Request', icon: Lightbulb },
        general_feedback: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'General Feedback', icon: MessageSquare },
    };

    const item = config[type] || config.general_feedback;
    const Icon = item.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${item.bg} ${item.text}`}>
            <Icon className="w-3.5 h-3.5" />
            {item.label}
        </span>
    );
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
        submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
        reviewed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Reviewed' },
        approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
    };

    const item = config[status] || config.pending;

    return (
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.bg} ${item.text}`}>
            {item.label}
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
