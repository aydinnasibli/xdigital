// app/admin/feedback/NPSStatsCard.tsx
'use client';

import { TrendingUp, Users, Minus, TrendingDown } from 'lucide-react';

interface NPSStats {
    npsScore: number;
    total: number;
    promoters: number;
    passives: number;
    detractors: number;
    promoterPercentage: number;
    passivePercentage: number;
    detractorPercentage: number;
}

export default function NPSStatsCard({ stats }: { stats: NPSStats }) {
    const getNPSColor = (score: number) => {
        if (score >= 50) return 'text-green-600 bg-green-50';
        if (score >= 0) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getNPSLabel = (score: number) => {
        if (score >= 70) return 'Excellent';
        if (score >= 50) return 'Great';
        if (score >= 30) return 'Good';
        if (score >= 0) return 'Needs Improvement';
        return 'Critical';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">NPS Statistics</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* NPS Score */}
                <div className="md:col-span-1">
                    <div className={`text-center p-6 rounded-lg ${getNPSColor(stats.npsScore)}`}>
                        <p className="text-sm font-medium mb-2">NPS Score</p>
                        <p className="text-4xl font-bold">{stats.npsScore}</p>
                        <p className="text-sm mt-2">{getNPSLabel(stats.npsScore)}</p>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="md:col-span-3 space-y-4">
                    {/* Promoters */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-32">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-700">Promoters</span>
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-green-500 h-full rounded-full transition-all"
                                    style={{ width: `${stats.promoterPercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-semibold text-gray-900">{stats.promoters}</span>
                            <span className="text-sm text-gray-600 ml-2">
                                ({stats.promoterPercentage}%)
                            </span>
                        </div>
                    </div>

                    {/* Passives */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-32">
                            <Minus className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-gray-700">Passives</span>
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-yellow-500 h-full rounded-full transition-all"
                                    style={{ width: `${stats.passivePercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-semibold text-gray-900">{stats.passives}</span>
                            <span className="text-sm text-gray-600 ml-2">
                                ({stats.passivePercentage}%)
                            </span>
                        </div>
                    </div>

                    {/* Detractors */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-32">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-gray-700">Detractors</span>
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-red-500 h-full rounded-full transition-all"
                                    style={{ width: `${stats.detractorPercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-semibold text-gray-900">{stats.detractors}</span>
                            <span className="text-sm text-gray-600 ml-2">
                                ({stats.detractorPercentage}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Total Responses:</strong> {stats.total}
                    <span className="mx-4">•</span>
                    NPS = (Promoters - Detractors) / Total Responses × 100
                </p>
            </div>
        </div>
    );
}
