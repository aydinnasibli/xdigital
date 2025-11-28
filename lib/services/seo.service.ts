// lib/services/seo.service.ts
// SEO analysis and monitoring service

import { logError } from '@/lib/monitoring/sentry';

/**
 * Validate URL to prevent SSRF attacks
 */
function validateUrl(url: string): void {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error('Invalid URL format');
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    // Block private IP ranges and localhost
    const hostname = parsedUrl.hostname.toLowerCase();

    // Block localhost variations
    if (hostname === 'localhost' || hostname === '0.0.0.0') {
        throw new Error('Access to localhost is not allowed');
    }

    // Block loopback addresses
    if (hostname === '127.0.0.1' || hostname.startsWith('127.')) {
        throw new Error('Access to loopback addresses is not allowed');
    }

    // Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);

    if (match) {
        const octets = match.slice(1, 5).map(Number);

        // 10.0.0.0/8
        if (octets[0] === 10) {
            throw new Error('Access to private IP range 10.0.0.0/8 is not allowed');
        }

        // 172.16.0.0/12
        if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
            throw new Error('Access to private IP range 172.16.0.0/12 is not allowed');
        }

        // 192.168.0.0/16
        if (octets[0] === 192 && octets[1] === 168) {
            throw new Error('Access to private IP range 192.168.0.0/16 is not allowed');
        }

        // Block cloud metadata endpoint (AWS, GCP, Azure)
        if (octets[0] === 169 && octets[1] === 254) {
            throw new Error('Access to cloud metadata endpoint is not allowed');
        }
    }

    // Block IPv6 localhost
    if (hostname === '::1' || hostname === '[::1]') {
        throw new Error('Access to IPv6 localhost is not allowed');
    }

    // Block internal/reserved domains
    const blockedDomains = ['.local', '.internal', '.localhost'];
    if (blockedDomains.some(domain => hostname.endsWith(domain))) {
        throw new Error('Access to internal domains is not allowed');
    }
}

export interface SEOScore {
    overall: number; // 0-100
    breakdown: {
        metaTags: number;
        headings: number;
        images: number;
        performance: number;
        mobile: number;
        ssl: number;
    };
    issues: SEOIssue[];
    recommendations: string[];
}

export interface SEOIssue {
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    element?: string;
}

export interface PageMetadata {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    canonical?: string;
    robots?: string;
    lang?: string;
}

export class SEOService {
    private siteUrl: string;

    constructor(siteUrl: string) {
        // Validate URL to prevent SSRF attacks
        validateUrl(siteUrl);
        this.siteUrl = siteUrl;
    }

    /**
     * Analyze SEO for the website
     */
    async analyzeSEO(): Promise<SEOScore> {
        try {
            const issues: SEOIssue[] = [];
            const recommendations: string[] = [];

            // Fetch the page
            const pageData = await this.fetchPage(this.siteUrl);
            const metadata = this.extractMetadata(pageData);

            // Check meta tags
            const metaScore = this.checkMetaTags(metadata, issues, recommendations);

            // Check headings
            const headingsScore = this.checkHeadings(pageData, issues, recommendations);

            // Check images
            const imagesScore = this.checkImages(pageData, issues, recommendations);

            // Check SSL
            const sslScore = this.checkSSL(this.siteUrl, issues, recommendations);

            // Check mobile-friendliness (simplified)
            const mobileScore = this.checkMobileFriendly(pageData, issues, recommendations);

            // Basic performance check (checks for common performance issues in HTML)
            const perfScore = this.checkBasicPerformance(pageData, issues, recommendations);

            // Calculate overall score
            const overall = Math.round(
                (metaScore + headingsScore + imagesScore + sslScore + mobileScore + perfScore) / 6
            );

            return {
                overall,
                breakdown: {
                    metaTags: metaScore,
                    headings: headingsScore,
                    images: imagesScore,
                    performance: perfScore,
                    mobile: mobileScore,
                    ssl: sslScore,
                },
                issues,
                recommendations,
            };
        } catch (error) {
            logError(error as Error, {
                context: 'analyzeSEO',
                siteUrl: this.siteUrl
            });
            throw new Error('Failed to analyze SEO. Please check the website URL is accessible.');
        }
    }

