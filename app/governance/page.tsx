'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, Scale, FileCheck } from 'lucide-react';

export default function GovernancePage() {
    return (
        <AppLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Data Governance</h1>
                    <p className="text-gray-500 mt-2">Manage policies, access controls, and compliance standards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <Scale className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Policies</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Define and enforce data quality and retention policies across your datasets.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Manage user roles, permissions, and dataset visibility settings.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <FileCheck className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Compliance</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Monitor adherence to GDPR, CCPA, and internal data standards.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
