// lib/services/analytics.service.ts
// Google Analytics Data API integration for fetching website analytics

interface GoogleAnalyticsConfig {
    propertyId: string;
    credentials?: any; // Service account credentials
}

interface AnalyticsData {
    pageViews: number;
    visitors: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
    topPages: Array<{ page: string; views: number }>;
    trafficSources: Array<{ source: string; sessions: number }>;
    deviceBreakdown: Array<{ device: string; sessions: number }>;
    geographicData: Array<{ country: string; sessions: number }>;
    realTimeUsers: number;
}

export class GoogleAnalyticsService {
    private propertyId: string;
    private credentials: any;

    constructor(config: GoogleAnalyticsConfig) {
        this.propertyId = config.propertyId;
        this.credentials = config.credentials;
    }

    /**
     * Fetch analytics data for a date range
     */
    async getAnalyticsData(startDate: string, endDate: string): Promise<AnalyticsData> {
        try {
            const { BetaAnalyticsDataClient } = require('@google-analytics/data');
            const analyticsDataClient = new BetaAnalyticsDataClient({
                credentials: this.credentials
            });

            // Fetch main metrics
            const [metricsResponse] = await analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate, endDate }],
                metrics: [
                    { name: 'screenPageViews' },
                    { name: 'sessions' },
                    { name: 'totalUsers' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' },
                    { name: 'conversions' },
                ],
            });

            // Fetch top pages
            const [pagesResponse] = await analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }],
                limit: 5,
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            });

            // Fetch traffic sources
            const [sourcesResponse] = await analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'sessionSource' }],
                metrics: [{ name: 'sessions' }],
                limit: 5,
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            });

            // Fetch device breakdown
            const [devicesResponse] = await analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'deviceCategory' }],
                metrics: [{ name: 'sessions' }],
            });

            // Fetch geographic data
            const [geoResponse] = await analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'sessions' }],
                limit: 5,
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            });

            // Parse main metrics
            const mainMetrics = metricsResponse.rows?.[0]?.metricValues || [];
            const pageViews = parseInt(mainMetrics[0]?.value || '0');
            const sessions = parseInt(mainMetrics[1]?.value || '0');
            const visitors = parseInt(mainMetrics[2]?.value || '0');
            const bounceRate = parseFloat(mainMetrics[3]?.value || '0');
            const avgSessionDuration = parseFloat(mainMetrics[4]?.value || '0');
            const conversions = parseInt(mainMetrics[5]?.value || '0');

            // Parse top pages
            const topPages = (pagesResponse.rows || []).map((row: any) => ({
                page: row.dimensionValues?.[0]?.value || '/',
                views: parseInt(row.metricValues?.[0]?.value || '0'),
            }));

            // Parse traffic sources
            const trafficSources = (sourcesResponse.rows || []).map((row: any) => ({
                source: row.dimensionValues?.[0]?.value || 'direct',
                sessions: parseInt(row.metricValues?.[0]?.value || '0'),
            }));

            // Parse device breakdown
            const deviceBreakdown = (devicesResponse.rows || []).map((row: any) => ({
                device: row.dimensionValues?.[0]?.value || 'unknown',
                sessions: parseInt(row.metricValues?.[0]?.value || '0'),
            }));

            // Parse geographic data
            const geographicData = (geoResponse.rows || []).map((row: any) => ({
                country: row.dimensionValues?.[0]?.value || 'Unknown',
                sessions: parseInt(row.metricValues?.[0]?.value || '0'),
            }));

            // Get real-time users
            const realTimeUsers = await this.getRealTimeUsers();

            return {
                pageViews,
                visitors,
                sessions,
                bounceRate,
                avgSessionDuration,
                conversions,
                topPages,
                trafficSources,
                deviceBreakdown,
                geographicData,
                realTimeUsers,
            };
        } catch (error) {
            console.error('Error fetching Google Analytics data:', error);
            throw new Error('Failed to fetch analytics data. Please check your Google Analytics configuration.');
        }
    }

    /**
     * Get real-time active users
     */
    async getRealTimeUsers(): Promise<number> {
        try {
            const { BetaAnalyticsDataClient } = require('@google-analytics/data');
            const analyticsDataClient = new BetaAnalyticsDataClient({
                credentials: this.credentials
            });

            const [response] = await analyticsDataClient.runRealtimeReport({
                property: `properties/${this.propertyId}`,
                metrics: [{ name: 'activeUsers' }],
            });

            return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
        } catch (error) {
            console.error('Error fetching real-time users:', error);
            return 0;
        }
    }

    /**
     * Get analytics summary for dashboard display
     */
    async getAnalyticsSummary(days: number = 30): Promise<{
        pageViews: number;
        visitors: number;
        conversions: number;
        engagement: number;
    }> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

        const data = await this.getAnalyticsData(startDate, endDate);

        return {
            pageViews: data.pageViews,
            visitors: data.visitors,
            conversions: data.conversions,
            engagement: Math.round((1 - data.bounceRate) * 100), // Engagement score
        };
    }
}

/**
 * Setup instructions for Google Analytics integration:
 *
 * 1. Create a Google Cloud Project:
 *    - Go to https://console.cloud.google.com
 *    - Create new project or select existing
 *
 * 2. Enable Google Analytics Data API:
 *    - Navigate to APIs & Services > Library
 *    - Search for "Google Analytics Data API"
 *    - Click Enable
 *
 * 3. Create Service Account:
 *    - Go to APIs & Services > Credentials
 *    - Create Credentials > Service Account
 *    - Download JSON key file
 *
 * 4. Grant Analytics Access:
 *    - Go to Google Analytics Admin
 *    - Property Settings > Property Access Management
 *    - Add service account email with Viewer role
 *
 * 5. Add to Environment Variables:
 *    GOOGLE_ANALYTICS_CREDENTIALS=<paste-json-content>
 *
 * 6. Install package:
 *    npm install @google-analytics/data
 */
