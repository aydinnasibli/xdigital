// lib/services/performance.service.ts
// Website performance monitoring using Lighthouse and Web Vitals

import { logError } from '@/lib/sentry-logger';

export interface PerformanceMetrics {
    overall: number; // 0-100
    coreWebVitals: {
        lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }; // Largest Contentful Paint (ms)
        fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }; // First Input Delay (ms)
        cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }; // Cumulative Layout Shift
    };
    lighthouse: {
        performance: number;
        accessibility: number;
        bestPractices: number;
        seo: number;
    };
    pageSpeed: {
        loadTime: number; // seconds
        timeToInteractive: number; // seconds
        firstContentfulPaint: number; // seconds
    };
    resources: {
        totalSize: number; // bytes
        imageSize: number;
        scriptSize: number;
        cssSize: number;
        requests: number;
    };
    recommendations: string[];
}

export class PerformanceService {
    private siteUrl: string;

    constructor(siteUrl: string) {
        this.siteUrl = siteUrl;
    }

    /**
     * Analyze website performance
     * Note: In production, integrate with:
     * - PageSpeed Insights API: https://developers.google.com/speed/docs/insights/v5/get-started
     * - Lighthouse CI
     * - Real User Monitoring (RUM)
     */
    async analyzePerformance(): Promise<PerformanceMetrics> {
        try {
            const apiKey = process.env.PAGESPEED_API_KEY;
            if (!apiKey) {
                throw new Error('PAGESPEED_API_KEY is not configured');
            }

            const response = await fetch(
                `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(this.siteUrl)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`
            );

            if (!response.ok) {
                throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Extract Lighthouse scores
            const lighthouseScores = data.lighthouseResult.categories;
            const performanceScore = Math.round(lighthouseScores.performance.score * 100);
            const accessibilityScore = Math.round(lighthouseScores.accessibility.score * 100);
            const bestPracticesScore = Math.round(lighthouseScores['best-practices'].score * 100);
            const seoScore = Math.round(lighthouseScores.seo.score * 100);

            // Extract Core Web Vitals
            const audits = data.lighthouseResult.audits;
            const lcpValue = Math.round(audits['largest-contentful-paint']?.numericValue || 0);
            const fidValue = Math.round(audits['max-potential-fid']?.numericValue || 0);
            const clsValue = parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(2));

            // Extract page speed metrics
            const loadTime = (audits['speed-index']?.numericValue || 0) / 1000;
            const timeToInteractive = (audits['interactive']?.numericValue || 0) / 1000;
            const firstContentfulPaint = (audits['first-contentful-paint']?.numericValue || 0) / 1000;

            // Calculate resource sizes from audits
            const resourceSummary = audits['resource-summary'];
            const totalSize = resourceSummary?.details?.items?.reduce((sum: number, item: any) => sum + (item.transferSize || 0), 0) || 0;

            // Get image, script, and CSS sizes
            const items = resourceSummary?.details?.items || [];
            const imageSize = items.find((i: any) => i.resourceType === 'image')?.transferSize || 0;
            const scriptSize = items.find((i: any) => i.resourceType === 'script')?.transferSize || 0;
            const cssSize = items.find((i: any) => i.resourceType === 'stylesheet')?.transferSize || 0;
            const requests = audits['network-requests']?.details?.items?.length || 0;

            // Generate recommendations from opportunities
            const recommendations: string[] = [];
            const opportunities = [
                'uses-optimized-images',
                'offscreen-images',
                'render-blocking-resources',
                'unused-css-rules',
                'unminified-css',
                'unminified-javascript',
                'unused-javascript',
                'uses-text-compression',
                'uses-responsive-images',
                'efficient-animated-content',
            ];

            opportunities.forEach(key => {
                const audit = audits[key];
                if (audit && audit.score !== null && audit.score < 1) {
                    recommendations.push(audit.title);
                }
            });

            // If no recommendations, add some generic ones
            if (recommendations.length === 0) {
                recommendations.push('Continue monitoring performance regularly');
                recommendations.push('Consider implementing a CDN for static assets');
            }

            return {
                overall: performanceScore,
                coreWebVitals: {
                    lcp: {
                        value: lcpValue,
                        rating: this.getRating('lcp', lcpValue),
                    },
                    fid: {
                        value: fidValue,
                        rating: this.getRating('fid', fidValue),
                    },
                    cls: {
                        value: clsValue,
                        rating: this.getRating('cls', clsValue),
                    },
                },
                lighthouse: {
                    performance: performanceScore,
                    accessibility: accessibilityScore,
                    bestPractices: bestPracticesScore,
                    seo: seoScore,
                },
                pageSpeed: {
                    loadTime: Math.round(loadTime * 100) / 100,
                    timeToInteractive: Math.round(timeToInteractive * 100) / 100,
                    firstContentfulPaint: Math.round(firstContentfulPaint * 100) / 100,
                },
                resources: {
                    totalSize,
                    imageSize,
                    scriptSize,
                    cssSize,
                    requests,
                },
                recommendations: recommendations.slice(0, 6), // Limit to 6 recommendations
            };
        } catch (error) {
            logError(error as Error, {
                context: 'analyzePerformance',
                siteUrl: this.siteUrl
            });
            throw new Error('Failed to analyze performance. Please check your PageSpeed API configuration.');
        }
    }

    /**
     * Get Core Web Vitals ratings
     */
    private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
        const thresholds: { [key: string]: { good: number; poor: number } } = {
            lcp: { good: 2500, poor: 4000 }, // ms
            fid: { good: 100, poor: 300 }, // ms
            cls: { good: 0.1, poor: 0.25 }, // score
        };

        const threshold = thresholds[metric];
        if (!threshold) return 'good';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Get simple performance score
     */
    async getPerformanceScore(): Promise<number> {
        const metrics = await this.analyzePerformance();
        return metrics.overall;
    }

    /**
     * Get Core Web Vitals summary
     */
    async getCoreWebVitals(): Promise<{
        lcp: { value: number; rating: string };
        fid: { value: number; rating: string };
        cls: { value: number; rating: string };
        passing: boolean;
    }> {
        const metrics = await this.analyzePerformance();
        const { lcp, fid, cls } = metrics.coreWebVitals;

        // All metrics must be "good" to pass Core Web Vitals
        const passing = lcp.rating === 'good' && fid.rating === 'good' && cls.rating === 'good';

        return {
            lcp,
            fid,
            cls,
            passing,
        };
    }

    /**
     * Format bytes to human-readable size
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Get performance health status
     */
    async getHealthStatus(): Promise<{
        status: 'excellent' | 'good' | 'fair' | 'poor';
        score: number;
        needsAttention: boolean;
    }> {
        const metrics = await this.analyzePerformance();
        const score = metrics.overall;

        let status: 'excellent' | 'good' | 'fair' | 'poor';
        if (score >= 90) status = 'excellent';
        else if (score >= 75) status = 'good';
        else if (score >= 60) status = 'fair';
        else status = 'poor';

        return {
            status,
            score,
            needsAttention: score < 75,
        };
    }
}

/**
 * Setup instructions for PageSpeed Insights API:
 *
 * 1. Go to Google Cloud Console: https://console.cloud.google.com
 * 2. Enable PageSpeed Insights API
 * 3. Create API Key:
 *    - Go to APIs & Services > Credentials
 *    - Create Credentials > API Key
 * 4. Add to environment variables:
 *    PAGESPEED_API_KEY=your-api-key-here
 *
 * Note: PageSpeed Insights API is free but has rate limits:
 * - 25,000 queries per day
 * - 1 query per second per IP address
 */
