// lib/services/email.service.ts
'use server';

import { Resend } from 'resend';
import { logError } from '@/lib/sentry-logger';

let resendInstance: Resend | null = null;

function getResendInstance(): Resend {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY not configured');
        }
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const resend = getResendInstance();

        const defaultFrom = process.env.EMAIL_FROM || 'XDigital <noreply@xdigital.com>';

        const { data, error } = await resend.emails.send({
            from: params.from || defaultFrom,
            to: params.to,
            subject: params.subject,
            html: params.html,
            replyTo: params.replyTo,
        });

        if (error) {
            logError(new Error(error.message), {
                context: 'sendEmail-resend',
                to: params.to,
                subject: params.subject,
                error
            });
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        logError(error as Error, {
            context: 'sendEmail',
            to: params.to,
            subject: params.subject,
            from: params.from
        });
        return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
}

/**
 * Email templates
 */

export async function sendTaskAssignedEmail(
    to: string,
    taskTitle: string,
    projectName: string,
    dueDate: string | undefined,
    taskLink: string
) {
    return sendEmail({
        to,
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Task Assigned</h1>
        </div>
        <div class="content">
            <h2>${taskTitle}</h2>
            <p><strong>Project:</strong> ${projectName}</p>
            ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ''}
            <p>A new task has been assigned to you. Please review the details and start working on it.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${taskLink}" class="button">View Task</a>
            </p>
        </div>
        <div class="footer">
            <p>XDigital SaaS Platform</p>
        </div>
    </div>
</body>
</html>
        `,
    });
}
