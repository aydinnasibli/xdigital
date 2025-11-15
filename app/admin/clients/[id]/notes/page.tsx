// app/admin/clients/[id]/notes/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getClientNotes } from '@/app/actions/client-notes';
import ClientNotesContent from './ClientNotesContent';

export default async function ClientNotesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const { id: clientId } = await params;
    const notesResult = await getClientNotes(clientId);
    const notes = notesResult.success ? notesResult.data : [];

    return <ClientNotesContent clientId={clientId} initialNotes={notes} />;
}
