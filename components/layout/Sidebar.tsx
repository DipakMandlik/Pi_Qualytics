'use client';

import { useState, useEffect } from 'react';
import { Database, Folder, FileText, Home, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { MenuItem } from '../navigation/MenuItem';
import { useAppStore } from '@/lib/store';

export function Sidebar() {
    const { isConnected } = useAppStore();
    const [databases, setDatabases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch database hierarchy from Snowflake
    useEffect(() => {
        if (!isConnected) {
            setDatabases([]);
            setIsLoading(false);
            return;
        }

        const fetchDatabases = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/snowflake/database-hierarchy');
                const result = await response.json();

                if (result.success && result.data) {
                    setDatabases(result.data);
                }
            } catch (error) {
                console.error('Error fetching databases:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDatabases();
    }, [isConnected]);

    // Build navigation items from fetched data
    const dataItems = [
        {
            id: 'all-datasets',
            label: 'All Datasets',
            icon: Database,
            href: '/datasets',
        },
        ...databases.map((db) => ({
            id: db.id,
            label: db.name,
            icon: Database,
            snowflakeIcon: true, // Flag to show Snowflake logo
            children: db.schemas.map((schema: any) => ({
                id: `${db.id}_${schema.id}`,
                label: schema.name,
                icon: Folder,
                snowflakeIcon: true, // Flag to show Snowflake logo
                children: schema.tables.map((table: any) => ({
                    id: table.id,
                    label: table.name,
                    icon: FileText,
                    snowflakeIcon: true, // Flag to show Snowflake logo
                    href: table.href,
                })),
            })),
        })),
    ];

    // Static menu items
    const menuItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            href: '/',
        },
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/',
        },
        {
            id: 'monitoring',
            label: 'Monitoring',
            icon: Activity,
            href: '/monitoring',
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            href: '/settings',
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4 space-y-8">
                {/* MENU Section */}
                <div>
                    <h3 className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        MENU
                    </h3>
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <MenuItem key={item.id} item={item} />
                        ))}
                    </nav>
                </div>

                {/* DATA Section */}
                <div>
                    <h3 className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        DATA
                    </h3>
                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    ) : (
                        <nav className="space-y-0.5">
                            {dataItems.map((item) => (
                                <MenuItem key={item.id} item={item} />
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </aside>
    );
}
