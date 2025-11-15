// components/analytics/DashboardCharts.tsx
'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectsByStatusData {
    status: string;
    count: number;
}

interface RevenueData {
    month: string;
    revenue: number;
}

interface DashboardChartsProps {
    projectsByStatus: ProjectsByStatusData[];
    revenueData: RevenueData[];
    clientAcquisition?: Array<{ month: string; clients: number }>;
}

const COLORS = {
    pending: '#fbbf24',
    in_progress: '#3b82f6',
    review: '#a855f7',
    completed: '#10b981',
    on_hold: '#f59e0b',
    cancelled: '#ef4444',
};

export function DashboardCharts({ projectsByStatus, revenueData, clientAcquisition }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects by Status - Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Projects by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={projectsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ status, count }) => `${status}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {projectsByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.status.toLowerCase().replace(' ', '_') as keyof typeof COLORS] || '#8884d8'} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue Over Time - Line Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Client Acquisition - Bar Chart */}
            {clientAcquisition && clientAcquisition.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Client Acquisition Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={clientAcquisition}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="clients" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// Stats Cards Component
interface StatsCardsProps {
    stats: {
        totalProjects: number;
        activeProjects: number;
        totalRevenue: number;
        pendingInvoices: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: 'Total Projects',
            value: stats.totalProjects,
            icon: '📊',
            color: 'bg-blue-500',
        },
        {
            title: 'Active Projects',
            value: stats.activeProjects,
            icon: '🚀',
            color: 'bg-green-500',
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: '💰',
            color: 'bg-purple-500',
        },
        {
            title: 'Pending Invoices',
            value: stats.pendingInvoices,
            icon: '📄',
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card) => (
                <div key={card.title} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                        <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Health Score Indicator
interface HealthScoreProps {
    score: number; // 0-100
    label?: string;
}

export function HealthScore({ score, label = 'Health Score' }: HealthScoreProps) {
    const getColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        if (score >= 40) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const getStatus = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${getColor(score)}`}>
                        {getStatus(score)}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            score >= 80 ? 'bg-green-600' :
                            score >= 60 ? 'bg-yellow-600' :
                            score >= 40 ? 'bg-orange-600' :
                            'bg-red-600'
                        }`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{score}</span>
        </div>
    );
}
