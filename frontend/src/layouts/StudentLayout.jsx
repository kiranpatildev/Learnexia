import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    FileText,
    Trophy,
    User
} from 'lucide-react';

const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Lecture Notes', path: '/student/notes', icon: BookOpen },
    { label: 'Quizzes', path: '/student/quizzes', icon: ClipboardList },
    { label: 'Assignments', path: '/student/assignments', icon: FileText },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/student/profile', icon: User },
];

export function StudentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar
                items={studentNavItems}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
            />
            <div className="flex-1 flex flex-col lg:ml-64">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
