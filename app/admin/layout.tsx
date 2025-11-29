// app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  BarChart3,
  ArrowLeft,
  FileBox,
  BookOpen,
  Activity,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import ReminderEmailChecker from "@/components/admin/ReminderEmailChecker";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-transparent text-gray-300">
      {/* Silent reminder email checker */}
      <ReminderEmailChecker />
      {/* Top Navigation - Dark Glass */}
      <nav className="relative">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-800/50 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-300" />
                )}
              </button>
              <h1 className="text-xl font-bold text-white">
                xDigital <span className="text-yellow-600/90">Admin</span>
              </h1>
              <Link
                href="/dashboard"
                className="hidden sm:flex text-sm text-gray-400 hover:text-white items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-800/50 hover:border-gray-700 transition-colors"
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
            className="fixed inset-0 bg-black/80 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Dark Glass */}
        <aside
          className={`
                        fixed lg:sticky top-16 left-0 z-40
                        w-64  backdrop-blur-xl border-r border-gray-800/50
                        min-h-[calc(100vh-4rem)]
                        transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    `}
        >
          <nav className="p-1 space-y-4">
            <NavLink
              href="/admin/dashboard"
              icon={LayoutDashboard}
              active={isActive("/admin/dashboard")}
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              href="/admin/projects"
              icon={FolderKanban}
              active={isActive("/admin/projects")}
              onClick={() => setSidebarOpen(false)}
            >
              Projects
            </NavLink>
            <NavLink
              href="/admin/clients"
              icon={Users}
              active={isActive("/admin/clients")}
              onClick={() => setSidebarOpen(false)}
            >
              Clients
            </NavLink>
            <NavLink
              href="/admin/reminders"
              icon={Bell}
              active={isActive("/admin/reminders")}
              onClick={() => setSidebarOpen(false)}
            >
              Reminders
            </NavLink>
            <NavLink
              href="/admin/messages"
              icon={MessageSquare}
              active={isActive("/admin/messages")}
              onClick={() => setSidebarOpen(false)}
            >
              Messages
            </NavLink>
            <NavLink
              href="/admin/analytics"
              icon={BarChart3}
              active={isActive("/admin/analytics")}
              onClick={() => setSidebarOpen(false)}
            >
              Analytics
            </NavLink>
            <NavLink
              href="/admin/activities"
              icon={Activity}
              active={isActive("/admin/activities")}
              onClick={() => setSidebarOpen(false)}
            >
              Activities
            </NavLink>
            <NavLink
              href="/admin/templates"
              icon={FileBox}
              active={isActive("/admin/templates")}
              onClick={() => setSidebarOpen(false)}
            >
              Templates
            </NavLink>
            <NavLink
              href="/admin/resources"
              icon={BookOpen}
              active={isActive("/admin/resources")}
              onClick={() => setSidebarOpen(false)}
            >
              Resources
            </NavLink>
          </nav>
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
                ${
                  active
                    ? "bg-white/10 text-white border border-purple-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }
            `}
    >
      <Icon
        className={`w-5 h-5 ${active ? "" : "group-hover:scale-110 transition-transform"}`}
      />
      <span className="font-medium text-base">{children}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
      )}
    </Link>
  );
}
