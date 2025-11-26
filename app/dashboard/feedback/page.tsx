// app/dashboard/feedback/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, CheckCircle, X, ThumbsUp, ThumbsDown, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserFeedback, submitFeedback } from '@/app/actions/feedback';
import { getProjects } from '@/app/actions/projects';
import { FeedbackType, FeedbackStatus } from '@/models/Feedback';

interface Project {
    _id: string;
    projectName: string;
    serviceType?: string;
}

interface Feedback {
    _id: string;
    type: FeedbackType;
    status: FeedbackStatus;
    projectId?: string;
    projectName?: string;
    overallRating?: number;
    ratings?: {
        communication?: number;
        quality?: number;
        timeliness?: number;
        professionalism?: number;
        valueForMoney?: number;
    };
    comment?: string;
    wouldRecommend?: boolean;
    testimonial?: string;
    npsScore?: number;
    createdAt: string;
    submittedAt?: string;
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
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        projectId: '',
        type: FeedbackType.PROJECT_SURVEY as FeedbackType,
        // Project Survey fields
        wouldRecommend: null as boolean | null,
        whatWorkedWell: '',
        whatNeedsImprovement: '',
        communicationRating: 0,
        deliveryRating: 0,
        qualityRating: 0,
        overallSatisfaction: 0,
        additionalComments: '',
        // Testimonial fields
        testimonial: '',
        isPublicTestimonial: false,
        // NPS Survey fields
        npsScore: undefined as number | undefined,
        // Bug Report fields
        title: '',
        bugDescription: '',
        stepsToReproduce: '',
        // Feature Request fields
        featureDescription: '',
        useCase: '',
        // General Feedback fields
        generalComment: '',
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
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Type-specific validation
        if (formData.type === FeedbackType.PROJECT_SURVEY ||
            formData.type === FeedbackType.MILESTONE_FEEDBACK ||
            formData.type === FeedbackType.TESTIMONIAL) {
            if (!formData.projectId) {
                setErrorMessage('Please select a project');
                return;
            }
        }

        if (formData.type === FeedbackType.PROJECT_SURVEY) {
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
        }

        if (formData.type === FeedbackType.NPS_SURVEY && formData.npsScore === undefined) {
            setErrorMessage('Please provide an NPS score');
            return;
        }

        if (formData.type === FeedbackType.TESTIMONIAL && !formData.testimonial.trim()) {
            setErrorMessage('Please write your testimonial');
            return;
        }

        if (formData.type === FeedbackType.BUG_REPORT) {
            if (!formData.title.trim() || !formData.bugDescription.trim()) {
                setErrorMessage('Please provide a bug title and description');
                return;
            }
        }

        if (formData.type === FeedbackType.FEATURE_REQUEST) {
            if (!formData.title.trim() || !formData.featureDescription.trim()) {
                setErrorMessage('Please provide a feature title and description');
                return;
            }
        }

        if (formData.type === FeedbackType.GENERAL_FEEDBACK && !formData.generalComment.trim()) {
            setErrorMessage('Please provide your feedback');
            return;
        }

