// app/admin/feedback/page.tsx
import { getAllFeedback, getNPSStats } from '@/app/actions/feedback';
import FeedbackList from './FeedbackList';
import NPSStatsCard from './NPSStatsCard';
import FeedbackFilters from './FeedbackFilters';
import { MessageSquare, Star, ThumbsUp, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; status?: string }>;
}) {
    const resolvedParams = await searchParams;
    const [feedbackResult, npsResult] = await Promise.all([
        getAllFeedback({
            type: resolvedParams.type as any,
            status: resolvedParams.status as any,
        }),
        getNPSStats(),
    ]);

    const feedbacks = feedbackResult.success ? feedbackResult.data : [];
    const npsStats = npsResult.success ? npsResult.data : null;

    // Calculate stats
    const totalFeedback = feedbacks.length;
    const testimonials = feedbacks.filter((f: any) => f.type === 'testimonial').length;
    const approvedTestimonials = feedbacks.filter(
        (f: any) => f.type === 'testimonial' && f.status === 'approved'
    ).length;
    const pendingFeedback = feedbacks.filter((f: any) => f.status === 'submitted').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
                    <p className="text-gray-600 mt-1">Manage client feedback, testimonials, and surveys</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={<MessageSquare className="w-6 h-6" />}
                    label="Total Feedback"
                    value={totalFeedback}
                    color="blue"
                />
                <StatsCard
                    icon={<Star className="w-6 h-6" />}
                    label="Testimonials"
                    value={`${approvedTestimonials}/${testimonials}`}
                    color="yellow"
                />
                <StatsCard
                    icon={<ThumbsUp className="w-6 h-6" />}
                    label="NPS Score"
                    value={npsStats?.npsScore || 0}
                    color="green"
                />
                <StatsCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="Pending Review"
                    value={pendingFeedback}
                    color="orange"
                />
            </div>

            {/* NPS Statistics */}
            {npsStats && <NPSStatsCard stats={npsStats} />}

            {/* Filters */}
            <FeedbackFilters />

            {/* Feedback List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">All Feedback</h2>
                    <FeedbackList feedbacks={feedbacks} />
                </div>
            </div>
        </div>
    );
}

function StatsCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: 'blue' | 'yellow' | 'green' | 'orange';
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
