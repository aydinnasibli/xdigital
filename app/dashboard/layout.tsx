// app/(dashboard)/layout.tsx
import NotificationBell from '@/components/notifications/NotificationBell';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <GlobalSearchDialog />
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
                                <Link href="/dashboard/payments" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Payments
                                </Link>
                                <Link href="/dashboard/feedback" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Feedback
                                </Link>
                                <Link href="/dashboard/resources" className="text-gray-700 hover:text-gray-900 hover:underline">
                                    Resources
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <span>🔍</span>
                                <span>Search</span>
                                <kbd className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
                            </button>
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