        setSubmitting(true);
        try {
            // Build submission data based on feedback type
            const submissionData: any = {
                type: formData.type,
                projectId: formData.projectId || undefined,
            };

            // Add type-specific fields
            if (formData.type === FeedbackType.PROJECT_SURVEY) {
                submissionData.overallRating = formData.overallSatisfaction;
                submissionData.comment = `What worked well: ${formData.whatWorkedWell}\n\nNeeds improvement: ${formData.whatNeedsImprovement}${formData.additionalComments ? `\n\nAdditional: ${formData.additionalComments}` : ''}`;
                submissionData.wouldRecommend = formData.wouldRecommend ?? undefined;
                submissionData.ratings = {
                    communication: formData.communicationRating,
                    quality: formData.qualityRating,
                    timeliness: formData.deliveryRating,
                    professionalism: formData.overallSatisfaction,
                    valueForMoney: formData.overallSatisfaction,
                };
                submissionData.highlights = formData.whatWorkedWell;
                submissionData.improvements = formData.whatNeedsImprovement;
            } else if (formData.type === FeedbackType.NPS_SURVEY) {
                submissionData.npsScore = formData.npsScore;
                submissionData.comment = formData.additionalComments;
            } else if (formData.type === FeedbackType.TESTIMONIAL) {
                submissionData.testimonial = formData.testimonial;
                submissionData.comment = formData.testimonial;
            } else if (formData.type === FeedbackType.BUG_REPORT) {
                submissionData.title = formData.title;
                submissionData.comment = `**Bug Description:**\n${formData.bugDescription}${formData.stepsToReproduce ? `\n\n**Steps to Reproduce:**\n${formData.stepsToReproduce}` : ''}`;
            } else if (formData.type === FeedbackType.FEATURE_REQUEST) {
                submissionData.title = formData.title;
                submissionData.comment = `**Feature Description:**\n${formData.featureDescription}${formData.useCase ? `\n\n**Use Case:**\n${formData.useCase}` : ''}`;
            } else if (formData.type === FeedbackType.GENERAL_FEEDBACK) {
                submissionData.comment = formData.generalComment;
            }

            const result = await submitFeedback(submissionData);

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
            // Project Survey fields
            wouldRecommend: null,
            whatWorkedWell: '',
            whatNeedsImprovement: '',
            communicationRating: 0,
            deliveryRating: 0,
            qualityRating: 0,
            overallSatisfaction: 0,
            additionalComments: '',
            // Testimonial fields
            testimonial: '',
            isPublicTestimonial: false,
            // NPS Survey fields
            npsScore: undefined,
            // Bug Report fields
            title: '',
            bugDescription: '',
            stepsToReproduce: '',
            // Feature Request fields
            featureDescription: '',
            useCase: '',
            // General Feedback fields
            generalComment: '',
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
                        {/* Feedback Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as FeedbackType })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value={FeedbackType.PROJECT_SURVEY}>Project Survey</option>
                                <option value={FeedbackType.BUG_REPORT}>Bug Report</option>
                                <option value={FeedbackType.FEATURE_REQUEST}>Feature Request</option>
                                <option value={FeedbackType.TESTIMONIAL}>Testimonial</option>
                                <option value={FeedbackType.GENERAL_FEEDBACK}>General Feedback</option>
                                <option value={FeedbackType.NPS_SURVEY}>NPS Survey</option>
                            </select>
                        </div>

                        {/* Project Selection - Required for PROJECT_SURVEY and MILESTONE_FEEDBACK, Optional for others */}
                        {(formData.type === FeedbackType.PROJECT_SURVEY ||
                          formData.type === FeedbackType.MILESTONE_FEEDBACK ||
                          formData.type === FeedbackType.TESTIMONIAL) && (
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
                        )}

                        {/* Optional Project Selection for Bug Reports and Feature Requests */}
                        {(formData.type === FeedbackType.BUG_REPORT || formData.type === FeedbackType.FEATURE_REQUEST) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Related Project (Optional)
                                </label>
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">None</option>
                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>
                                            {project.projectName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* NPS Survey Fields */}
                        {formData.type === FeedbackType.NPS_SURVEY && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How likely are you to recommend us to a friend or colleague? *
                                </label>
                                <p className="text-sm text-gray-600 mb-3">0 = Not at all likely, 10 = Extremely likely</p>
                                <div className="flex gap-2 flex-wrap">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                        <button
                                            key={score}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, npsScore: score })}
                                            className={`w-12 h-12 rounded-lg border-2 transition-all font-semibold ${
                                                formData.npsScore === score
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Testimonial Fields */}
                        {formData.type === FeedbackType.TESTIMONIAL && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Testimonial *
                                    </label>
                                    <textarea
                                        value={formData.testimonial}
                                        onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                                        rows={6}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Share your experience working with us..."
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={formData.isPublicTestimonial}
                                        onChange={(e) => setFormData({ ...formData, isPublicTestimonial: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                                        I agree to have this testimonial displayed publicly on your website
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Bug Report Fields */}
                        {formData.type === FeedbackType.BUG_REPORT && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bug Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Brief description of the bug"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bug Description *
                                    </label>
                                    <textarea
                                        value={formData.bugDescription}
                                        onChange={(e) => setFormData({ ...formData, bugDescription: e.target.value })}
                                        rows={5}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe what's happening..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Steps to Reproduce
                                    </label>
                                    <textarea
                                        value={formData.stepsToReproduce}
                                        onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="1. Go to...\n2. Click on...\n3. See error..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Feature Request Fields */}
                        {formData.type === FeedbackType.FEATURE_REQUEST && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feature Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Brief name for the feature"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feature Description *
                                    </label>
                                    <textarea
                                        value={formData.featureDescription}
                                        onChange={(e) => setFormData({ ...formData, featureDescription: e.target.value })}
                                        rows={5}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe the feature you'd like to see..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Use Case / Why is this needed?
                                    </label>
                                    <textarea
                                        value={formData.useCase}
                                        onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="How would this help you?"
                                    />
                                </div>
                            </>
                        )}

                        {/* General Feedback Fields */}
                        {formData.type === FeedbackType.GENERAL_FEEDBACK && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Feedback *
                                </label>
                                <textarea
                                    value={formData.generalComment}
                                    onChange={(e) => setFormData({ ...formData, generalComment: e.target.value })}
                                    rows={6}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Share your thoughts with us..."
                                    required
                                />
                            </div>
                        )}

                        {/* Project Survey Fields */}
                        {formData.type === FeedbackType.PROJECT_SURVEY && (
                            <>
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
                            </>
                        )}

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
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {feedback.projectName || 'General Feedback'}
                                            </h3>
                                            <TypeBadge type={feedback.type} />
                                            <StatusBadge status={feedback.status} />
                                        </div>
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
                                        className="p-2 hover:bg-gray-100 rounded-lg transition ml-4"
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
                                    {feedback.overallRating && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                                            <StarRating rating={feedback.overallRating} />
                                            <span className="text-sm text-gray-600">({feedback.overallRating}/5)</span>
                                        </div>
                                    )}
                                    {feedback.wouldRecommend !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">Would Recommend:</span>
                                            {feedback.wouldRecommend ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span className="text-sm">Yes</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <ThumbsDown className="w-4 h-4" />
                                                    <span className="text-sm">No</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {feedback.comment && !expandedId && (
                                        <p className="text-gray-700 line-clamp-2 text-sm">{feedback.comment}</p>
                                    )}
                                </div>

                                {/* Expanded Details */}
                                {expandedId === feedback._id && (
                                    <div className="mt-4 pt-4 border-t space-y-4">
                                        {/* Detailed Ratings */}
                                        {feedback.ratings && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Detailed Ratings</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                                                    {Object.entries(feedback.ratings).map(([key, value]) => (
                                                        value !== undefined && value > 0 && (
                                                            <div key={key}>
                                                                <span className="text-sm text-gray-600 capitalize block mb-1">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <StarRating rating={value} />
                                                                    <span className="text-sm text-gray-600">({value}/5)</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Full Comment */}
                                        {feedback.comment && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Feedback Details</h4>
                                                <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                                                    {feedback.comment}
                                                </p>
                                            </div>
                                        )}

                                        {/* Admin Response */}
                                        {feedback.adminResponse && (
                                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                <div className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-blue-900 mb-2">
                                                            Admin Response from {feedback.adminResponse.userName}
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

// Helper Components
function TypeBadge({ type }: { type: FeedbackType }) {
    const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
        [FeedbackType.PROJECT_SURVEY]: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Project Survey' },
        [FeedbackType.MILESTONE_FEEDBACK]: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Milestone' },
        [FeedbackType.NPS_SURVEY]: { bg: 'bg-green-100', text: 'text-green-800', label: 'NPS' },
        [FeedbackType.TESTIMONIAL]: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Testimonial' },
        [FeedbackType.GENERAL_FEEDBACK]: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'General' },
        [FeedbackType.BUG_REPORT]: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bug Report' },
        [FeedbackType.FEATURE_REQUEST]: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Feature' },
    };

    const config = typeConfig[type] || typeConfig[FeedbackType.GENERAL_FEEDBACK];

    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
    const statusConfig: Record<string, { bg: string; text: string }> = {
        [FeedbackStatus.PENDING]: { bg: 'bg-gray-100', text: 'text-gray-800' },
        [FeedbackStatus.SUBMITTED]: { bg: 'bg-blue-100', text: 'text-blue-800' },
        [FeedbackStatus.REVIEWED]: { bg: 'bg-purple-100', text: 'text-purple-800' },
        [FeedbackStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
        [FeedbackStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const config = statusConfig[status] || statusConfig[FeedbackStatus.PENDING];

    return (
        <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${config.bg} ${config.text}`}>
            {status.toLowerCase().replace('_', ' ')}
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
