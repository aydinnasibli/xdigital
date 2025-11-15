// app/(dashboard)/layout.tsx
import NotificationBell from '@/components/notifications/NotificationBell';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="text-xl font-bold">
                                xDigital
                            </Link>
                            <nav className="hidden md:flex gap-6">
                                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/projects" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Projects
                                </Link>
                                <Link href="/dashboard/notifications" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Notifications
                                </Link>
                                <Link href="/dashboard/feedback" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Feedback
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}