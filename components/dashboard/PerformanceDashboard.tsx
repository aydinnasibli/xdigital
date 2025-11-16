// components/dashboard/PerformanceDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPerformanceMetrics } from '@/app/actions/monitoring';
import { PerformanceService } from '@/lib/services/performance.service';

interface PerformanceDashboardProps {
    projectId: string;
}

export default function PerformanceDashboard({ projectId }: PerformanceDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPerformanceData();
    }, [projectId]);

    const loadPerformanceData = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await getPerformanceMetrics(projectId);
            if (result.success) {
                setPerformanceData(result.data);
            } else {
                setError(result.error || 'Failed to load performance data');
            }
        } catch (err) {
            setError('An error occurred while loading performance data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-lg border text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Analyzing performance...</p>
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

    if (!performanceData) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No performance data available</p>
            </div>
        );
    }

    const getRatingColor = (rating: string) => {
        if (rating === 'good') return 'text-green-600 bg-green-50 border-green-200';
        if (rating === 'needs-improvement') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Performance Score</h2>
                        <div className={`text-6xl font-bold ${getScoreColor(performanceData.overall)}`}>
                            {performanceData.overall}
                            <span className="text-2xl text-gray-600">/100</span>
                        </div>
                    </div>
                    <div className="text-8xl">⚡</div>
                </div>
            </div>

            {/* Core Web Vitals */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${getRatingColor(performanceData.coreWebVitals.lcp.rating)}`}>
                        <div className="text-sm font-medium mb-1">Largest Contentful Paint (LCP)</div>
                        <div className="text-3xl font-bold mb-1">{performanceData.coreWebVitals.lcp.value}ms</div>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${getRatingColor(performanceData.coreWebVitals.lcp.rating)}`}>
                                {performanceData.coreWebVitals.lcp.rating.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-600">{'<2.5s is good'}</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${getRatingColor(performanceData.coreWebVitals.fid.rating)}`}>
                        <div className="text-sm font-medium mb-1">First Input Delay (FID)</div>
                        <div className="text-3xl font-bold mb-1">{performanceData.coreWebVitals.fid.value}ms</div>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${getRatingColor(performanceData.coreWebVitals.fid.rating)}`}>
                                {performanceData.coreWebVitals.fid.rating.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-600">{'<100ms is good'}</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${getRatingColor(performanceData.coreWebVitals.cls.rating)}`}>
                        <div className="text-sm font-medium mb-1">Cumulative Layout Shift (CLS)</div>
                        <div className="text-3xl font-bold mb-1">{performanceData.coreWebVitals.cls.value}</div>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${getRatingColor(performanceData.coreWebVitals.cls.rating)}`}>
                                {performanceData.coreWebVitals.cls.rating.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-600">{'<0.1 is good'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lighthouse Scores */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Lighthouse Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(performanceData.lighthouse).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(value)}`}>{value}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className={`h-2 rounded-full ${value >= 90 ? 'bg-green-500' : value >= 75 ? 'bg-blue-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Page Speed Metrics */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Page Speed Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-700 mb-1">Load Time</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {performanceData.pageSpeed.loadTime.toFixed(2)}s
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-gray-700 mb-1">Time to Interactive</div>
                        <div className="text-3xl font-bold text-green-600">
                            {performanceData.pageSpeed.timeToInteractive.toFixed(2)}s
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-sm text-gray-700 mb-1">First Contentful Paint</div>
                        <div className="text-3xl font-bold text-purple-600">
                            {performanceData.pageSpeed.firstContentfulPaint.toFixed(2)}s
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Breakdown */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Resource Breakdown</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Total Size</span>
                            <span className="font-semibold">
                                {PerformanceService.formatBytes(performanceData.resources.totalSize)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Images</span>
                            <span className="font-semibold">
                                {PerformanceService.formatBytes(performanceData.resources.imageSize)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                    width: `${(performanceData.resources.imageSize / performanceData.resources.totalSize) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">JavaScript</span>
                            <span className="font-semibold">
                                {PerformanceService.formatBytes(performanceData.resources.scriptSize)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{
                                    width: `${(performanceData.resources.scriptSize / performanceData.resources.totalSize) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">CSS</span>
                            <span className="font-semibold">
                                {PerformanceService.formatBytes(performanceData.resources.cssSize)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                    width: `${(performanceData.resources.cssSize / performanceData.resources.totalSize) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Requests</span>
                            <span className="font-semibold">{performanceData.resources.requests}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {performanceData.recommendations && performanceData.recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-semibold mb-4">💡 Performance Recommendations</h3>
                    <ul className="space-y-2">
                        {performanceData.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-purple-600 mt-1">⚡</span>
                                <span className="text-gray-700">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
                <button
                    onClick={loadPerformanceData}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    Refresh Performance Analysis
                </button>
            </div>
        </div>
    );
}
