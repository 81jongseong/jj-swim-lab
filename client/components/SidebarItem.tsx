import Link from 'next/link';
import { MenuItem } from '../config/menuConfig';

interface SidebarItemProps {
    item: MenuItem;
    isActive: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

export default function SidebarItem({ item, isActive, onClick }: SidebarItemProps) {
    return (
        <Link
            href={item.href}
            data-active={isActive.toString()}
            data-href={item.href}
            className={`block w-full text-left px-3 py-2 text-sm transition-colors rounded-md mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive
                    ? 'bg-blue-500 text-white font-bold border-l-3 border-blue-700 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
            onClick={onClick}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            role="menuitem"
            tabIndex={0}
        >
            {item.label}
        </Link>
    );
}
