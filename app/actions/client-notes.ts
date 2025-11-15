// app/actions/client-notes.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import ClientNote, { NoteType } from '@/models/ClientNote';
import User from '@/models/User';
import mongoose from 'mongoose';

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
        console.error('Error fetching client notes:', error);
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
                ...note.toObject(),
                _id: note._id.toString(),
            },
        };
    } catch (error) {
        console.error('Error creating client note:', error);
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

        return { success: true, data: note.toObject() };
    } catch (error) {
        console.error('Error updating client note:', error);
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
        console.error('Error deleting client note:', error);
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

        return { success: true, data: note.toObject() };
    } catch (error) {
        console.error('Error toggling note pin:', error);
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
            clientId: {
                ...note.clientId,
                _id: note.clientId._id.toString(),
            },
            authorId: {
                ...note.authorId,
                _id: note.authorId._id.toString(),
            },
        }));

        return { success: true, data: serializedNotes };
    } catch (error) {
        console.error('Error fetching upcoming reminders:', error);
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
        console.error('Error marking reminder as sent:', error);
        return { success: false, error: 'Failed to mark reminder' };
    }
}
