// app/admin/clients/[id]/notes/ClientNotesContent.tsx
'use client';

import { useState } from 'react';
import { createClientNote, toggleNotePin } from '@/app/actions/client-notes';
import { Plus, X, Pin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Note {
    _id: string;
    type: string;
    title?: string;
    content: string;
    tags?: string[];
    isPinned: boolean;
    reminderDate?: Date;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function ClientNotesContent({ clientId, initialNotes }: { clientId: string; initialNotes: Note[] }) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState(initialNotes);

    const [formData, setFormData] = useState({
        type: 'general',
        title: '',
        content: '',
        tags: '',
        reminderDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await createClientNote({
                clientId,
                type: formData.type as any,
                title: formData.title || undefined,
                content: formData.content,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                reminderDate: formData.reminderDate ? new Date(formData.reminderDate) : undefined,
            });

            if (result.success) {
                setShowForm(false);
                setFormData({ type: 'general', title: '', content: '', tags: '', reminderDate: '' });
                router.refresh();
            } else {
                setError(result.error || 'Failed to create note');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePin = async (noteId: string) => {
        try {
            const result = await toggleNotePin(noteId);
            if (result.success) {
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to toggle pin');
        }
    };

    const getNoteTypeColor = (type: string) => {
        switch (type) {
            case 'general': return 'bg-gray-100 text-gray-800';
            case 'meeting': return 'bg-blue-100 text-blue-800';
            case 'call': return 'bg-green-100 text-green-800';
            case 'reminder': return 'bg-yellow-100 text-yellow-800';
            case 'important': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const pinnedNotes = notes.filter(n => n.isPinned);

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
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    {showForm ? (
                        <>
                            <X className="w-4 h-4" />
                            Cancel
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            Add New Note
                        </>
                    )}
                </button>
            </div>

            {/* Add Note Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">New Note</h2>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note Type *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="general">General</option>
                                <option value="meeting">Meeting</option>
                                <option value="call">Call</option>
                                <option value="reminder">Reminder</option>
                                <option value="important">Important</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Note title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content *
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Write your note..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., urgent, follow-up"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reminder Date (optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.reminderDate}
                                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Note'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="font-semibold text-yellow-900 mb-4">📌 Pinned Notes</h2>
                    <div className="space-y-3">
                        {pinnedNotes.map((note) => (
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
                                    <button
                                        onClick={() => handleTogglePin(note._id)}
                                        className="text-yellow-500 hover:text-yellow-600 p-1"
                                    >
                                        <Pin className="w-5 h-5 fill-current" />
                                    </button>
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
                        {notes.map((note) => (
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
                                                    {note.tags && note.tags.map((tag) => (
                                                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePin(note._id)}
                                                className={`p-1 ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                            >
                                                <Pin className={`w-5 h-5 ${note.isPinned ? 'fill-current' : ''}`} />
                                            </button>
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
