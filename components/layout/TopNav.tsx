'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, Database, Home, BarChart3, Brain, Shield, Settings, FileText, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { ConnectionDialog } from '../ConnectionDialog';

export function TopNav() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/data', label: 'Data', icon: BarChart3 },
        { href: '/intelligence', label: 'Intelligence', icon: Brain },
        { href: '/governance', label: 'Governance', icon: Shield },
        { href: '/reporting', label: 'Reporting', icon: FileText },
        { href: '/admin', label: 'Admin', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0 sticky top-0 z-50">
                <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
                    {/* Left: Logo + Brand */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/PBT_logo.jpg"
                                alt="PiByThree"
                                width={140}
                                height={45}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                            <span className="text-xl font-semibold text-gray-900 border-l border-gray-300 pl-3 ml-1">
                                Pi-Qualytics
                            </span>
                        </Link>

                        {/* Main Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                            ${active
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                            }
                                        `}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <button
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5 text-gray-500" />
                        </button>

                        {/* Notifications */}
                        <button
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Menu */}
                        <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                U
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>

                        {/* Connect Button */}
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Database className="h-4 w-4" />
                            Connect
                        </Button>
                    </div>
                </div>
            </header>

            <ConnectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
}
