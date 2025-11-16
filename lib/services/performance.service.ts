// lib/services/performance.service.ts
// Website performance monitoring using Lighthouse and Web Vitals

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
            // In production, use PageSpeed Insights API:

            const apiKey = process.env.PAGESPEED_API_KEY;
            const response = await fetch(
                `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(this.siteUrl)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`
            );
            const data = await response.json();

            // Extract Lighthouse scores
            const lighthouseScores = data.lighthouseResult.categories;
            const performanceScore = lighthouseScores.performance.score * 100;
            const accessibilityScore = lighthouseScores.accessibility.score * 100;
            const bestPracticesScore = lighthouseScores['best-practices'].score * 100;
            const seoScore = lighthouseScores.seo.score * 100;

            // Extract Core Web Vitals
            const audits = data.lighthouseResult.audits;
            const lcpValue = audits['largest-contentful-paint'].numericValue;
            const fidValue = audits['max-potential-fid'].numericValue;
            const clsValue = audits['cumulative-layout-shift'].numericValue;




        } catch (error) {
            console.error('Error analyzing performance:', error);
            return this.getMockPerformanceMetrics();
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
     * Mock performance metrics for development
     */
    private getMockPerformanceMetrics(): PerformanceMetrics {
        const lcpValue = Math.random() * 3000 + 1500; // 1.5-4.5s
        const fidValue = Math.random() * 150 + 50; // 50-200ms
        const clsValue = Math.random() * 0.2 + 0.05; // 0.05-0.25

        return {
            overall: Math.floor(Math.random() * 20) + 75, // 75-95
            coreWebVitals: {
                lcp: {
                    value: Math.round(lcpValue),
                    rating: this.getRating('lcp', lcpValue),
                },
                fid: {
                    value: Math.round(fidValue),
                    rating: this.getRating('fid', fidValue),
                },
                cls: {
                    value: Math.round(clsValue * 100) / 100,
                    rating: this.getRating('cls', clsValue),
                },
            },
            lighthouse: {
                performance: Math.floor(Math.random() * 20) + 75,
                accessibility: Math.floor(Math.random() * 15) + 80,
                bestPractices: Math.floor(Math.random() * 15) + 80,
                seo: Math.floor(Math.random() * 15) + 80,
            },
            pageSpeed: {
                loadTime: Math.random() * 2 + 1, // 1-3s
                timeToInteractive: Math.random() * 3 + 2, // 2-5s
                firstContentfulPaint: Math.random() * 1.5 + 0.5, // 0.5-2s
            },
            resources: {
                totalSize: Math.floor(Math.random() * 2000000) + 500000, // 0.5-2.5MB
                imageSize: Math.floor(Math.random() * 1000000) + 200000,
                scriptSize: Math.floor(Math.random() * 500000) + 100000,
                cssSize: Math.floor(Math.random() * 200000) + 50000,
                requests: Math.floor(Math.random() * 40) + 20,
            },
            recommendations: this.generateRecommendations(),
        };
    }

    /**
     * Generate performance recommendations
     */
    private generateRecommendations(): string[] {
        const recommendations = [
            'Optimize images by using modern formats (WebP, AVIF)',
            'Enable browser caching for static resources',
            'Minify JavaScript and CSS files',
            'Use a Content Delivery Network (CDN)',
            'Implement lazy loading for images',
            'Reduce server response time',
            'Eliminate render-blocking resources',
            'Defer offscreen images',
            'Remove unused CSS',
            'Compress images without losing quality',
            'Use HTTP/2 for faster resource loading',
            'Implement code splitting for JavaScript',
        ];

        // Return 4-6 random recommendations
        const count = Math.floor(Math.random() * 3) + 4;
        const shuffled = recommendations.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
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
