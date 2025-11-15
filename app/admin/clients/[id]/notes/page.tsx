// app/admin/clients/[id]/notes/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getClientNotes } from '@/app/actions/client-notes';
import Link from 'next/link';

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

    const getNoteTypeColor = (type: string) => {
        switch (type) {
            case 'general':
                return 'bg-gray-100 text-gray-800';
            case 'meeting':
                return 'bg-blue-100 text-blue-800';
            case 'call':
                return 'bg-green-100 text-green-800';
            case 'reminder':
                return 'bg-yellow-100 text-yellow-800';
            case 'important':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getNoteIcon = (type: string) => {
        switch (type) {
            case 'meeting': return '🤝';
            case 'call': return '📞';
            case 'reminder': return '⏰';
            case 'important': return '⚠️';
            default: return '📝';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/admin/clients/${clientId}`} className="text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Client
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Client Notes</h1>
                    <p className="text-gray-600 mt-2">Private notes and reminders (not visible to client)</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add New Note
                </button>
            </div>

            {/* Pinned Notes */}
            {notes.filter((n: any) => n.isPinned).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="font-semibold text-yellow-900 mb-4">📌 Pinned Notes</h2>
                    <div className="space-y-3">
                        {notes.filter((n: any) => n.isPinned).map((note: any) => (
                            <div key={note._id} className="bg-white p-4 rounded-lg border">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="text-2xl">{getNoteIcon(note.type)}</span>
                                        <div className="flex-1">
                                            {note.title && (
                                                <h4 className="font-medium text-gray-900">{note.title}</h4>
                                            )}
                                            <p className="text-gray-700 text-sm mt-1">{note.content}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span className={`px-2 py-1 rounded ${getNoteTypeColor(note.type)}`}>
                                                    {note.type}
                                                </span>
                                                <span>{note.authorName}</span>
                                                <span>•</span>
                                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-yellow-500 text-xl">📌</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Notes */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">All Notes ({notes.length})</h2>
                </div>
                {notes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📝</div>
                        <p>No notes yet</p>
                        <p className="text-sm mt-2">Add notes to track client interactions and important information</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notes.map((note: any) => (
                            <div key={note._id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">{getNoteIcon(note.type)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                {note.title && (
                                                    <h4 className="font-semibold text-gray-900">{note.title}</h4>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded ${getNoteTypeColor(note.type)}`}>
                                                        {note.type}
                                                    </span>
                                                    {note.tags && note.tags.map((tag: string) => (
                                                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {note.isPinned && (
                                                <span className="text-yellow-500 text-xl">📌</span>
                                            )}
                                        </div>

                                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>

                                        {note.reminderDate && (
                                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                                <span className="font-medium text-yellow-900">⏰ Reminder: </span>
                                                <span className="text-yellow-800">
                                                    {new Date(note.reminderDate).toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-3 text-xs text-gray-500">
                                            <span className="font-medium">{note.authorName}</span>
                                            <span> • </span>
                                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                                            {note.updatedAt !== note.createdAt && (
                                                <>
                                                    <span> • </span>
                                                    <span>Updated {new Date(note.updatedAt).toLocaleString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
