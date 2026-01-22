'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Brain, Sparkles } from 'lucide-react';

export default function IntelligencePage() {
    return (
        <AppLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Intelligence & Insights</h1>
                    <p className="text-gray-500 mt-2">AI-driven data quality recommendations and anomaly detection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center justify-center min-h-[300px]">
                        <div className="p-4 bg-purple-50 rounded-full mb-4">
                            <Brain className="h-12 w-12 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">AI Copilot</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                            Our AI engine is analyzing your data patterns. Insights will appear here once sufficient history is collected.
                        </p>
                        <span className="mt-6 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Coming Soon</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center justify-center min-h-[300px]">
                        <div className="p-4 bg-blue-50 rounded-full mb-4">
                            <Sparkles className="h-12 w-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Predictive Quality</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                            Forecast potential quality incidents before they impact downstream consumers.
                        </p>
                        <span className="mt-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Coming Soon</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
