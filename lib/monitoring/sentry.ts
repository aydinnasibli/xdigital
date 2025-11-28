import * as Sentry from "@sentry/nextjs";

/**
 * Log an error to Sentry
 * @param error - The error object or message
 * @param context - Additional context data
 */
export function logError(error: Error | string, context?: Record<string, unknown>) {
  if (typeof error === "string") {
    Sentry.captureMessage(error, {
      level: "error",
      extra: context,
    });
  } else {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Log a warning to Sentry
 * @param message - The warning message
 * @param context - Additional context data
 */
export function logWarning(message: string, context?: Record<string, unknown>) {
  Sentry.captureMessage(message, {
    level: "warning",
    extra: context,
  });
}

/**
 * Log an info message to Sentry
 * @param message - The info message
 * @param context - Additional context data
 */
export function logInfo(message: string, context?: Record<string, unknown>) {
  Sentry.captureMessage(message, {
    level: "info",
    extra: context,
  });
}

/**
 * Set user context for Sentry
 * @param userId - The user ID
 * @param userData - Additional user data
 */
export function setUserContext(userId: string, userData?: Record<string, unknown>) {
  Sentry.setUser({
    id: userId,
    ...userData,
  });
}

/**
 * Clear user context from Sentry
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
