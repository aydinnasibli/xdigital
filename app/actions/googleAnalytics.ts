// app/actions/googleAnalytics.ts
'use server';

import { GoogleAnalyticsService } from '@/lib/services/analytics.service';
import { logError } from '@/lib/monitoring/sentry';
import { requireAdmin } from '@/lib/auth/admin';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

/**
 * Get Google Analytics data for the admin dashboard
 */
export async function getWebsiteAnalytics(days: number = 30): Promise<ActionResponse> {
    try {
        await requireAdmin();

        // Check if GA is configured
        const gaPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        const gaCredentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS;

        if (!gaPropertyId || !gaCredentials) {
            return {
                success: false,
                error: 'Google Analytics not configured'
            };
        }

        // Parse credentials
        const credentials = JSON.parse(gaCredentials);

        // Initialize GA service
        const gaService = new GoogleAnalyticsService({
            propertyId: gaPropertyId,
            credentials
        });

        // Calculate date range
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

        // Fetch analytics data
        const analyticsData = await gaService.getAnalyticsData(startDate, endDate);

        return {
            success: true,
            data: analyticsData
        };
    } catch (error) {
        logError(error as Error, { context: 'getWebsiteAnalytics', days });
        return {
            success: false,
            error: 'Failed to fetch website analytics'
        };
    }
}

/**
 * Get real-time website users
 */
export async function getRealTimeUsers(): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const gaPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        const gaCredentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS;

        if (!gaPropertyId || !gaCredentials) {
            return {
                success: false,
                error: 'Google Analytics not configured'
            };
        }

        const credentials = JSON.parse(gaCredentials);
        const gaService = new GoogleAnalyticsService({
            propertyId: gaPropertyId,
            credentials
        });

        const realTimeUsers = await gaService.getRealTimeUsers();

        return {
            success: true,
            data: { realTimeUsers }
        };
    } catch (error) {
        logError(error as Error, { context: 'getRealTimeUsers' });
        return {
            success: false,
            error: 'Failed to fetch real-time users'
        };
    }
}
