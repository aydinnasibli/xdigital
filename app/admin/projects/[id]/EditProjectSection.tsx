// app/admin/projects/[id]/EditProjectSection.tsx
'use client';

import { useState } from 'react';
import { updateAdminProject } from '@/app/actions/admin/projects';
import { useRouter } from 'next/navigation';
import { Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProjectSection({
    project,
}: {
    project: {
        _id: string;
        projectName: string;
        projectDescription: string;
        serviceType: string;
        package: string;
    };
}) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        serviceType: project.serviceType,
        package: project.package,
    });

    const handleSave = async () => {
        setLoading(true);
        const result = await updateAdminProject(project._id, formData);

        if (result.success) {
            toast.success('Project details updated successfully');
            setIsEditing(false);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update project');
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            projectName: project.projectName,
            projectDescription: project.projectDescription,
            serviceType: project.serviceType,
            package: project.package,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Project Details
                </h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Edit Details
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.projectDescription}
                            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type
                            </label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                disabled={loading}
                            >
                                <option value="web_development">Web Development</option>
                                <option value="social_media_marketing">Social Media Marketing</option>
                                <option value="digital_solutions">Digital Solutions</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package
                            </label>
                            <select
                                value={formData.package}
                                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                disabled={loading}
                            >
                                <option value="basic">Basic</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <span className="text-sm font-medium text-gray-600">Project Name:</span>
                        <p className="text-gray-900">{project.projectName}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-600">Description:</span>
                        <p className="text-gray-900">{project.projectDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Service Type:</span>
                            <p className="text-gray-900 capitalize">{project.serviceType.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-600">Package:</span>
                            <p className="text-gray-900 capitalize">{project.package}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
