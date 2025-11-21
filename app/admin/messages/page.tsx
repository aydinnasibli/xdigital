// app/admin/messages/page.tsx
import { getAllMessages } from '@/app/actions/admin/messages';
import { getAllProjects } from '@/app/actions/admin/projects';
import { getAdminSession } from '@/lib/auth/admin';
import dbConnect from '@/lib/database/mongodb';
import mongoose from 'mongoose';
import MessagesClient from './MessagesClient';

export default async function AdminMessagesPage() {
    const [messagesResult, projectsResult] = await Promise.all([
        getAllMessages({}),
        getAllProjects({}),
    ]);

    const messages = messagesResult.success ? messagesResult.data : [];
    const projects = projectsResult.success ? projectsResult.data : [];

    // Get current admin user ID
    const { userId: clerkUserId } = await getAdminSession();
    await dbConnect();
    const User = mongoose.model('User');
    const adminUser = await User.findOne({ clerkId: clerkUserId }).lean();
    const currentAdminUserId = adminUser?._id?.toString() || null;

    // Transform projects to the format needed by the client
    const availableProjects = projects.map((project: any) => ({
        _id: project._id,
        projectName: project.projectName,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
    }));

    return (
        <MessagesClient
            initialMessages={messages}
            availableProjects={availableProjects}
            currentAdminUserId={currentAdminUserId}
        />
    );
}
