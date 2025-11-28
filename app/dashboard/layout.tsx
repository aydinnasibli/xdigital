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
        <div className="min-h-screen bg-black">
            <GlobalSearchDialog />
            {/* Header - Dark Glass Design */}
            <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
                                xDigital
                            </Link>
                            <nav className="hidden md:flex gap-6">
                                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Projects
                                </Link>
                                <Link href="/dashboard/resources" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Resources
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 rounded-lg transition-all">
                                <span>🔍</span>
                                <span>Search</span>
                                <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded border border-gray-700">⌘K</kbd>
                            </button>
                            <NotificationBell />
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}