// app/admin/layout.tsx
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    MessageSquare,
    FileText,
    BarChart3,
    ArrowLeft,
    FileBox
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900">xDigital Admin</h1>
                            <Link
                                href="/dashboard"
                                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
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

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-1">
                        <NavLink href="/admin/dashboard" icon={LayoutDashboard}>
                            Dashboard
                        </NavLink>
                        <NavLink href="/admin/projects" icon={FolderKanban}>
                            Projects
                        </NavLink>
                        <NavLink href="/admin/clients" icon={Users}>
                            Clients
                        </NavLink>
                        <NavLink href="/admin/messages" icon={MessageSquare}>
                            Messages
                        </NavLink>
                        <NavLink href="/admin/invoices" icon={FileText}>
                            Invoices
                        </NavLink>
                        <NavLink href="/admin/analytics" icon={BarChart3}>
                            Analytics
                        </NavLink>
                        <NavLink href="/admin/templates" icon={FileBox}>
                            Templates
                        </NavLink>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
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
}: {
    href: string;
    icon: any;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <Icon className="w-5 h-5" />
            <span>{children}</span>
        </Link>
    );
}