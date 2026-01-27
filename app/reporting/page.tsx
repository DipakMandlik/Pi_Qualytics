/**
 * Reporting Home Page
 * 
 * Purpose: Main entry point for reporting functionality
 * Features:
 * - Generate new reports
 * - View report history
 * - Quick actions
 */

'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ReportingPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleQuickGenerate = async (scope: 'platform' | 'dataset', format: 'json' | 'csv') => {
        setIsGenerating(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const response = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scope,
                    date: today,
                    format,
                    generatedBy: 'user',
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Download the report
                if (result.data.content) {
                    const blob = new Blob([result.data.content], {
                        type: format === 'json' ? 'application/json' : 'text/csv',
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${scope}_report_${today}.${format}`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }

                alert(`Report generated successfully! Report ID: ${result.data.reportId}`);
            } else {
                alert(`Failed to generate report: ${result.error}`);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporting</h1>
                    <p className="text-gray-600">
                        Generate, view, and manage data quality reports
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Platform Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Overall data quality for today
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleQuickGenerate('platform', 'json')}
                                    disabled={isGenerating}
                                >
                                    JSON
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuickGenerate('platform', 'csv')}
                                    disabled={isGenerating}
                                >
                                    CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Download className="w-5 h-5 text-green-600" />
                                Recent Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                View and download past reports
                            </p>
                            <Link href="/reporting/history">
                                <Button size="sm" variant="outline" className="w-full">
                                    View History
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                Scheduled Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Manage automated report delivery
                            </p>
                            <Link href="/reporting/scheduled">
                                <Button size="sm" variant="outline" className="w-full">
                                    Manage Schedules
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                Custom Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Generate custom reports
                            </p>
                            <Link href="/reporting/generate">
                                <Button size="sm" variant="outline" className="w-full">
                                    Create Report
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Types */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Available Report Types</h2>

                    <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-lg">Platform Daily Quality Report</h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Comprehensive overview of data quality across all datasets. Includes quality scores,
                                coverage analysis, risk assessment, SLA compliance, and top failing datasets.
                            </p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Leadership</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Operations</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Audits</span>
                            </div>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                            <h3 className="font-semibold text-lg">Dataset Quality Report</h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Detailed quality analysis for a specific dataset. Includes quality score, failed checks,
                                anomalies, freshness signals, and volume trends.
                            </p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Data Engineers</span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Data Owners</span>
                            </div>
                        </div>

                        <div className="border-l-4 border-red-500 pl-4">
                            <h3 className="font-semibold text-lg">Incident / Exception Report</h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Generated when anomalies or SLA breaches occur. Includes incident timeline,
                                impacted datasets, root cause hints, and resolution status.
                            </p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">RCA</span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Escalation</span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Audits</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Formats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Export Formats</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">PDF</h3>
                            <p className="text-sm text-gray-600">
                                Business-friendly format for leadership, audits, and presentations.
                            </p>
                            <span className="text-xs text-orange-600 mt-2 block">Coming Soon</span>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">CSV</h3>
                            <p className="text-sm text-gray-600">
                                Tabular format for analysis in Excel and spreadsheet tools.
                            </p>
                            <span className="text-xs text-green-600 mt-2 block">✓ Available</span>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">JSON</h3>
                            <p className="text-sm text-gray-600">
                                Structured format for API consumption and automation.
                            </p>
                            <span className="text-xs text-green-600 mt-2 block">✓ Available</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
