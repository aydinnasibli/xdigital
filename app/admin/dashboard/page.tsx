// app/admin/dashboard/page.tsx
import Link from "next/link";
import { getAdminProjectStats } from "@/app/actions/admin/projects";
import { getAdminClientStats } from "@/app/actions/admin/clients";
import {
  FolderKanban,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  BarChart3,
  FileText,
  Zap,
  Target,
  LucideIcon,
} from "lucide-react";
import { DashboardCharts } from "@/components/analytics/DashboardCharts";

export default async function AdminDashboardPage() {
  const [projectStats, clientStats] = await Promise.all([
    getAdminProjectStats(),
    getAdminClientStats(),
  ]);

  const projects = projectStats.success ? projectStats.data : null;
  const clients = clientStats.success ? clientStats.data : null;

  // Calculate trends
  const projectTrend = (
    ((projects?.thisMonth || 0) /
      Math.max((projects?.total || 1) - (projects?.thisMonth || 0), 1)) *
    100
  ).toFixed(1);
  const clientTrend = (
    ((clients?.newThisMonth || 0) /
      Math.max(
        (clients?.totalClients || 1) - (clients?.newThisMonth || 0),
        1
      )) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header - Dark Glass */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800/50 backdrop-blur-xl p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Admin Control Center
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">
                Welcome back! Here's what's happening today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/templates"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700 rounded-xl transition-all text-sm font-medium text-gray-300 hover:text-white"
              >
                <FileText className="w-4 h-4" />
                Templates
              </Link>
              <Link
                href="/admin/analytics"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl transition-all text-sm font-medium text-white"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid - Dark Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DarkStatCard
          title="Total Projects"
          value={projects?.total || 0}
          subtitle={`${projects?.thisMonth || 0} this month`}
          icon={FolderKanban}
          accentColor="from-blue-500 to-cyan-500"
          trend={Number(projectTrend)}
          trendLabel="vs last period"
        />
        <DarkStatCard
          title="Total Clients"
          value={clients?.totalClients || 0}
          subtitle={`${clients?.newThisMonth || 0} new this month`}
          icon={Users}
          accentColor="from-emerald-500 to-green-500"
          trend={Number(clientTrend)}
          trendLabel="vs last period"
        />
        <DarkStatCard
          title="Active Clients"
          value={clients?.clientsWithActiveProjects || 0}
          subtitle="With active projects"
          icon={Target}
          accentColor="from-purple-500 to-pink-500"
          trendLabel="Currently engaged"
        />
      </div>

      {/* Project Status Cards - Dark Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Pending"
          value={projects?.pending || 0}
          icon={Clock}
          accentColor="from-amber-500 to-orange-500"
          description="Awaiting start"
        />
        <StatusCard
          title="In Progress"
          value={projects?.inProgress || 0}
          icon={Zap}
          accentColor="from-blue-500 to-cyan-500"
          description="Currently active"
          pulse={true}
        />
        <StatusCard
          title="Completed"
          value={projects?.completed || 0}
          icon={CheckCircle}
          accentColor="from-emerald-500 to-green-500"
          description="Successfully delivered"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          href="/admin/projects"
          icon={<FolderKanban className="w-6 h-6" />}
          title="Manage Projects"
          description="View all projects"
          accentColor="from-blue-500 to-cyan-500"
        />
        <QuickAction
          href="/admin/clients"
          icon={<Users className="w-6 h-6" />}
          title="Manage Clients"
          description="View all clients"
          accentColor="from-purple-500 to-pink-500"
        />
        <QuickAction
          href="/admin/analytics"
          icon={<BarChart3 className="w-6 h-6" />}
          title="View Analytics"
          description="Detailed insights"
          accentColor="from-emerald-500 to-teal-500"
        />
      </div>

      {/* Client Activity - Dark Glass */}
      <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Client Activity
            </h2>
            <p className="text-sm text-gray-500">
              Recent client engagement metrics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            label="Active Projects"
            value={clients?.clientsWithActiveProjects || 0}
            description="Clients with projects"
            accentColor="from-blue-500 to-cyan-500"
          />
          <MetricCard
            label="New This Month"
            value={clients?.newThisMonth || 0}
            description="Recently onboarded"
            accentColor="from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Charts Section - Dark Glass */}
      {projects && projects.total > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Project Analytics
              </h2>
              <p className="text-sm text-gray-500">
                Visual overview of project distribution
              </p>
            </div>
          </div>
          <DashboardCharts
            projectsByStatus={[
              { status: "Pending", count: projects?.pending || 0 },
              { status: "In Progress", count: projects?.inProgress || 0 },
              { status: "Completed", count: projects?.completed || 0 },
            ]}
            revenueData={[]}
          />
        </div>
      )}
    </div>
  );
}

// Dark Stat Card Component
function DarkStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
  trend,
  trendLabel,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  accentColor: string;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-gray-800/50 hover:border-gray-700 rounded-xl p-6 transition-all duration-200">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity`}
      ></div>

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${accentColor} bg-opacity-10 border border-white/10`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          {trendLabel && (
            <p className="text-xs text-gray-600 mt-1">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({
  title,
  value,
  icon: Icon,
  accentColor,
  description,
  pulse = false,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  accentColor: string;
  description: string;
  pulse?: boolean;
}) {
  return (
    <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-xl p-5">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-5`}
      ></div>

      <div className="relative flex items-center gap-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${accentColor} bg-opacity-10 border border-white/10 ${pulse ? "animate-pulse" : ""}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  description,
  accentColor,
}: {
  label: string;
  value: number;
  description: string;
  accentColor: string;
}) {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-gray-800/30 rounded-xl p-4">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-5`}
      ></div>

      <div className="relative">
        <p className="text-sm font-medium text-gray-300 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// Quick Action Component
function QuickAction({
  href,
  icon,
  title,
  description,
  accentColor,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-gray-800/50 hover:border-gray-700 rounded-xl p-6 transition-all duration-200"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-10 transition-opacity`}
      ></div>

      <div className="relative  space-y-3">
        <div className="inline-flex p-3 bg-white/5 group-hover:bg-white/10 rounded-xl transition-colors">
          <div className="text-gray-300 group-hover:text-white transition-colors">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white text-base mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </Link>
  );
}
