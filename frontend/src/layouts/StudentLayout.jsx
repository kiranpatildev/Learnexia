import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import {
    LayoutDashboard,
    BookOpen,
    Layers,
    ClipboardList,
    FileText,
    Calendar,
    Trophy,
    User
} from 'lucide-react';

const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Lecture Notes', path: '/student/notes', icon: BookOpen },
    { label: 'Flashcards', path: '/student/flashcards', icon: Layers },
    { label: 'Quizzes', path: '/student/quizzes', icon: ClipboardList },
    { label: 'Assignments', path: '/student/assignments', icon: FileText },
    { label: 'Attendance', path: '/student/attendance', icon: Calendar },
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
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}
