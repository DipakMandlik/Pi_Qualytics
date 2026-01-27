'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Database,
    Table as TableIcon,
    Calendar,
    HardDrive,
    CheckCircle2,
    XCircle,
    Loader2,
    Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Column {
    COLUMN_NAME: string;
    DATA_TYPE: string;
    IS_NULLABLE: string;
    ORDINAL_POSITION: number;
}

interface DatasetDetails {
    name: string;
    database: string;
    schema: string;
    rowCount: number;
    created: string;
    lastAltered: string;
    columns: Column[];
    isOnboarded: boolean;
    datasetId: string | null;
}

export default function DatasetDetailPage() {
    const params = useParams();
    const datasetName = params.dataset as string;

    const [details, setDetails] = useState<DatasetDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/dq/datasets/${datasetName}`);
                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to load details');
                }

                setDetails(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (datasetName) {
            fetchDetails();
        }
    }, [datasetName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dataset</h2>
                    <p className="text-gray-600 mb-6">{error || 'Dataset not found'}</p>
                    <Link href="/data">
                        <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Catalog</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <Link href="/data" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Catalog
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TableIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{details.name}</h1>
                                <p className="text-gray-500 font-mono mt-1">
                                    {details.database}.{details.schema}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {details.isOnboarded ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 shadow-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="font-semibold text-sm">DQ Monitored</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                                    <span className="font-medium text-sm">Not Onboarded</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-gray-500" />
                            Metadata
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-500 block">Row Count</span>
                                <span className="text-xl font-mono font-medium">{details.rowCount.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Created</span>
                                <span className="text-base">
                                    {details.created ? format(new Date(details.created), 'PPpp') : '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Last Altered</span>
                                <span className="text-base">
                                    {details.lastAltered ? format(new Date(details.lastAltered), 'PPpp') : '-'}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Source</span>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="h-2 w-2 bg-blue-500 rounded-full" />
                                    <span className="text-sm font-medium text-gray-700">Snowflake</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Schema */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Columns className="h-5 w-5 text-gray-500" />
                                Schema ({details.columns.length} columns)
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Column Name</th>
                                        <th className="px-6 py-4">Data Type</th>
                                        <th className="px-6 py-4">Nullable</th>
                                        <th className="px-6 py-4">Position</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {details.columns.map((col) => (
                                        <tr key={col.COLUMN_NAME} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{col.COLUMN_NAME}</td>
                                            <td className="px-6 py-4 font-mono text-blue-600">{col.DATA_TYPE}</td>
                                            <td className="px-6 py-4">
                                                {col.IS_NULLABLE === 'YES' ? (
                                                    <span className="text-gray-500">Nullable</span>
                                                ) : (
                                                    <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded">NOT NULL</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-mono">#{col.ORDINAL_POSITION}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
