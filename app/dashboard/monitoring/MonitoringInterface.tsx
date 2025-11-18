// app/dashboard/monitoring/MonitoringInterface.tsx
'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Download, RefreshCw } from 'lucide-react';
import {
    getProjectAnalytics,
    getSEOAnalysis,
    getPerformanceMetrics,
    getDashboardSummary,
    generatePDFReport,
} from '@/app/actions/monitoring';
import { toast } from 'sonner';

interface Project {
    _id: string;
    projectName: string;
    deploymentUrl?: string;
    googleAnalyticsPropertyId?: string;
}

export default function MonitoringInterface({ projects }: { projects: Project[] }) {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [seoData, setSeoData] = useState<any>(null);
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'analytics' | 'seo' | 'performance'>('summary');

    const selectedProject = projects.find(p => p._id === selectedProjectId);

    const loadDashboardSummary = async () => {
        if (!selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setLoading(true);
        const result = await getDashboardSummary(selectedProjectId);
        if (result.success) {
            setDashboardData(result.data);
            setActiveTab('summary');
        } else {
            toast.error(result.error || 'Failed to load dashboard summary');
        }
        setLoading(false);
    };

    const loadAnalytics = async () => {
        if (!selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setLoading(true);
        const result = await getProjectAnalytics(selectedProjectId);
        if (result.success) {
            setAnalyticsData(result.data);
            setActiveTab('analytics');
        } else {
            toast.error(result.error || 'Failed to load analytics');
        }
        setLoading(false);
    };

    const loadSEO = async () => {
        if (!selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setLoading(true);
        const result = await getSEOAnalysis(selectedProjectId);
        if (result.success) {
            setSeoData(result.data);
            setActiveTab('seo');
        } else {
            toast.error(result.error || 'Failed to load SEO analysis');
        }
        setLoading(false);
    };

    const loadPerformance = async () => {
        if (!selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setLoading(true);
        const result = await getPerformanceMetrics(selectedProjectId);
        if (result.success) {
            setPerformanceData(result.data);
            setActiveTab('performance');
        } else {
            toast.error(result.error || 'Failed to load performance metrics');
        }
        setLoading(false);
    };

    const handleGeneratePDF = async () => {
        if (!selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setLoading(true);
        const result = await generatePDFReport(selectedProjectId);
        if (result.success) {
            // Create a blob and download
            const blob = new Blob([result.data.html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.data.filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report generated successfully');
        } else {
            toast.error(result.error || 'Failed to generate report');
        }
        setLoading(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className="space-y-6">
            {/* Project Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Project
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                            <option value="">Choose a project...</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.projectName}
                                    {!project.deploymentUrl && ' (Not deployed)'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={loadDashboardSummary}
                        disabled={!selectedProjectId || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Load Data
                    </button>
                </div>

                {selectedProject && !selectedProject.deploymentUrl && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">Project not deployed</p>
                            <p>Monitoring features require a live website URL.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            {(dashboardData || analyticsData || seoData || performanceData) && (
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'summary'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Summary
                            </button>
                            <button
                                onClick={loadAnalytics}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'analytics'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={loadSEO}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'seo'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                SEO
                            </button>
                            <button
                                onClick={loadPerformance}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'performance'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Performance
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {loading && (
                            <div className="py-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading data...</p>
                            </div>
                        )}

                        {/* Summary Tab */}
                        {!loading && activeTab === 'summary' && dashboardData && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Dashboard Summary</h2>
                                    <button
                                        onClick={handleGeneratePDF}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4" />
                                        Generate PDF Report
                                    </button>
                                </div>

                                {!dashboardData.isDeployed ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>This project is not deployed yet.</p>
                                        <p className="text-sm mt-1">Deploy your project to start monitoring.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Analytics Summary */}
                                            {dashboardData.analytics && (
                                                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                                    <h3 className="font-semibold text-blue-900 mb-3">Analytics</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">Page Views</span>
                                                            <span className="font-bold text-blue-900">
                                                                {dashboardData.analytics.pageViews || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">Visitors</span>
                                                            <span className="font-bold text-blue-900">
                                                                {dashboardData.analytics.visitors || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-700">Sessions</span>
                                                            <span className="font-bold text-blue-900">
                                                                {dashboardData.analytics.sessions || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SEO Summary */}
                                            {dashboardData.seo && (
                                                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                                    <h3 className="font-semibold text-green-900 mb-3">SEO Health</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-green-700">Score</span>
                                                            <span className={`text-2xl font-bold ${getScoreColor(dashboardData.seo.score || 0)}`}>
                                                                {dashboardData.seo.score || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-green-700">Status</span>
                                                            <span className="font-bold text-green-900">
                                                                {dashboardData.seo.status || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Performance Summary */}
                                            {dashboardData.performance && (
                                                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                                                    <h3 className="font-semibold text-purple-900 mb-3">Performance</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-purple-700">Score</span>
                                                            <span className={`text-2xl font-bold ${getScoreColor(dashboardData.performance.score || 0)}`}>
                                                                {dashboardData.performance.score || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-purple-700">Status</span>
                                                            <span className="font-bold text-purple-900">
                                                                {dashboardData.performance.status || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700">
                                            <p className="font-medium mb-1">Website URL:</p>
                                            <a
                                                href={dashboardData.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {dashboardData.websiteUrl}
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {!loading && activeTab === 'analytics' && analyticsData && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Google Analytics</h2>
                                {analyticsData.configured ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Page Views</p>
                                                <p className="text-2xl font-bold text-gray-900">{analyticsData.pageViews || 0}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Visitors</p>
                                                <p className="text-2xl font-bold text-gray-900">{analyticsData.visitors || 0}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Sessions</p>
                                                <p className="text-2xl font-bold text-gray-900">{analyticsData.sessions || 0}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Bounce Rate</p>
                                                <p className="text-2xl font-bold text-gray-900">{analyticsData.bounceRate || 0}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>Google Analytics is not configured for this project.</p>
                                        <p className="text-sm mt-1">Contact your administrator to set up analytics tracking.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SEO Tab */}
                        {!loading && activeTab === 'seo' && seoData && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">SEO Analysis</h2>
                                    <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(seoData.overall || 0)}`}>
                                        <span className={`text-2xl font-bold ${getScoreColor(seoData.overall || 0)}`}>
                                            {seoData.overall || 0}
                                        </span>
                                        <span className="text-sm text-gray-600 ml-2">/ 100</span>
                                    </div>
                                </div>

                                {seoData.issues && seoData.issues.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Issues Found</h3>
                                        <div className="space-y-2">
                                            {seoData.issues.map((issue: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`p-4 rounded-lg border ${
                                                        issue.severity === 'critical'
                                                            ? 'bg-red-50 border-red-200'
                                                            : issue.severity === 'warning'
                                                            ? 'bg-yellow-50 border-yellow-200'
                                                            : 'bg-blue-50 border-blue-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                                            issue.severity === 'critical' ? 'text-red-600' :
                                                            issue.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                                        }`} />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{issue.title}</p>
                                                            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {seoData.recommendations && seoData.recommendations.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                                        <ul className="space-y-2">
                                            {seoData.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Performance Tab */}
                        {!loading && activeTab === 'performance' && performanceData && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
                                    <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(performanceData.overall || 0)}`}>
                                        <span className={`text-2xl font-bold ${getScoreColor(performanceData.overall || 0)}`}>
                                            {performanceData.overall || 0}
                                        </span>
                                        <span className="text-sm text-gray-600 ml-2">/ 100</span>
                                    </div>
                                </div>

                                {performanceData.coreWebVitals && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Core Web Vitals</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg border">
                                                <p className="text-sm text-gray-600 mb-1">LCP (Largest Contentful Paint)</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {performanceData.coreWebVitals.lcp || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg border">
                                                <p className="text-sm text-gray-600 mb-1">FID (First Input Delay)</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {performanceData.coreWebVitals.fid || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg border">
                                                <p className="text-sm text-gray-600 mb-1">CLS (Cumulative Layout Shift)</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {performanceData.coreWebVitals.cls || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {performanceData.recommendations && performanceData.recommendations.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Optimization Recommendations</h3>
                                        <ul className="space-y-2">
                                            {performanceData.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Getting Started */}
            {!dashboardData && !analyticsData && !seoData && !performanceData && !loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 About Monitoring</h3>
                    <p className="text-blue-800 text-sm mb-3">
                        Monitor your website's analytics, SEO health, and performance metrics all in one place.
                    </p>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Select a deployed project to view monitoring data</li>
                        <li>• Track Google Analytics metrics (if configured)</li>
                        <li>• Get SEO analysis and recommendations</li>
                        <li>• Monitor performance and Core Web Vitals</li>
                        <li>• Generate comprehensive PDF reports</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
