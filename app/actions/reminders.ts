// app/actions/reminders.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Reminder, { ReminderPriority, IPopulatedReminder } from '@/models/Reminder';
import User, { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth/admin';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import ReminderEmailLog from '@/models/ReminderEmailLog';
import { sendEmail } from '@/lib/services/email.service';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all reminders (admin only)
export async function getAllReminders(filters?: {
    includeCompleted?: boolean;
    clientId?: string;
    days?: number;
}): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const query: any = {};

        // Filter by completion status
        if (!filters?.includeCompleted) {
            query.isCompleted = false;
        }

        // Filter by client
        if (filters?.clientId && mongoose.Types.ObjectId.isValid(filters.clientId)) {
            query.clientId = filters.clientId;
        }

        // Filter by date range
        if (filters?.days) {
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + filters.days);
            query.reminderDate = {
                $lte: futureDate,
            };
        }

        const reminders = await Reminder.find(query)
            .populate('clientId', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .sort({ reminderDate: 1 })
            .lean() as unknown as IPopulatedReminder[];

        const serializedReminders = reminders.map(reminder => ({
            ...reminder,
            _id: reminder._id.toString(),
            clientId: reminder.clientId ? reminder.clientId._id.toString() : null,
            clientName: reminder.clientId
                ? `${reminder.clientId.firstName || ''} ${reminder.clientId.lastName || ''}`.trim() || reminder.clientId.email
                : null,
            createdBy: reminder.createdBy._id.toString(),
            createdByName: `${reminder.createdBy.firstName || ''} ${reminder.createdBy.lastName || ''}`.trim() || reminder.createdBy.email,
        }));

        return { success: true, data: serializedReminders };
    } catch (error) {
        logError(error as Error, { context: 'getAllReminders', filters });
        return { success: false, error: 'Failed to fetch reminders' };
    }
}

// Create a reminder (admin only)
export async function createReminder(data: {
    title: string;
    description: string;
    reminderDate: Date;
    priority?: ReminderPriority;
    clientId?: string;
    tags?: string[];
}): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Validate clientId if provided
        if (data.clientId && !mongoose.Types.ObjectId.isValid(data.clientId)) {
            return { success: false, error: 'Invalid client ID' };
        }

        // Validate reminder date is not in the past
        const now = new Date();
        const reminderDate = new Date(data.reminderDate);
        if (reminderDate < now) {
            return { success: false, error: 'Reminder date cannot be in the past' };
        }

        const reminder = await Reminder.create({
            ...data,
            createdBy: user._id,
        });

        revalidatePath('/admin/reminders');

        return {
            success: true,
            data: toSerializedObject(reminder),
        };
    } catch (error) {
        logError(error as Error, { context: 'createReminder', data });
        return { success: false, error: 'Failed to create reminder' };
    }
}

// Update a reminder (admin only)
export async function updateReminder(
    reminderId: string,
    data: Partial<{
        title: string;
        description: string;
        reminderDate: Date;
        priority: ReminderPriority;
        clientId: string;
        tags: string[];
    }>
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(reminderId)) {
            return { success: false, error: 'Invalid reminder ID' };
        }

        // Validate reminder date is not in the past if being updated
        if (data.reminderDate) {
            const now = new Date();
            const reminderDate = new Date(data.reminderDate);
            if (reminderDate < now) {
                return { success: false, error: 'Reminder date cannot be in the past' };
            }
        }

        await dbConnect();

        const reminder = await Reminder.findByIdAndUpdate(
            reminderId,
            data,
            { new: true }
        );

        if (!reminder) {
            return { success: false, error: 'Reminder not found' };
        }

        revalidatePath('/admin/reminders');

        return { success: true, data: toSerializedObject(reminder) };
    } catch (error) {
        logError(error as Error, { context: 'updateReminder', reminderId, data });
        return { success: false, error: 'Failed to update reminder' };
    }
}

