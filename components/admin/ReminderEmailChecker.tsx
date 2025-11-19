// components/admin/ReminderEmailChecker.tsx
'use client';

import { useEffect } from 'react';
import { checkAndSendReminderEmail } from '@/app/actions/reminders';

/**
 * This component silently checks and sends reminder emails when admin visits admin pages.
 * It runs once per session and respects the "one email per day" limit set in the server action.
 */
export default function ReminderEmailChecker() {
    useEffect(() => {
        // Check if we've already attempted to send during this session
        const sessionKey = 'reminder_email_checked';
        const hasChecked = sessionStorage.getItem(sessionKey);

        if (!hasChecked) {
            // Mark as checked for this session
            sessionStorage.setItem(sessionKey, 'true');

            // Silently check and send reminder email
            checkAndSendReminderEmail().catch((error) => {
                // Silently fail - we don't want to disrupt the user experience
                console.error('Failed to check reminder emails:', error);
            });
        }
    }, []);

    return null; // This component doesn't render anything
}
