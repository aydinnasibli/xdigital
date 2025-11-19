// app/actions/client-notes.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import ClientNote, { NoteType } from '@/models/ClientNote';
import User from '@/models/User';
import mongoose from 'mongoose';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';
import ReminderEmailLog from '@/models/ReminderEmailLog';
import { sendEmail } from '@/lib/services/email.service';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all notes for a client (admin only)
export async function getClientNotes(clientId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const notes = await ClientNote.find({ clientId })
            .populate('authorId', 'firstName lastName email imageUrl')
            .sort({ isPinned: -1, createdAt: -1 })
            .lean();

        const serializedNotes = notes.map(note => ({
            ...note,
            _id: note._id.toString(),
            clientId: note.clientId.toString(),
            authorId: {
                ...note.authorId,
                _id: note.authorId._id.toString(),
            },
        }));

        return { success: true, data: serializedNotes };
    } catch (error) {
        logError(error as Error, { context: 'getClientNotes', clientId });
        return { success: false, error: 'Failed to fetch client notes' };
    }
}

// Create note (admin only)
export async function createClientNote(data: {
    clientId: string;
    type: NoteType;
    title?: string;
    content: string;
    tags?: string[];
    isPinned?: boolean;
    reminderDate?: Date;
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const client = await User.findById(data.clientId);
        if (!client) {
            return { success: false, error: 'Client not found' };
        }

        const note = await ClientNote.create({
            ...data,
            clerkClientId: client.clerkId,
            authorId: user._id,
            authorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        });

        revalidatePath(`/admin/clients/${data.clientId}`);

        return {
            success: true,
            data: {
                ...toSerializedObject(note),
                _id: note._id.toString(),
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'createClientNote', clientId: data.clientId });
        return { success: false, error: 'Failed to create client note' };
    }
}

// Update note (admin only)
export async function updateClientNote(noteId: string, data: Partial<{
    type: NoteType;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    reminderDate: Date;
}>): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const note = await ClientNote.findByIdAndUpdate(
            noteId,
            data,
            { new: true }
        );

        if (!note) {
            return { success: false, error: 'Note not found' };
        }

        revalidatePath(`/admin/clients/${note.clientId}`);

        return { success: true, data: toSerializedObject(note) };
    } catch (error) {
        logError(error as Error, { context: 'updateClientNote', noteId });
        return { success: false, error: 'Failed to update client note' };
    }
}

// Delete note (admin only)
export async function deleteClientNote(noteId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const note = await ClientNote.findByIdAndDelete(noteId);

        if (!note) {
            return { success: false, error: 'Note not found' };
        }

        revalidatePath(`/admin/clients/${note.clientId}`);

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'deleteClientNote', noteId });
        return { success: false, error: 'Failed to delete client note' };
    }
}

// Toggle pin (admin only)
export async function toggleNotePin(noteId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const note = await ClientNote.findById(noteId);

        if (!note) {
            return { success: false, error: 'Note not found' };
        }

        note.isPinned = !note.isPinned;
        await note.save();

        revalidatePath(`/admin/clients/${note.clientId}`);

        return { success: true, data: toSerializedObject(note) };
    } catch (error) {
        logError(error as Error, { context: 'toggleNotePin', noteId });
        return { success: false, error: 'Failed to toggle pin' };
    }
}

// Get notes with upcoming reminders (admin only)
export async function getUpcomingReminders(days: number = 7): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const notes = await ClientNote.find({
            reminderDate: {
                $gte: now,
                $lte: futureDate,
            },
            isReminded: false,
        })
            .populate('clientId', 'firstName lastName email')
            .populate('authorId', 'firstName lastName email')
            .sort({ reminderDate: 1 })
            .lean();

        const serializedNotes = notes.map(note => ({
            ...note,
            _id: note._id.toString(),
            clientId: note.clientId._id.toString(),
            clientName: `${note.clientId.firstName || ''} ${note.clientId.lastName || ''}`.trim() || note.clientId.email,
            authorName: `${note.authorId.firstName || ''} ${note.authorId.lastName || ''}`.trim() || note.authorId.email,
        }));

        return { success: true, data: serializedNotes };
    } catch (error) {
        logError(error as Error, { context: 'getUpcomingReminders', days });
        return { success: false, error: 'Failed to fetch reminders' };
    }
}

