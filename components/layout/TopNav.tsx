'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, ChevronDown, Database } from 'lucide-react';
import { Button } from '../ui/button';
import { ConnectionDialog } from '../ConnectionDialog';

export function TopNav() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPlatformOpen, setIsPlatformOpen] = useState(false);

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
                <div className="flex items-center gap-8 flex-1">
                    {/* Logo */}
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
                    <nav className="hidden md:flex items-center gap-6">
                        {/* Platform Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsPlatformOpen(!isPlatformOpen)}
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Platform
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <Link
                            href="/data"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Data
                        </Link>
                        <Link
                            href="/intelligence"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Intelligence
                        </Link>
                        <Link
                            href="/governance"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Governance
                        </Link>
                        <Link
                            href="/admin"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Admin
                        </Link>
                    </nav>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <Search className="h-5 w-5 text-gray-500" />
                    </button>

                    {/* Notifications */}
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors relative">
                        <Bell className="h-5 w-5 text-gray-500" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            U
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* Connect Button */}
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Database className="h-4 w-4" />
                        Connect
                    </Button>
                </div>
            </header>

            <ConnectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
}
