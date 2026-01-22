'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/lib/config/navigation';

interface MenuItemProps {
    item: NavigationItem;
    level?: number;
}

export function MenuItem({ item, level = 0 }: MenuItemProps) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true); // Default expanded for better UX
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href;

    const Icon = item.icon;

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    const content = (
        <div
            className={cn(
                'group flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm transition-all duration-200 cursor-pointer relative',
                'border-l-4 border-transparent hover:bg-gradient-to-r hover:from-gray-50 hover:to-white',
                level === 0 && 'font-medium',
                level > 0 && 'text-sm font-normal ml-2', // Subtle indentation shift
                isActive && 'bg-gradient-to-r from-blue-50 to-white text-blue-700 border-blue-600 font-semibold shadow-sm',
                !isActive && level === 0 && 'text-gray-700 hover:text-gray-900',
                !isActive && level > 0 && 'text-gray-500 hover:text-gray-800'
            )}
            style={{ paddingLeft: `${Math.max(level * 12 + 12, 12)}px` }}
            onClick={handleClick}
        >
            {hasChildren ? (
                <span className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight className={cn("h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600", isActive && "text-blue-500")} />
                </span>
            ) : (
                // Show Snowflake emoji for Snowflake items with better sizing
                (item as any).snowflakeIcon ? (
                    <span className="flex-shrink-0 text-sm leading-none opacity-80 group-hover:opacity-100 transition-opacity">❄️</span>
                ) : (
                    <Icon className={cn("h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors", isActive && "text-blue-600")} />
                )
            )}
            <span className="flex-1 truncate tracking-tight">{item.label}</span>
        </div>
    );

    return (
        <div>
            {item.href && !hasChildren ? (
                <Link href={item.href}>{content}</Link>
            ) : (
                content
            )}
            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-0.5">
                    {item.children!.map((child) => (
                        <MenuItem key={child.id} item={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
