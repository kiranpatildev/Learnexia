import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import {
    LayoutDashboard,
    Video,
    FileText,
    ClipboardList,
    Users,
    BarChart3,
    User,
    Sparkles
} from 'lucide-react';

const teacherNavItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Lectures', path: '/teacher/lectures', icon: Video },
    { label: 'AI Features', path: '/teacher/ai-features', icon: Sparkles },
    { label: 'Assignments', path: '/teacher/assignments', icon: FileText },
    { label: 'Quizzes', path: '/teacher/quizzes', icon: ClipboardList },
    { label: 'Students', path: '/teacher/students', icon: Users },
    { label: 'Analytics', path: '/teacher/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/teacher/profile', icon: User },
];

export function TeacherLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar
                items={teacherNavItems}
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
