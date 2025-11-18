// lib/sentry-logger.ts
import * as Sentry from "@sentry/nextjs";

/**
 * Log an error to Sentry
 * Use this instead of console.error for production error tracking
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, context);
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log a message to Sentry
 * Use this for important informational logs that need tracking
 */
export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Log a warning to Sentry
 * Use this for potential issues that aren't critical errors
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Warning:', message, context);
  }

  Sentry.captureMessage(message, {
    level: 'warning',
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging context
 * Use this to track the flow leading up to an error
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
