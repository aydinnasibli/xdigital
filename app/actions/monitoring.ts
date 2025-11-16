// app/actions/monitoring.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { GoogleAnalyticsService } from '@/lib/services/analytics.service';
import { SEOService } from '@/lib/services/seo.service';
import { PerformanceService } from '@/lib/services/performance.service';
import { PDFReportService, type ReportData } from '@/lib/services/pdf-report.service';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

/**
 * Get comprehensive analytics for a project
 */
export async function getProjectAnalytics(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const project = await Project.findOne({ _id: projectId, userId: user._id });
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        // Initialize Google Analytics service
        if (project.googleAnalyticsPropertyId) {
            const analyticsService = new GoogleAnalyticsService({
                propertyId: project.googleAnalyticsPropertyId,
            });

            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];

            const analyticsData = await analyticsService.getAnalyticsData(startDate, endDate);
            const realTimeUsers = await analyticsService.getRealTimeUsers();

            return {
                success: true,
                data: {
                    ...analyticsData,
                    realTimeUsers,
                },
            };
        }

        // Return mock data if GA is not configured
        return {
            success: true,
            data: {
                pageViews: 0,
                visitors: 0,
                sessions: 0,
                bounceRate: 0,
                avgSessionDuration: 0,
                conversions: 0,
                topPages: [],
                trafficSources: [],
                deviceBreakdown: [],
                geographicData: [],
                realTimeUsers: 0,
                message: 'Google Analytics not configured for this project',
            },
        };
    } catch (error) {
        console.error('Error fetching project analytics:', error);
        return { success: false, error: 'Failed to fetch analytics' };
    }
}

/**
 * Get SEO analysis for a project
 */
export async function getSEOAnalysis(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const project = await Project.findOne({ _id: projectId, userId: user._id });
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        if (!project.deploymentUrl) {
            return {
                success: false,
                error: 'Website not deployed yet. SEO analysis requires a live website.',
            };
        }

        const seoService = new SEOService(project.deploymentUrl);
        const seoScore = await seoService.analyzeSEO();

        return {
            success: true,
            data: seoScore,
        };
    } catch (error) {
        console.error('Error analyzing SEO:', error);
        return { success: false, error: 'Failed to analyze SEO' };
    }
}

/**
 * Get performance metrics for a project
 */
export async function getPerformanceMetrics(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const project = await Project.findOne({ _id: projectId, userId: user._id });
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        if (!project.deploymentUrl) {
            return {
                success: false,
                error: 'Website not deployed yet. Performance analysis requires a live website.',
            };
        }

        const performanceService = new PerformanceService(project.deploymentUrl);
        const performanceMetrics = await performanceService.analyzePerformance();

        return {
            success: true,
            data: performanceMetrics,
        };
    } catch (error) {
        console.error('Error analyzing performance:', error);
        return { success: false, error: 'Failed to analyze performance' };
    }
}

/**
 * Get dashboard summary (analytics + SEO + performance)
 */
export async function getDashboardSummary(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const project = await Project.findOne({ _id: projectId, userId: user._id });
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        const summary: any = {
            projectName: project.projectName,
            websiteUrl: project.deploymentUrl,
            isDeployed: !!project.deploymentUrl,
        };

        if (project.deploymentUrl) {
            // Get analytics summary
            if (project.googleAnalyticsPropertyId) {
                const analyticsService = new GoogleAnalyticsService({
                    propertyId: project.googleAnalyticsPropertyId,
                });
                summary.analytics = await analyticsService.getAnalyticsSummary(30);
            }

            // Get SEO health check
            const seoService = new SEOService(project.deploymentUrl);
            summary.seo = await seoService.getHealthCheck();

            // Get performance health status
            const performanceService = new PerformanceService(project.deploymentUrl);
            summary.performance = await performanceService.getHealthStatus();
        }

        return {
            success: true,
            data: summary,
        };
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return { success: false, error: 'Failed to fetch dashboard summary' };
    }
}

/**
 * Generate PDF report for a project
 */
export async function generatePDFReport(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const project = await Project.findOne({ _id: projectId, userId: user._id });
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        if (!project.deploymentUrl) {
            return {
                success: false,
                error: 'Website not deployed yet. Reports require a live website.',
            };
        }

        // Gather all data for report
        const endDate = new Date();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get analytics data
        const analyticsService = new GoogleAnalyticsService({
            propertyId: project.googleAnalyticsPropertyId || '',
        });
        const analyticsData = await analyticsService.getAnalyticsData(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );

        // Get SEO data
        const seoService = new SEOService(project.deploymentUrl);
        const seoScore = await seoService.analyzeSEO();

        // Get performance data
        const performanceService = new PerformanceService(project.deploymentUrl);
        const performanceMetrics = await performanceService.analyzePerformance();

        // Prepare report data
        const reportData: ReportData = {
            projectName: project.projectName,
            websiteUrl: project.deploymentUrl,
            reportPeriod: {
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString(),
            },
            analytics: {
                pageViews: analyticsData.pageViews,
                visitors: analyticsData.visitors,
                sessions: analyticsData.sessions,
                bounceRate: analyticsData.bounceRate,
                avgSessionDuration: analyticsData.avgSessionDuration,
                conversions: analyticsData.conversions,
                topPages: analyticsData.topPages,
                trafficSources: analyticsData.trafficSources,
            },
            seo: {
                score: seoScore.overall,
                criticalIssues: seoScore.issues.filter((i) => i.severity === 'critical').length,
                recommendations: seoScore.recommendations,
            },
            performance: {
                score: performanceMetrics.overall,
                coreWebVitals: performanceMetrics.coreWebVitals,
            },
        };

        // Generate report HTML
        const pdfService = new PDFReportService();
        const reportHTML = await pdfService.generateReport(reportData);

        return {
            success: true,
            data: {
                html: reportHTML,
                filename: `analytics-report-${project.projectName.replace(/\s+/g, '-')}-${endDate.toISOString().split('T')[0]}.pdf`,
            },
        };
    } catch (error) {
        console.error('Error generating PDF report:', error);
        return { success: false, error: 'Failed to generate report' };
    }
}
