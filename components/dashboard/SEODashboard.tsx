// components/dashboard/SEODashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSEOAnalysis } from '@/app/actions/monitoring';

interface SEODashboardProps {
    projectId: string;
}

export default function SEODashboard({ projectId }: SEODashboardProps) {
    const [loading, setLoading] = useState(true);
    const [seoData, setSeoData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSEOData();
    }, [projectId]);

    const loadSEOData = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await getSEOAnalysis(projectId);
            if (result.success) {
                setSeoData(result.data);
            } else {
                setError(result.error || 'Failed to load SEO data');
            }
        } catch (err) {
            setError('An error occurred while loading SEO data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-lg border text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Analyzing SEO...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <p className="text-yellow-800">{error}</p>
            </div>
        );
    }

    if (!seoData) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No SEO data available</p>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50';
        if (score >= 75) return 'text-blue-600 bg-blue-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">SEO Score</h2>
                        <div className={`text-6xl font-bold ${getScoreColor(seoData.overall).split(' ')[0]}`}>
                            {seoData.overall}
                            <span className="text-2xl text-gray-600">/100</span>
                        </div>
                        <p className="text-lg mt-2 text-gray-700">{getScoreLabel(seoData.overall)}</p>
                    </div>
                    <div className="text-8xl">🔍</div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(seoData.breakdown).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(value).split(' ')[0]}`}>
                            {value}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className={`h-2 rounded-full ${value >= 75 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Issues */}
            {seoData.issues && seoData.issues.length > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-semibold mb-4">Issues Found</h3>
                    <div className="space-y-3">
                        {seoData.issues.map((issue: any, index: number) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-l-4 ${
                                    issue.severity === 'critical'
                                        ? 'bg-red-50 border-red-500'
                                        : issue.severity === 'warning'
                                        ? 'bg-yellow-50 border-yellow-500'
                                        : 'bg-blue-50 border-blue-500'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${
                                                    issue.severity === 'critical'
                                                        ? 'bg-red-100 text-red-700'
                                                        : issue.severity === 'warning'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {issue.severity}
                                            </span>
                                            <span className="text-sm text-gray-600">{issue.category}</span>
                                        </div>
                                        <p className="text-gray-900">{issue.message}</p>
                                        {issue.element && (
                                            <code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block text-gray-700">
                                                {issue.element}
                                            </code>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {seoData.recommendations && seoData.recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-semibold mb-4">💡 Recommendations</h3>
                    <ul className="space-y-2">
                        {seoData.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span className="text-gray-700">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
                <button
                    onClick={loadSEOData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Refresh SEO Analysis
                </button>
            </div>
        </div>
    );
}
