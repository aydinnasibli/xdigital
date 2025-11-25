// app/dashboard/feedback/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserFeedback, submitFeedback } from '@/app/actions/feedback';
import { getProjects } from '@/app/actions/projects';
import { toast } from 'sonner';

export default function FeedbackPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        projectId: '',
        type: 'general' as 'general' | 'project_completion' | 'milestone_feedback',
        overallRating: 0,
        ratings: {
            communication: 0,
            quality: 0,
            timeliness: 0,
            professionalism: 0,
            valueForMoney: 0,
        },
        comment: '',
        suggestions: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
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
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.projectId) {
            toast.error('Please select a project');
            return;
        }

        if (formData.overallRating === 0) {
            toast.error('Please provide an overall rating');
            return;
        }

        if (!formData.comment.trim()) {
            toast.error('Please add your comments');
            return;
        }

        setSubmitting(true);
        const result = await submitFeedback(formData);

        if (result.success) {
            toast.success('Thank you! Your feedback has been submitted.');
            setShowForm(false);
            setFormData({
                projectId: '',
                type: 'general',
                overallRating: 0,
                ratings: {
                    communication: 0,
                    quality: 0,
                    timeliness: 0,
                    professionalism: 0,
                    valueForMoney: 0,
                },
                comment: '',
                suggestions: '',
            });
            loadData();
        } else {
            toast.error(result.error || 'Failed to submit feedback');
        }
        setSubmitting(false);
    };

    const RatingStars = ({ rating, onRate, label }: { rating: number; onRate: (rating: number) => void; label: string }) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRate(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-8 h-8 ${
                                star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Share Your Feedback</h1>
                    <p className="text-gray-600 mt-2">Help us improve by sharing your experience</p>
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
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <AlertCircle className="w-6 h-6" />
                        </button>
                    </div>

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

                        {/* Overall Rating */}
                        <div>
                            <RatingStars
                                rating={formData.overallRating}
                                onRate={(rating) => setFormData({ ...formData, overallRating: rating })}
                                label="Overall Experience *"
                            />
                        </div>

                        {/* Detailed Ratings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                            <RatingStars
                                rating={formData.ratings.communication}
                                onRate={(rating) =>
                                    setFormData({
                                        ...formData,
                                        ratings: { ...formData.ratings, communication: rating },
                                    })
                                }
                                label="Communication"
                            />
                            <RatingStars
                                rating={formData.ratings.quality}
                                onRate={(rating) =>
                                    setFormData({
                                        ...formData,
                                        ratings: { ...formData.ratings, quality: rating },
                                    })
                                }
                                label="Work Quality"
                            />
                            <RatingStars
                                rating={formData.ratings.timeliness}
                                onRate={(rating) =>
                                    setFormData({
                                        ...formData,
                                        ratings: { ...formData.ratings, timeliness: rating },
                                    })
                                }
                                label="Timeliness"
                            />
                            <RatingStars
                                rating={formData.ratings.professionalism}
                                onRate={(rating) =>
                                    setFormData({
                                        ...formData,
                                        ratings: { ...formData.ratings, professionalism: rating },
                                    })
                                }
                                label="Professionalism"
                            />
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Feedback *
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Tell us about your experience..."
                                required
                            />
                        </div>

                        {/* Suggestions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Suggestions for Improvement (Optional)
                            </label>
                            <textarea
                                value={formData.suggestions}
                                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="How can we improve?"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
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
                    <p className="text-sm text-gray-600 mt-1">Track all the feedback you've shared</p>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                        <p className="text-gray-600 mb-6">
                            Share your first feedback to help us improve
                        </p>
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
                        {feedbacks.map((feedback: any) => (
                            <div key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-4">
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
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${
                                                    i < (feedback.overallRating || 0)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {feedback.comment && (
                                    <p className="text-gray-700 mb-4">{feedback.comment}</p>
                                )}

                                {feedback.ratings && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                        {Object.entries(feedback.ratings).map(([key, value]: [string, any]) => (
                                            <div key={key} className="text-center">
                                                <div className="text-xs text-gray-600 capitalize mb-1">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </div>
                                                <div className="flex items-center justify-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${
                                                                i < value
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {feedback.adminResponse && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900 mb-1">
                                                    Admin Response
                                                </p>
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
