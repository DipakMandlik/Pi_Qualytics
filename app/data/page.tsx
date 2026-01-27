'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Database,
    Search,
    Table as TableIcon,
    Calendar,
    HardDrive,
    AlertCircle,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Dataset {
    name: string;
    rowCount: number;
    created: string;
    lastAltered: string;
    schema: string;
    database: string;
}

export default function DataCatalogPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchDatasets = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/dq/datasets');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load datasets');
            }

            setDatasets(data.data);
        } catch (err: any) {
            console.error('Data fetch error:', err);
            setError(err.message || 'Snowflake connection failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const filteredDatasets = datasets.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Database className="h-6 w-6 text-blue-600" />
                                Data Catalog
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Browsing <span className="font-mono text-sm bg-gray-100 px-1 py-0.5 rounded text-gray-700">BANKING_DW.BRONZE</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                Snowflake Connected
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchDatasets}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="relative max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search datasets..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1600px] mx-auto px-6 py-8">

                {loading && datasets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500">Loading metadata from Snowflake...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                        <h3 className="text-lg font-semibold text-red-700">Connection Error</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchDatasets} variant="destructive">Try Again</Button>
                    </div>
                ) : filteredDatasets.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No datasets found matching your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDatasets.map((dataset) => (
                            <Link
                                key={dataset.name}
                                href={`/datasets/${dataset.name}`}
                                className="group block bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <TableIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        {/* Badge for real data source */}
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                            Snowflake
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {dataset.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-mono mb-6">
                                        {dataset.database}.{dataset.schema}
                                    </p>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <HardDrive className="h-4 w-4 mr-2 text-gray-400" />
                                            {dataset.rowCount.toLocaleString()} rows
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            Updated {dataset.lastAltered ? format(new Date(dataset.lastAltered), 'MMM d, yyyy') : 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
