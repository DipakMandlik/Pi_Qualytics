'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CircularMetricCardProps {
    title: string;
    value: number; // 0-100
    total?: number;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'amber' | 'red';
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
}

export function CircularMetricCard({
    title,
    value,
    total,
    icon: Icon,
    color,
    trend
}: CircularMetricCardProps) {

    const colors = {
        blue: { main: '#3b82f6', bg: '#eff6ff', light: '#dbeafe' },
        green: { main: '#10b981', bg: '#ecfdf5', light: '#d1fae5' },
        amber: { main: '#f59e0b', bg: '#fffbeb', light: '#fde68a' },
        red: { main: '#ef4444', bg: '#fef2f2', light: '#fee2e2' },
    };

    const theme = colors[color];

    const data = [
        { value: value },
        { value: 100 - value },
    ];

    return (
        <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg transition-colors", `bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100`)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700 tracking-tight">{title}</h3>
                    </div>
                    {trend && (
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            trend.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        )}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={32}
                                    outerRadius={42}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill={theme.main} />
                                    <Cell fill={theme.light} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={cn("text-xl font-bold", `text-${color}-600`)}>{value}%</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Score</p>
                        {total !== undefined && (
                            <p className="text-xs text-gray-400 mt-1">{total.toLocaleString()} checks</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
