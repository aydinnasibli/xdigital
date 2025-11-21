// app/admin/messages/page.tsx
import { getAllMessages } from '@/app/actions/admin/messages';
import { getAllProjects } from '@/app/actions/admin/projects';
import MessagesClient from './MessagesClient';

export default async function AdminMessagesPage() {
    const [messagesResult, projectsResult] = await Promise.all([
        getAllMessages({}),
        getAllProjects({}),
    ]);

    const messages = messagesResult.success ? messagesResult.data : [];
    const projects = projectsResult.success ? projectsResult.data : [];

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
        />
    );
}
