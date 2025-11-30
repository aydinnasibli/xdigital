'use client';

import { useState, useEffect } from 'react';
import {
    Bell,
    Calendar,
    Clock,
    User,
    Plus,
    Edit,
    Trash2,
    Check,
    X,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Search,
    Filter,
} from 'lucide-react';
import {
    getAllReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderCompleted,
    getAllClients,
} from '@/app/actions/reminders';
import { toast } from 'sonner';
import { ReminderPriority } from '@/models/Reminder';

interface Client {
    _id: string;
    name: string;
    email: string;
}

interface Reminder {
    _id: string;
    title: string;
    description: string;
    reminderDate: string;
    priority: ReminderPriority;
    isCompleted: boolean;
    completedAt?: string;
    clientId?: string;
    clientName?: string;
    tags?: string[];
    createdBy: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

interface ReminderFormData {
    title: string;
    description: string;
    reminderDate: string;
    priority: ReminderPriority;
    clientId?: string;
    tags: string;
}

const emptyFormData: ReminderFormData = {
    title: '',
    description: '',
    reminderDate: '',
    priority: ReminderPriority.MEDIUM,
    clientId: '',
    tags: '',
};

export default function RemindersDashboard() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ReminderFormData>(emptyFormData);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadData();
    }, [days, filter]);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadReminders(), loadClients()]);
        setLoading(false);
    };

    const loadReminders = async () => {
        const result = await getAllReminders({
            includeCompleted: filter !== 'active',
            days: filter === 'all' ? undefined : days,
        });
        if (result.success) {
            setReminders(result.data || []);
        } else {
            toast.error(result.error || 'Failed to load reminders');
        }
    };

    const loadClients = async () => {
        const result = await getAllClients();
        if (result.success) {
            setClients(result.data || []);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = {
            title: formData.title,
            description: formData.description,
            reminderDate: new Date(formData.reminderDate),
            priority: formData.priority,
            clientId: formData.clientId || undefined,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        };

        const result = editingId
            ? await updateReminder(editingId, data)
            : await createReminder(data);

        if (result.success) {
            toast.success(editingId ? 'Reminder updated' : 'Reminder created');
            setShowForm(false);
            setEditingId(null);
            setFormData(emptyFormData);
            loadReminders();
        } else {
            toast.error(result.error || 'Failed to save reminder');
        }
        setSubmitting(false);
    };

    const handleEdit = (reminder: Reminder) => {
        setEditingId(reminder._id);
        setFormData({
            title: reminder.title,
            description: reminder.description,
            reminderDate: new Date(reminder.reminderDate).toISOString().slice(0, 16),
            priority: reminder.priority,
            clientId: reminder.clientId || '',
            tags: reminder.tags?.join(', ') || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this reminder?')) return;

        const result = await deleteReminder(id);
        if (result.success) {
            toast.success('Reminder deleted');
            loadReminders();
        } else {
            toast.error(result.error || 'Failed to delete reminder');
        }
    };

    const handleToggleComplete = async (id: string, isCompleted: boolean) => {
        if (isCompleted) {
            toast.info('Reminder is already completed');
            return;
        }

        const result = await markReminderCompleted(id);
        if (result.success) {
            toast.success('Reminder marked as completed');
            loadReminders();
        } else {
            toast.error(result.error || 'Failed to update reminder');
        }
    };

    const getPriorityColor = (priority: ReminderPriority) => {
        const colors = {
            [ReminderPriority.LOW]: 'bg-gray-100 text-gray-800 border-gray-300',
            [ReminderPriority.MEDIUM]: 'bg-blue-100 text-blue-800 border-blue-300',
            [ReminderPriority.HIGH]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            [ReminderPriority.URGENT]: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[priority] || colors[ReminderPriority.MEDIUM];
    };

    const getTimeUntil = (dateString: string) => {
        const now = new Date();
        const reminderDate = new Date(dateString);
        const diff = reminderDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) return { text: 'Overdue', color: 'text-red-600 bg-red-50' };
        if (daysDiff === 0) return { text: 'Today', color: 'text-orange-600 bg-orange-50' };
        if (daysDiff === 1) return { text: 'Tomorrow', color: 'text-yellow-600 bg-yellow-50' };
        if (daysDiff <= 7) return { text: `In ${daysDiff} days`, color: 'text-green-600 bg-green-50' };
        return { text: `In ${daysDiff} days`, color: 'text-blue-600 bg-blue-50' };
    };

    const filteredReminders = reminders.filter(r => {
        if (filter === 'active' && r.isCompleted) return false;
        if (filter === 'completed' && !r.isCompleted) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.clientName?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const stats = {
        total: reminders.length,
        active: reminders.filter(r => !r.isCompleted).length,
        completed: reminders.filter(r => r.isCompleted).length,
        overdue: reminders.filter(r => new Date(r.reminderDate) < new Date() && !r.isCompleted).length,
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Active</p>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Completed</p>
                            <p className="text-2xl font-bold text-white">{stats.completed}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Overdue</p>
                            <p className="text-2xl font-bold text-white">{stats.overdue}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${
                                    filter === 'all' ? 'bg-black/40 backdrop-blur-xl shadow-sm font-medium' : 'text-gray-600'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('active')}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${
                                    filter === 'active' ? 'bg-black/40 backdrop-blur-xl shadow-sm font-medium' : 'text-gray-600'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${
                                    filter === 'completed' ? 'bg-black/40 backdrop-blur-xl shadow-sm font-medium' : 'text-gray-600'
                                }`}
                            >
                                Completed
                            </button>
                        </div>

                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value={7}>Next 7 days</option>
                            <option value={14}>Next 14 days</option>
                            <option value={30}>Next 30 days</option>
                            <option value={60}>Next 60 days</option>
                            <option value={90}>Next 90 days</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reminders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadReminders}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white/5 flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => {
                                setShowForm(true);
                                setEditingId(null);
                                setFormData(emptyFormData);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Reminder
                        </button>
                    </div>
                </div>
            </div>

            {/* Reminders List */}
            <div className="bg-black/40 backdrop-blur-xl rounded-lg border shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Loading reminders...</p>
                    </div>
                ) : filteredReminders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No reminders found</p>
                        <p className="text-sm mt-1">Create your first reminder to get started</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredReminders.map((reminder) => {
                            const timeInfo = getTimeUntil(reminder.reminderDate);
                            return (
                                <div
                                    key={reminder._id}
                                    className={`p-6 hover:bg-white/5 transition ${
                                        reminder.isCompleted ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h3 className="font-semibold text-white">{reminder.title}</h3>
                                                <span
                                                    className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(
                                                        reminder.priority
                                                    )}`}
                                                >
                                                    {reminder.priority}
                                                </span>
                                                {!reminder.isCompleted && (
                                                    <span className={`px-2 py-1 text-xs rounded font-medium ${timeInfo.color}`}>
                                                        {timeInfo.text}
                                                    </span>
                                                )}
                                                {reminder.isCompleted && (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">{reminder.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                {reminder.clientName ? (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {reminder.clientName}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-gray-400">
                                                        <User className="w-3 h-3" />
                                                        No client
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(reminder.reminderDate).toLocaleDateString()} at{' '}
                                                    {new Date(reminder.reminderDate).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                <span>•</span>
                                                <span>By {reminder.createdByName}</span>
                                                {reminder.tags && reminder.tags.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            {reminder.tags.map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!reminder.isCompleted && (
                                                <button
                                                    onClick={() => handleToggleComplete(reminder._id, reminder.isCompleted)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                    title="Mark as completed"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(reminder)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit reminder"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reminder._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete reminder"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-black/40 backdrop-blur-xl rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">
                                    {editingId ? 'Edit Reminder' : 'Create New Reminder'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData(emptyFormData);
                                    }}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={200}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Follow up with client about proposal"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    maxLength={2000}
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Add details about what needs to be done..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reminder Date & Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={formData.reminderDate}
                                        onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Must be a future date and time</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.priority}
                                        onChange={(e) =>
                                            setFormData({ ...formData, priority: e.target.value as ReminderPriority })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value={ReminderPriority.LOW}>Low</option>
                                        <option value={ReminderPriority.MEDIUM}>Medium</option>
                                        <option value={ReminderPriority.HIGH}>High</option>
                                        <option value={ReminderPriority.URGENT}>Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Related Client <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">No client (General reminder)</option>
                                    {clients.map((client) => (
                                        <option key={client._id} value={client._id}>
                                            {client.name} ({client.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Link this reminder to a specific client for better context in emails
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., urgent, follow-up, proposal (comma-separated)"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData(emptyFormData);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white/5"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            {editingId ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>{editingId ? 'Update Reminder' : 'Create Reminder'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