// Mark reminder as sent (admin only)
export async function markReminderSent(noteId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const note = await ClientNote.findByIdAndUpdate(
            noteId,
            { isReminded: true },
            { new: true }
        );

        if (!note) {
            return { success: false, error: 'Note not found' };
        }

        return { success: true };
    } catch (error) {
        logError(error as Error, { context: 'markReminderSent', noteId });
        return { success: false, error: 'Failed to mark reminder' };
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
        if (!user || user.role !== 'admin') {
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

        // Get reminders for today and tomorrow
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);

        const notes = await ClientNote.find({
            reminderDate: {
                $lte: tomorrow,
            },
            isReminded: false,
        })
            .populate('clientId', 'firstName lastName email')
            .populate('authorId', 'firstName lastName email')
            .sort({ reminderDate: 1 })
            .lean();

        // If no reminders, don't send email
        if (notes.length === 0) {
            return { success: true, data: { noReminders: true } };
        }

        // Group reminders by urgency
        const overdue: any[] = [];
        const today: any[] = [];
        const tomorrow: any[] = [];
        const upcoming: any[] = [];

        notes.forEach(note => {
            const reminderDate = new Date(note.reminderDate);
            const diff = reminderDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

            const reminder = {
                clientName: `${note.clientId.firstName || ''} ${note.clientId.lastName || ''}`.trim() || note.clientId.email,
                title: note.title,
                content: note.content,
                type: note.type,
                reminderDate: reminderDate,
                clientId: note.clientId._id.toString(),
            };

            if (daysDiff < 0) {
                overdue.push(reminder);
            } else if (daysDiff === 0) {
                today.push(reminder);
            } else if (daysDiff === 1) {
                tomorrow.push(reminder);
            } else {
                upcoming.push(reminder);
            }
        });

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
        .client-name { font-weight: bold; color: #1f2937; }
        .reminder-type { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px; }
        .type-risk { background: #fee2e2; color: #991b1b; }
        .type-important { background: #fef3c7; color: #92400e; }
        .type-opportunity { background: #d1fae5; color: #065f46; }
        .type-general { background: #e5e7eb; color: #374151; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Daily Client Reminders</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        ${overdue.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #dc2626;">🚨 Overdue (${overdue.length})</div>
            ${overdue.map(r => `
            <div class="reminder overdue">
                <div class="client-name">${r.clientName}
                    <span class="reminder-type type-${r.type}">${r.type}</span>
                </div>
                <div style="margin: 8px 0; font-weight: 500;">${r.title || 'No title'}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.content.substring(0, 150)}${r.content.length > 150 ? '...' : ''}</div>
                <div style="font-size: 12px; color: #dc2626; margin-top: 8px;">Due: ${r.reminderDate.toLocaleDateString()}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        ${today.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #ea580c;">📌 Today (${today.length})</div>
            ${today.map(r => `
            <div class="reminder today">
                <div class="client-name">${r.clientName}
                    <span class="reminder-type type-${r.type}">${r.type}</span>
                </div>
                <div style="margin: 8px 0; font-weight: 500;">${r.title || 'No title'}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.content.substring(0, 150)}${r.content.length > 150 ? '...' : ''}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        ${tomorrow.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #ca8a04;">⏰ Tomorrow (${tomorrow.length})</div>
            ${tomorrow.map(r => `
            <div class="reminder tomorrow">
                <div class="client-name">${r.clientName}
                    <span class="reminder-type type-${r.type}">${r.type}</span>
                </div>
                <div style="margin: 8px 0; font-weight: 500;">${r.title || 'No title'}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.content.substring(0, 150)}${r.content.length > 150 ? '...' : ''}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        ${upcoming.length > 0 ? `
        <div class="section">
            <div class="section-header" style="color: #2563eb;">📋 Upcoming (${upcoming.length})</div>
            ${upcoming.slice(0, 5).map(r => `
            <div class="reminder">
                <div class="client-name">${r.clientName}
                    <span class="reminder-type type-${r.type}">${r.type}</span>
                </div>
                <div style="margin: 8px 0; font-weight: 500;">${r.title || 'No title'}</div>
                <div style="font-size: 14px; color: #6b7280;">${r.content.substring(0, 150)}${r.content.length > 150 ? '...' : ''}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">Due: ${r.reminderDate.toLocaleDateString()}</div>
            </div>
            `).join('')}
            ${upcoming.length > 5 ? `<div style="text-align: center; color: #6b7280; margin-top: 10px;">+ ${upcoming.length - 5} more upcoming</div>` : ''}
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reminders" class="button">View All Reminders</a>
        </div>

        <div class="footer">
            <p>XDigital Client Management System</p>
            <p>You're receiving this because you have ${notes.length} pending reminder${notes.length !== 1 ? 's' : ''}</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send email
        const emailResult = await sendEmail({
            to: adminEmail,
            subject: `Daily Reminders: ${overdue.length + today.length} need attention`,
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
                reminderCount: notes.length,
                overdue: overdue.length,
                today: today.length,
                tomorrow: tomorrow.length,
            },
        };
    } catch (error) {
        logError(error as Error, { context: 'checkAndSendReminderEmail' });
        return { success: false, error: 'Failed to check and send reminder email' };
    }
}
