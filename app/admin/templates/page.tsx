// app/admin/templates/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function TemplatesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    // In a real implementation, fetch templates from database
    const templates = [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Templates</h1>
                    <p className="text-gray-600 mt-2">Create and manage reusable project templates</p>
                </div>
                <Link
                    href="/admin/templates/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Create Template
                </Link>
            </div>

            {/* Template Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Web Development</h3>
                    <p className="text-sm text-gray-600 mb-4">Templates for web projects</p>
                    <div className="text-2xl font-bold text-blue-600">4</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-3xl mb-3">📱</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Social Media Marketing</h3>
                    <p className="text-sm text-gray-600 mb-4">Templates for SMM projects</p>
                    <div className="text-2xl font-bold text-purple-600">3</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Digital Solutions</h3>
                    <p className="text-sm text-gray-600 mb-4">Templates for consulting</p>
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-xs text-gray-500 mt-1">Templates available</div>
                </div>
            </div>

            {/* Templates List */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">All Templates</h2>
                </div>
                {templates.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📋</div>
                        <p>No templates yet</p>
                        <p className="text-sm mt-2">Create your first project template to streamline your workflow</p>
                        <Link
                            href="/admin/templates/new"
                            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create First Template
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y">
                        {/* Templates will be mapped here */}
                    </div>
                )}
            </div>

            {/* Quick Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 What are Project Templates?</h3>
                <p className="text-blue-800 text-sm">
                    Project templates allow you to create standardized workflows with pre-defined milestones, tasks, deliverables, and timelines.
                    When creating a new project, you can select a template to automatically populate all the standard items, saving time and ensuring consistency.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="font-medium text-blue-900">✓ Pre-defined Milestones</div>
                        <div className="text-blue-700 text-xs mt-1">Standard project phases</div>
                    </div>
                    <div>
                        <div className="font-medium text-blue-900">✓ Task Checklists</div>
                        <div className="text-blue-700 text-xs mt-1">Recurring tasks for each project type</div>
                    </div>
                    <div>
                        <div className="font-medium text-blue-900">✓ Timeline Estimates</div>
                        <div className="text-blue-700 text-xs mt-1">Automatic scheduling</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
