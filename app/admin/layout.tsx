// app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    MessageSquare,
    FileText,
    BarChart3,
    ArrowLeft,
    FileBox,
    BookOpen,
    Star,
    Activity,
    Bell,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import ReminderEmailChecker from '@/components/admin/ReminderEmailChecker';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Silent reminder email checker */}
            <ReminderEmailChecker />
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                {sidebarOpen ? (
                                    <X className="w-6 h-6 text-gray-700" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-700" />
                                )}
                            </button>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                xDigital Admin
                            </h1>
                            <Link
                                href="/dashboard"
                                className="hidden sm:flex text-sm text-gray-600 hover:text-gray-900 items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Client View
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex relative">
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed lg:sticky top-16 left-0 z-40
                        w-72 bg-white/80 backdrop-blur-md border-r border-gray-200
                        min-h-[calc(100vh-4rem)]
                        transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        shadow-xl lg:shadow-none
                    `}
                >
                    <nav className="p-4 space-y-1">
                        <NavLink
                            href="/admin/dashboard"
                            icon={LayoutDashboard}
                            active={isActive('/admin/dashboard')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            href="/admin/projects"
                            icon={FolderKanban}
                            active={isActive('/admin/projects')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Projects
                        </NavLink>
                        <NavLink
                            href="/admin/clients"
                            icon={Users}
                            active={isActive('/admin/clients')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Clients
                        </NavLink>
                        <NavLink
                            href="/admin/reminders"
                            icon={Bell}
                            active={isActive('/admin/reminders')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Reminders
                        </NavLink>
                        <NavLink
                            href="/admin/messages"
                            icon={MessageSquare}
                            active={isActive('/admin/messages')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Messages
                        </NavLink>
                        <NavLink
                            href="/admin/feedback"
                            icon={Star}
                            active={isActive('/admin/feedback')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Feedback
                        </NavLink>
                        <NavLink
                            href="/admin/analytics"
                            icon={BarChart3}
                            active={isActive('/admin/analytics')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Analytics
                        </NavLink>
                        <NavLink
                            href="/admin/activities"
                            icon={Activity}
                            active={isActive('/admin/activities')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Activities
                        </NavLink>
                        <NavLink
                            href="/admin/templates"
                            icon={FileBox}
                            active={isActive('/admin/templates')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Templates
                        </NavLink>
                        <NavLink
                            href="/admin/resources"
                            icon={BookOpen}
                            active={isActive('/admin/resources')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            Resources
                        </NavLink>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="text-xs text-gray-600 text-center">
                            <p className="font-semibold">Admin Panel</p>
                            <p className="text-gray-500">v1.0.0</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}

function NavLink({
    href,
    icon: Icon,
    children,
    active,
    onClick,
}: {
    href: string;
    icon: any;
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                }
            `}
        >
            <Icon className={`w-5 h-5 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-medium">{children}</span>
            {active && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
        </Link>
    );
}