// Mark reminder as completed (admin only)
export async function markReminderCompleted(reminderId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const reminder = await Reminder.findByIdAndUpdate(
            reminderId,
            {
                isCompleted: true,
                completedAt: new Date(),
            },
            { new: true }
        );

        if (!reminder) {
            return { success: false, error: 'Reminder not found' };
        }

        revalidatePath('/admin/reminders');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'markReminderCompleted', reminderId });
        return { success: false, error: 'Failed to mark reminder as completed' };
    }
}

// Delete a reminder (admin only)
export async function deleteReminder(reminderId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const reminder = await Reminder.findByIdAndDelete(reminderId);

        if (!reminder) {
            return { success: false, error: 'Reminder not found' };
        }

        revalidatePath('/admin/reminders');

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'deleteReminder', reminderId });
        return { success: false, error: 'Failed to delete reminder' };
    }
}

// Check and send daily reminder email to admin (admin only)
export async function checkAndSendReminderEmail(): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user || user.role !== UserRole.ADMIN) {
            return { success: false, error: 'Admin access required' };
        }

        const adminEmail = user.email;

        // Check if we've already sent an email today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const emailLog = await ReminderEmailLog.findOne({ adminEmail });

        if (emailLog) {
            const lastSentDate = new Date(emailLog.lastSentDate);
            lastSentDate.setHours(0, 0, 0, 0);

            // If we already sent today, skip
            if (lastSentDate.getTime() === today.getTime()) {
                return { success: true, data: { alreadySent: true } };
            }
        }

        // Get reminders for next 2 days
        const now = new Date();
        const twoDaysLater = new Date();
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);

        const reminders = await Reminder.find({
            reminderDate: {
                $lte: twoDaysLater,
            },
            isCompleted: false,
        })
            .populate('clientId', 'firstName lastName email')
            .sort({ reminderDate: 1 })
            .lean() as unknown as IPopulatedReminder[];

        // If no reminders, don't send email
        if (reminders.length === 0) {
            return { success: true, data: { noReminders: true } };
        }

        // Group reminders by urgency
        const overdue: any[] = [];
        const todayReminders: any[] = [];
        const tomorrowReminders: any[] = [];
        const upcoming: any[] = [];

        reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.reminderDate);
            const diff = reminderDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

            const item = {
                title: reminder.title,
                description: reminder.description,
                priority: reminder.priority,
                reminderDate: reminderDate,
                clientName: reminder.clientId
                    ? `${reminder.clientId.firstName || ''} ${reminder.clientId.lastName || ''}`.trim() || reminder.clientId.email
                    : 'No client',
            };

            if (daysDiff < 0) {
                overdue.push(item);
            } else if (daysDiff === 0) {
                todayReminders.push(item);
            } else if (daysDiff === 1) {
                tomorrowReminders.push(item);
            } else {
                upcoming.push(item);
            }
        });

        const getPriorityColor = (priority: string) => {
            switch (priority) {
                case 'urgent': return { bg: '#fee2e2', color: '#991b1b' };
                case 'high': return { bg: '#fef3c7', color: '#92400e' };
                case 'medium': return { bg: '#dbeafe', color: '#1e40af' };
                case 'low': return { bg: '#e5e7eb', color: '#374151' };
                default: return { bg: '#e5e7eb', color: '#374151' };
            }
        };

        // Build email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .section { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
        .section-header { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .reminder { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
        .reminder.overdue { border-left-color: #dc2626; }
        .reminder.today { border-left-color: #ea580c; }
        .reminder.tomorrow { border-left-color: #ca8a04; }
        .reminder-title { font-weight: bold; color: #1f2937; margin-bottom: 8px; }
        .reminder-priority { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px; text-transform: uppercase; }
        .client-name { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Daily Reminders</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        ${overdue.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #dc2626;">🚨 Overdue (${overdue.length})</div>
            ${overdue.map(r => {
                const priorityStyle = getPriorityColor(r.priority);
                return `
            <div class="reminder overdue">
                <div class="reminder-title">${r.title}
                    <span class="reminder-priority" style="background: ${priorityStyle.bg}; color: ${priorityStyle.color};">${r.priority}</span>
                </div>
                <div class="client-name">📍 ${r.clientName}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.description.substring(0, 150)}${r.description.length > 150 ? '...' : ''}</div>
                <div style="font-size: 12px; color: #dc2626; margin-top: 8px;">Due: ${r.reminderDate.toLocaleDateString()}</div>
            </div>
            `}).join('')}
        </div>
        ` : ''}

        ${todayReminders.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #ea580c;">📌 Today (${todayReminders.length})</div>
            ${todayReminders.map(r => {
                const priorityStyle = getPriorityColor(r.priority);
                return `
            <div class="reminder today">
                <div class="reminder-title">${r.title}
                    <span class="reminder-priority" style="background: ${priorityStyle.bg}; color: ${priorityStyle.color};">${r.priority}</span>
                </div>
                <div class="client-name">📍 ${r.clientName}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.description.substring(0, 150)}${r.description.length > 150 ? '...' : ''}</div>
            </div>
            `}).join('')}
        </div>
        ` : ''}

        ${tomorrowReminders.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #ca8a04;">⏰ Tomorrow (${tomorrowReminders.length})</div>
            ${tomorrowReminders.map(r => {
                const priorityStyle = getPriorityColor(r.priority);
                return `
            <div class="reminder tomorrow">
                <div class="reminder-title">${r.title}
                    <span class="reminder-priority" style="background: ${priorityStyle.bg}; color: ${priorityStyle.color};">${r.priority}</span>
                </div>
                <div class="client-name">📍 ${r.clientName}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.description.substring(0, 150)}${r.description.length > 150 ? '...' : ''}</div>
            </div>
            `}).join('')}
        </div>
        ` : ''}

        ${upcoming.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #2563eb;">📋 Upcoming (${upcoming.length})</div>
            ${upcoming.slice(0, 5).map(r => {
                const priorityStyle = getPriorityColor(r.priority);
                return `
            <div class="reminder">
                <div class="reminder-title">${r.title}
                    <span class="reminder-priority" style="background: ${priorityStyle.bg}; color: ${priorityStyle.color};">${r.priority}</span>
                </div>
                <div class="client-name">📍 ${r.clientName}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.description.substring(0, 150)}${r.description.length > 150 ? '...' : ''}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">Due: ${r.reminderDate.toLocaleDateString()}</div>
            </div>
            `}).join('')}
            ${upcoming.length > 5 ? `<div style="text-align: center; color: #6b7280; margin-top: 10px;">+ ${upcoming.length - 5} more upcoming</div>` : ''}
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reminders" class="button">View All Reminders</a>
        </div>

        <div class="footer">
            <p>XDigital Client Management System</p>
            <p>You're receiving this because you have ${reminders.length} pending reminder${reminders.length !== 1 ? 's' : ''}</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send email
        const emailResult = await sendEmail({
            to: adminEmail,
            subject: `Daily Reminders: ${overdue.length + todayReminders.length} need attention`,
            html: emailHtml,
        });

        if (!emailResult.success) {
            return { success: false, error: 'Failed to send email' };
        }

        // Update or create email log
        await ReminderEmailLog.findOneAndUpdate(
            { adminEmail },
            {
                lastSentDate: new Date(),
                $inc: { reminderCount: 1 },
            },
            { upsert: true }
        );

        return {
            success: true,
            data: {
                sent: true,
                reminderCount: reminders.length,
                overdue: overdue.length,
                today: todayReminders.length,
                tomorrow: tomorrowReminders.length,
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'checkAndSendReminderEmail' });
        return { success: false, error: 'Failed to check and send reminder email' };
    }
}

// Get all clients for dropdown selection (admin only)
export async function getAllClients(): Promise<ActionResponse> {
    try {
        await requireAdmin();

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const clients = await User.find({ isActive: true })
            .select('_id firstName lastName email')
            .sort({ firstName: 1, lastName: 1 })
            .lean();

        const serializedClients = clients.map(client => ({
            _id: client._id.toString(),
            name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
            email: client.email,
        }));

        return { success: true, data: serializedClients };
    } catch (error) {
        logError(error as Error, { context: 'getAllClients' });
        return { success: false, error: 'Failed to fetch clients' };
    }
}
