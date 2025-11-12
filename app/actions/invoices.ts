'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import mongoose from 'mongoose';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get invoices for a project
export async function getProjectInvoices(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const invoices = await Invoice.find({ projectId, userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        const serializedInvoices = invoices.map(inv => ({
            ...inv,
            _id: inv._id.toString(),
            userId: inv.userId.toString(),
            projectId: inv.projectId.toString(),
        }));

        return { success: true, data: serializedInvoices };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { success: false, error: 'Failed to fetch invoices' };
    }
}