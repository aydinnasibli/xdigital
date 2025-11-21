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
import { requireAdmin } from '@/lib/auth/admin';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all notes for a client (admin only)
export async function getClientNotes(clientId: string): Promise<ActionResponse> {
    try {
        await requireAdmin();
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const notes = await ClientNote.find({ clientId })
            .populate('authorId', 'firstName lastName email imageUrl')
            .sort({ isPinned: -1, createdAt: -1 })
            .lean();

        const serializedNotes = notes.map(note => {
            type PopulatedAuthor = { _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string; email: string; imageUrl?: string };
            const author = note.authorId as unknown as PopulatedAuthor;

            return {
                ...toSerializedObject<Record<string, unknown>>(note),
                clientId: note.clientId.toString(),
                authorId: toSerializedObject(author),
            };
        });

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
        await requireAdmin();
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
        await requireAdmin();
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
        await requireAdmin();
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