    /**
     * Fetch page HTML
     */
    private async fetchPage(url: string): Promise<string> {
        try {
            // Validate URL again before fetching (defense in depth)
            validateUrl(url);

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'SEO-Analyzer/1.0',
                },
                signal: controller.signal,
                redirect: 'manual', // Don't follow redirects automatically to prevent redirect-based SSRF
            });

            clearTimeout(timeoutId);

            // Check for redirects and validate redirect URL
            if (response.status >= 300 && response.status < 400) {
                const redirectUrl = response.headers.get('location');
                if (redirectUrl) {
                    // Validate redirect URL before following
                    validateUrl(redirectUrl);
                    return await this.fetchPage(redirectUrl);
                }
            }

            return await response.text();
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                throw new Error('Request timeout: The website took too long to respond');
            }
            logError(error as Error, {
                context: 'fetchPage',
                url
            });
            return '';
        }
    }

    /**
     * Extract metadata from HTML
     */
    private extractMetadata(html: string): PageMetadata {
        const metadata: PageMetadata = {};

        // Extract title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) metadata.title = titleMatch[1].trim();

        // Extract description
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        if (descMatch) metadata.description = descMatch[1];

        // Extract keywords
        const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
        if (keywordsMatch) metadata.keywords = keywordsMatch[1];

        // Extract OG tags
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        if (ogTitleMatch) metadata.ogTitle = ogTitleMatch[1];

        const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (ogDescMatch) metadata.ogDescription = ogDescMatch[1];

        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (ogImageMatch) metadata.ogImage = ogImageMatch[1];

        // Extract canonical
        const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
        if (canonicalMatch) metadata.canonical = canonicalMatch[1];

        // Extract robots
        const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
        if (robotsMatch) metadata.robots = robotsMatch[1];

        return metadata;
    }

    /**
     * Check meta tags
     */
    private checkMetaTags(metadata: PageMetadata, issues: SEOIssue[], recommendations: string[]): number {
        let score = 100;

        if (!metadata.title || metadata.title.length === 0) {
            score -= 25;
            issues.push({
                severity: 'critical',
                category: 'Meta Tags',
                message: 'Missing page title',
                element: '<title>',
            });
            recommendations.push('Add a descriptive title tag (50-60 characters)');
        } else if (metadata.title.length < 30 || metadata.title.length > 60) {
            score -= 10;
            issues.push({
                severity: 'warning',
                category: 'Meta Tags',
                message: `Title length (${metadata.title.length}) is not optimal (recommended: 50-60 characters)`,
                element: '<title>',
            });
        }

        if (!metadata.description || metadata.description.length === 0) {
            score -= 20;
            issues.push({
                severity: 'critical',
                category: 'Meta Tags',
                message: 'Missing meta description',
                element: '<meta name="description">',
            });
            recommendations.push('Add a meta description (150-160 characters)');
        } else if (metadata.description.length < 120 || metadata.description.length > 160) {
            score -= 10;
            issues.push({
                severity: 'warning',
                category: 'Meta Tags',
                message: `Description length (${metadata.description.length}) is not optimal (recommended: 150-160 characters)`,
                element: '<meta name="description">',
            });
        }

        if (!metadata.ogImage) {
            score -= 15;
            issues.push({
                severity: 'warning',
                category: 'Social Media',
                message: 'Missing Open Graph image for social media sharing',
                element: '<meta property="og:image">',
            });
            recommendations.push('Add Open Graph meta tags for better social media sharing');
        }

        if (!metadata.canonical) {
            score -= 10;
            issues.push({
                severity: 'info',
                category: 'Meta Tags',
                message: 'Missing canonical URL',
                element: '<link rel="canonical">',
            });
        }

        return Math.max(0, score);
    }

    /**
     * Check heading structure
     */
    private checkHeadings(html: string, issues: SEOIssue[], recommendations: string[]): number {
        let score = 100;

        const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
        const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;

        if (h1Count === 0) {
            score -= 30;
            issues.push({
                severity: 'critical',
                category: 'Headings',
                message: 'Missing H1 heading',
                element: '<h1>',
            });
            recommendations.push('Add one H1 heading per page with main keyword');
        } else if (h1Count > 1) {
            score -= 20;
            issues.push({
                severity: 'warning',
                category: 'Headings',
                message: `Multiple H1 headings found (${h1Count}). Should have only one.`,
                element: '<h1>',
            });
        }

        if (h2Count === 0) {
            score -= 10;
            issues.push({
                severity: 'info',
                category: 'Headings',
                message: 'No H2 headings found. Consider using heading hierarchy.',
                element: '<h2>',
            });
        }

        return Math.max(0, score);
    }

    /**
     * Check images
     */
    private checkImages(html: string, issues: SEOIssue[], recommendations: string[]): number {
        let score = 100;

        const imgTags = html.match(/<img[^>]+>/gi) || [];
        const imagesWithoutAlt = imgTags.filter((img) => !img.includes('alt=')).length;

        if (imagesWithoutAlt > 0) {
            score -= 20;
            issues.push({
                severity: 'warning',
                category: 'Images',
                message: `${imagesWithoutAlt} images missing alt text`,
                element: '<img>',
            });
            recommendations.push('Add descriptive alt text to all images for accessibility and SEO');
        }

        return Math.max(0, score);
    }

    /**
     * Check SSL
     */
    private checkSSL(url: string, issues: SEOIssue[], recommendations: string[]): number {
        if (url.startsWith('https://')) {
            return 100;
        } else {
            issues.push({
                severity: 'critical',
                category: 'Security',
                message: 'Website is not using HTTPS',
                element: 'SSL Certificate',
            });
            recommendations.push('Enable HTTPS with SSL certificate for security and SEO');
            return 0;
        }
    }

    /**
     * Check mobile-friendliness
     */
    private checkMobileFriendly(html: string, issues: SEOIssue[], recommendations: string[]): number {
        let score = 100;

        const hasViewport = html.includes('viewport');
        const hasMediaQueries = html.includes('@media') || html.includes('responsive');

        if (!hasViewport) {
            score -= 50;
            issues.push({
                severity: 'critical',
                category: 'Mobile',
                message: 'Missing viewport meta tag',
                element: '<meta name="viewport">',
            });
            recommendations.push('Add viewport meta tag for mobile responsiveness');
        }

        return Math.max(0, score);
    }

    /**
     * Check basic performance indicators in HTML
     */
    private checkBasicPerformance(html: string, issues: SEOIssue[], recommendations: string[]): number {
        let score = 100;

        // Check for inline scripts (can block rendering)
        const inlineScripts = (html.match(/<script(?![^>]*src=)[^>]*>/gi) || []).length;
        if (inlineScripts > 3) {
            score -= 15;
            issues.push({
                severity: 'warning',
                category: 'Performance',
                message: `${inlineScripts} inline scripts found. Consider moving to external files.`,
                element: '<script>',
            });
            recommendations.push('Minimize inline scripts to improve page load performance');
        }

        // Check for large inline styles
        const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
        if (inlineStyles > 2) {
            score -= 10;
            issues.push({
                severity: 'info',
                category: 'Performance',
                message: `${inlineStyles} inline style blocks found. Consider using external CSS.`,
                element: '<style>',
            });
        }

        // Check for async/defer on scripts
        const externalScripts = (html.match(/<script[^>]*src=/gi) || []).length;
        const asyncScripts = (html.match(/<script[^>]*(async|defer)/gi) || []).length;
        if (externalScripts > 0 && asyncScripts === 0) {
            score -= 20;
            issues.push({
                severity: 'warning',
                category: 'Performance',
                message: 'Scripts are not using async or defer attributes',
                element: '<script>',
            });
            recommendations.push('Add async or defer attributes to script tags for better performance');
        }

        return Math.max(0, score);
    }

    /**
     * Get quick SEO health check
     */
    async getHealthCheck(): Promise<{
        score: number;
        status: 'excellent' | 'good' | 'fair' | 'poor';
        criticalIssues: number;
    }> {
        const seoScore = await this.analyzeSEO();
        const criticalIssues = seoScore.issues.filter((i) => i.severity === 'critical').length;

        let status: 'excellent' | 'good' | 'fair' | 'poor';
        if (seoScore.overall >= 90) status = 'excellent';
        else if (seoScore.overall >= 75) status = 'good';
        else if (seoScore.overall >= 60) status = 'fair';
        else status = 'poor';

        return {
            score: seoScore.overall,
            status,
            criticalIssues,
        };
    }
}
