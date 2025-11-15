// app/dashboard/feedback/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getUserFeedback } from '@/app/actions/feedback';
import Link from 'next/link';

export default async function FeedbackPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const feedbackResult = await getUserFeedback();
    const feedbacks = feedbackResult.success ? feedbackResult.data : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Feedback & Reviews</h1>
                <p className="text-gray-600 mt-2">View your feedback and project reviews</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">📝 We value your feedback!</h3>
                <p className="text-blue-800 text-sm">
                    After each milestone or project completion, you'll receive a feedback form to share your experience.
                    Your feedback helps us improve our services and provide better results.
                </p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Your Feedback History</h2>
                </div>
                {feedbacks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">⭐</div>
                        <p>No feedback submitted yet</p>
                        <p className="text-sm mt-2">You'll be able to provide feedback after project milestones</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {feedbacks.map((feedback: any) => (
                            <div key={feedback._id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-gray-900 capitalize">{feedback.type.replace('_', ' ')}</h3>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                                                {feedback.status}
                                            </span>
                                        </div>
                                        {feedback.title && (
                                            <div className="text-gray-600 mt-1">{feedback.title}</div>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(feedback.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {feedback.npsScore !== undefined && (
                                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-sm text-gray-600">NPS Score:</div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(11)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                                        i === feedback.npsScore
                                                            ? 'bg-blue-600 text-white font-bold'
                                                            : 'bg-gray-200 text-gray-500'
                                                    }`}
                                                >
                                                    {i}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {feedback.overallRating && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="text-sm text-gray-600">Overall Rating:</div>
                                        <div className="text-yellow-500 text-lg">
                                            {'⭐'.repeat(feedback.overallRating)}
                                        </div>
                                    </div>
                                )}

                                {feedback.ratings && (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                                        {Object.entries(feedback.ratings).map(([key, value]: [string, any]) => (
                                            <div key={key} className="text-center p-2 bg-gray-50 rounded">
                                                <div className="text-xs text-gray-600 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                                <div className="text-yellow-500">{'⭐'.repeat(value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {feedback.comment && (
                                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-900 mb-1">Your Comments:</div>
                                        <div className="text-sm text-gray-700">{feedback.comment}</div>
                                    </div>
                                )}

                                {feedback.testimonial && (
                                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-sm font-medium text-blue-900 mb-1">Testimonial:</div>
                                        <div className="text-sm text-blue-800 italic">"{feedback.testimonial}"</div>
                                        {feedback.isPublicTestimonial && (
                                            <div className="text-xs text-green-600 mt-2">✓ Published on website</div>
                                        )}
                                    </div>
                                )}

                                {feedback.adminResponse && (
                                    <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Admin Response:</div>
                                        <div className="text-sm text-green-800">{feedback.adminResponse.response}</div>
                                        <div className="text-xs text-green-600 mt-2">
                                            {feedback.adminResponse.userName} • {new Date(feedback.adminResponse.respondedAt).toLocaleString()}
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
