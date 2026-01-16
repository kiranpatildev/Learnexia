import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Calendar,
    MessageSquare,
    User
} from 'lucide-react';

const parentNavItems = [
    { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'My Children', path: '/parent/children', icon: Users },
    { label: 'Performance', path: '/parent/performance', icon: BarChart3 },
    { label: 'Attendance', path: '/parent/attendance', icon: Calendar },
    { label: 'Messages', path: '/parent/messages', icon: MessageSquare },
    { label: 'Profile', path: '/parent/profile', icon: User },
];

export function ParentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar
                items={parentNavItems}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
            />
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}
