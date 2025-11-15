// app/admin/templates/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTemplate } from '@/app/actions/project-templates';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateTemplatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serviceType: 'web_development',
        package: 'basic',
        estimatedDurationDays: 30,
        isDefault: false,
    });

    const [milestones, setMilestones] = useState([{ name: '', durationDays: 0, order: 1 }]);
    const [deliverables, setDeliverables] = useState([{ name: '', description: '', order: 1 }]);
    const [tasks, setTasks] = useState([{ name: '', description: '', estimatedHours: 0, order: 1 }]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await createTemplate({
                name: formData.name,
                description: formData.description || undefined,
                serviceType: formData.serviceType,
                package: formData.package,
                estimatedDurationDays: formData.estimatedDurationDays,
                milestones: milestones.filter(m => m.name.trim()),
                deliverables: deliverables.filter(d => d.name.trim()),
                tasks: tasks.filter(t => t.name.trim()),
                isDefault: formData.isDefault,
            });

            if (result.success) {
                router.push('/admin/templates');
            } else {
                setError(result.error || 'Failed to create template');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const updateMilestone = (index: number, field: string, value: any) => {
        const newMilestones = [...milestones];
        newMilestones[index] = { ...newMilestones[index], [field]: value };
        setMilestones(newMilestones);
    };

    const addMilestone = () => {
        setMilestones([...milestones, { name: '', durationDays: 0, order: milestones.length + 1 }]);
    };

    const removeMilestone = (index: number) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((_, i) => i !== index));
        }
    };

    const updateDeliverable = (index: number, field: string, value: any) => {
        const newDeliverables = [...deliverables];
        newDeliverables[index] = { ...newDeliverables[index], [field]: value };
        setDeliverables(newDeliverables);
    };

    const addDeliverable = () => {
        setDeliverables([...deliverables, { name: '', description: '', order: deliverables.length + 1 }]);
    };

    const removeDeliverable = (index: number) => {
        if (deliverables.length > 1) {
            setDeliverables(deliverables.filter((_, i) => i !== index));
        }
    };

    const updateTask = (index: number, field: string, value: any) => {
        const newTasks = [...tasks];
        newTasks[index] = { ...newTasks[index], [field]: value };
        setTasks(newTasks);
    };

    const addTask = () => {
        setTasks([...tasks, { name: '', description: '', estimatedHours: 0, order: tasks.length + 1 }]);
    };

    const removeTask = (index: number) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/templates"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Project Template</h1>
                    <p className="text-gray-600 mt-2">Create a reusable template for new projects</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Template Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Basic Website Package"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe this template..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type *
                            </label>
                            <select
                                required
                                value={formData.serviceType}
                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="web_development">Web Development</option>
                                <option value="social_media">Social Media Marketing</option>
                                <option value="digital_solutions">Digital Solutions</option>
                                <option value="branding">Branding</option>
                                <option value="consulting">Consulting</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package *
                            </label>
                            <select
                                required
                                value={formData.package}
                                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="basic">Basic</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (Days) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.estimatedDurationDays}
                                onChange={(e) => setFormData({ ...formData, estimatedDurationDays: parseInt(e.target.value) || 1 })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Set as default template for this service type</span>
                    </label>
                </div>

                {/* Milestones */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
                        <button
                            type="button"
                            onClick={addMilestone}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add Milestone
                        </button>
                    </div>

                    <div className="space-y-3">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    value={milestone.name}
                                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Milestone name"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={milestone.durationDays}
                                    onChange={(e) => updateMilestone(index, 'durationDays', parseInt(e.target.value) || 0)}
                                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Days"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeMilestone(index)}
                                    disabled={milestones.length === 1}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deliverables */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Deliverables</h2>
                        <button
                            type="button"
                            onClick={addDeliverable}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add Deliverable
                        </button>
                    </div>

                    <div className="space-y-3">
                        {deliverables.map((deliverable, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    value={deliverable.name}
                                    onChange={(e) => updateDeliverable(index, 'name', e.target.value)}
                                    className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Deliverable name"
                                />
                                <input
                                    type="text"
                                    value={deliverable.description}
                                    onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Description"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeDeliverable(index)}
                                    disabled={deliverables.length === 1}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                        <button
                            type="button"
                            onClick={addTask}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tasks.map((task, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    value={task.name}
                                    onChange={(e) => updateTask(index, 'name', e.target.value)}
                                    className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Task name"
                                />
                                <input
                                    type="text"
                                    value={task.description}
                                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Description"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={task.estimatedHours}
                                    onChange={(e) => updateTask(index, 'estimatedHours', parseFloat(e.target.value) || 0)}
                                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Hours"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTask(index)}
                                    disabled={tasks.length === 1}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Template'}
                    </button>
                    <Link
                        href="/admin/templates"
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
