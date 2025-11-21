// app/admin/messages/page.tsx
import { getAllMessages } from '@/app/actions/admin/messages';
import MessagesClient from './MessagesClient';

interface PageProps {
    searchParams: Promise<{ unreadOnly?: string }>;
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const result = await getAllMessages({
        unreadOnly: params.unreadOnly === 'true',
    });

    const messages = result.success ? result.data : [];

    return (
        <MessagesClient
            initialMessages={messages}
            unreadOnly={params.unreadOnly === 'true'}
        />
    );
}