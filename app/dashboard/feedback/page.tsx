// app/dashboard/feedback/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getUserFeedback, submitFeedback } from '@/app/actions/feedback';
import { getProjects } from '@/app/actions/projects';
import { FeedbackType } from '@/models/Feedback';

interface Project {
    _id: string;
    projectName: string;
    serviceType?: string;
}

interface Feedback {
    _id: string;
    type: FeedbackType;
    projectId?: string;
    projectName?: string;
    overallRating?: number;
    comment?: string;
    createdAt: string;
    adminResponse?: {
        userId: string;
        userName: string;
        response: string;
        respondedAt: string;
    };
}

export default function FeedbackPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        projectId: '',
        type: FeedbackType.PROJECT_SURVEY as FeedbackType,
        wouldRecommend: null as boolean | null,
        whatWorkedWell: '',
        whatNeedsImprovement: '',
        communicationRating: 0, // 1-5
        deliveryRating: 0, // 1-5
        qualityRating: 0, // 1-5
        overallSatisfaction: 0, // 1-5
        additionalComments: '',
        testimonial: '',
        isPublicTestimonial: false,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.projectId) {
            setErrorMessage('Please select a project');
            return;
        }

        if (formData.wouldRecommend === null) {
            setErrorMessage('Please indicate if you would recommend our services');
            return;
        }

        if (!formData.whatWorkedWell.trim() || !formData.whatNeedsImprovement.trim()) {
            setErrorMessage('Please fill in both "What worked well" and "Areas for improvement"');
            return;
        }

        if (formData.overallSatisfaction === 0) {
            setErrorMessage('Please provide an overall satisfaction rating');
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitFeedback({
                type: formData.type,
                projectId: formData.projectId,
                overallRating: formData.overallSatisfaction,
                comment: `What worked well: ${formData.whatWorkedWell}\n\nNeeds improvement: ${formData.whatNeedsImprovement}\n\nAdditional: ${formData.additionalComments}`,
                wouldRecommend: formData.wouldRecommend ?? undefined,
                ratings: {
                    communication: formData.communicationRating,
                    quality: formData.qualityRating,
                    timeliness: formData.deliveryRating,
                    professionalism: formData.overallSatisfaction,
                    valueForMoney: formData.overallSatisfaction,
                },
            });

            if (result.success) {
                setSuccessMessage('Thank you! Your feedback has been submitted successfully.');
                setShowForm(false);
                resetForm();
                loadData();
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
            type: FeedbackType.PROJECT_SURVEY,
            wouldRecommend: null,
            whatWorkedWell: '',
            whatNeedsImprovement: '',
            communicationRating: 0,
            deliveryRating: 0,
            qualityRating: 0,
            overallSatisfaction: 0,
            additionalComments: '',
            testimonial: '',
            isPublicTestimonial: false,
        });
    };

    const RatingSelector = ({
        value,
        onChange,
        label,
    }: {
        value: number;
        onChange: (val: number) => void;
        label: string;
    }) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => onChange(num)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                            value === num
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                                : 'border-gray-300 hover:border-gray-400 text-gray-600'
                        }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500">1 = Poor, 5 = Excellent</p>
        </div>
    );

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
                    <div>
                        <h3 className="font-semibold text-green-900">Success!</h3>
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-600 hover:text-green-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Share Your Feedback</h1>
                    <p className="text-gray-600 mt-2">Help us improve with your honest feedback</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Give Feedback
                    </button>
                )}
            </div>

            {/* Feedback Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">New Feedback</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{errorMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Project Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Project *
                            </label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Choose a project...</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Would Recommend */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Would you recommend our services? *
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, wouldRecommend: true })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border-2 transition-all ${
                                        formData.wouldRecommend === true
                                            ? 'border-green-600 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <ThumbsUp className="w-5 h-5" />
                                    <span className="font-semibold">Yes, I would</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, wouldRecommend: false })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border-2 transition-all ${
                                        formData.wouldRecommend === false
                                            ? 'border-red-600 bg-red-50 text-red-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <ThumbsDown className="w-5 h-5" />
                                    <span className="font-semibold">No, I wouldn't</span>
                                </button>
                            </div>
                        </div>

                        {/* What Worked Well */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What worked well? *
                            </label>
                            <textarea
                                value={formData.whatWorkedWell}
                                onChange={(e) => setFormData({ ...formData, whatWorkedWell: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Tell us what you were happy with..."
                                required
                            />
                        </div>

                        {/* Areas for Improvement */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What could we improve? *
                            </label>
                            <textarea
                                value={formData.whatNeedsImprovement}
                                onChange={(e) => setFormData({ ...formData, whatNeedsImprovement: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Share your suggestions for improvement..."
                                required
                            />
                        </div>

                        {/* Ratings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                            <RatingSelector
                                value={formData.communicationRating}
                                onChange={(val) => setFormData({ ...formData, communicationRating: val })}
                                label="Communication"
                            />
                            <RatingSelector
                                value={formData.deliveryRating}
                                onChange={(val) => setFormData({ ...formData, deliveryRating: val })}
                                label="Delivery & Timeline"
                            />
                            <RatingSelector
                                value={formData.qualityRating}
                                onChange={(val) => setFormData({ ...formData, qualityRating: val })}
                                label="Quality of Work"
                            />
                            <RatingSelector
                                value={formData.overallSatisfaction}
                                onChange={(val) => setFormData({ ...formData, overallSatisfaction: val })}
                                label="Overall Satisfaction *"
                            />
                        </div>

                        {/* Additional Comments */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Comments (Optional)
                            </label>
                            <textarea
                                value={formData.additionalComments}
                                onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Anything else you'd like to share?"
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <h2 className="text-xl font-semibold text-gray-900">Your Previous Feedback</h2>
                    <p className="text-sm text-gray-600 mt-1">Track all feedback you've shared</p>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                        <p className="text-gray-600 mb-6">Share your first feedback to help us improve</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Give Feedback
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {feedbacks.map((feedback) => (
                            <div key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {feedback.projectName || 'General Feedback'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    {feedback.overallRating && (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {feedback.overallRating}/5
                                            </div>
                                            <div className="text-xs text-gray-500">Overall</div>
                                        </div>
                                    )}
                                </div>

                                {feedback.comment && (
                                    <p className="text-gray-700 mb-4 whitespace-pre-line">{feedback.comment}</p>
                                )}

                                {feedback.adminResponse && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900 mb-1">Admin Response</p>
                                                <p className="text-sm text-blue-800">{feedback.adminResponse.response}</p>
                                                <p className="text-xs text-blue-600 mt-2">
                                                    {feedback.adminResponse.userName} •{' '}
                                                    {new Date(feedback.adminResponse.respondedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
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
