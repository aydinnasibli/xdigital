// app/admin/clients/[id]/ClientNotesSection.tsx
'use client';

import { useState } from 'react';
import {
    createClientNote,
    updateClientNote,
    deleteClientNote,
    toggleNotePin,
} from '@/app/actions/client-notes';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Pin, Save, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { NoteType } from '@/models/ClientNote';

interface Note {
    _id: string;
    type: string;
    title?: string;
    content: string;
    tags?: string[];
    isPinned: boolean;
    reminderDate?: string;
    authorId: {
        firstName: string;
        lastName: string;
        imageUrl?: string;
    };
    authorName: string;
    createdAt: string;
    updatedAt: string;
}

export default function ClientNotesSection({ clientId, notes }: { clientId: string; notes: Note[] }) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: NoteType.GENERAL,
        title: '',
        content: '',
        tags: [] as string[],
        isPinned: false,
        reminderDate: '',
    });

    const [tagInput, setTagInput] = useState('');

    const resetForm = () => {
        setFormData({
            type: NoteType.GENERAL,
            title: '',
            content: '',
            tags: [],
            isPinned: false,
            reminderDate: '',
        });
        setTagInput('');
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim().toLowerCase()],
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag),
        });
    };

    const handleSubmit = async () => {
        if (!formData.content.trim()) {
            toast.error('Please enter note content');
            return;
        }

        setLoading(true);

        const data = {
            ...formData,
            reminderDate: formData.reminderDate ? new Date(formData.reminderDate) : undefined,
        };

        const result = editingId
            ? await updateClientNote(editingId, data)
            : await createClientNote({ ...data, clientId });

        if (result.success) {
            toast.success(editingId ? 'Note updated successfully' : 'Note created successfully');
            resetForm();
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to save note');
        }
        setLoading(false);
    };

    const handleEdit = (note: Note) => {
        setFormData({
            type: note.type as NoteType,
            title: note.title || '',
            content: note.content,
            tags: note.tags || [],
            isPinned: note.isPinned,
            reminderDate: note.reminderDate ? new Date(note.reminderDate).toISOString().split('T')[0] : '',
        });
        setEditingId(note._id);
        setIsAdding(true);
    };

    const handleDelete = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        setLoading(true);
        const result = await deleteClientNote(noteId);
        if (result.success) {
            toast.success('Note deleted successfully');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to delete note');
        }
        setLoading(false);
    };

    const handleTogglePin = async (noteId: string) => {
        const result = await toggleNotePin(noteId);
        if (result.success) {
            toast.success('Note pinned status updated');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update pin status');
        }
    };

    const getNoteTypeColor = (type: string) => {
        const colors = {
            general: 'bg-gray-100 text-gray-800',
            important: 'bg-red-100 text-red-800',
            risk: 'bg-orange-100 text-orange-800',
            opportunity: 'bg-green-100 text-green-800',
            feedback: 'bg-blue-100 text-blue-800',
            reminder: 'bg-purple-100 text-purple-800',
        };
        return colors[type as keyof typeof colors] || colors.general;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Client Notes ({notes.length})</h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Note
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingId ? 'Edit Note' : 'New Note'}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as NoteType })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value={NoteType.GENERAL}>General</option>
                                    <option value={NoteType.IMPORTANT}>Important</option>
                                    <option value={NoteType.RISK}>Risk</option>
                                    <option value={NoteType.OPPORTUNITY}>Opportunity</option>
                                    <option value={NoteType.FEEDBACK}>Feedback</option>
                                    <option value={NoteType.REMINDER}>Reminder</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reminder Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.reminderDate}
                                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="Note title..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="Enter note content..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="Add tag and press Enter..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    <Tag className="w-4 h-4" />
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-blue-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isPinned}
                                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                className="rounded"
                            />
                            <label className="text-sm text-gray-700">Pin this note</label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : editingId ? 'Update Note' : 'Save Note'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="space-y-3">
                {notes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notes yet</p>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note._id}
                            className={`border rounded-lg p-4 ${note.isPinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {note.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                                        <span className={`text-xs px-2 py-1 rounded-full ${getNoteTypeColor(note.type)}`}>
                                            {note.type}
                                        </span>
                                        {note.title && (
                                            <h4 className="font-semibold text-gray-900">{note.title}</h4>
                                        )}
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {note.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {note.reminderDate && (
                                        <p className="text-xs text-purple-600 mt-2">
                                            Reminder: {new Date(note.reminderDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                        <span>{note.authorName}</span>
                                        <span>•</span>
                                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                                        {note.updatedAt !== note.createdAt && (
                                            <>
                                                <span>•</span>
                                                <span>Updated {new Date(note.updatedAt).toLocaleString()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleTogglePin(note._id)}
                                        className={`p-2 rounded-lg transition ${note.isPinned
                                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Toggle pin"
                                    >
                                        <Pin className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(note)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        title="Edit note"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Delete note"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
