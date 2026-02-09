import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    LayoutDashboard,
    Video,
    FileText,
    ClipboardList,
    Users,
    BarChart3,
    User,
    Sparkles,
    AlertCircle,
    Calendar,
    MessageSquare,
    Gamepad2,
    GraduationCap
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Lectures', path: '/teacher/lectures', icon: Video },
    { label: 'AI Features', path: '/teacher/ai-features', icon: Sparkles },
    { label: 'Assignments', path: '/teacher/assignments', icon: FileText },
    { label: 'Students', path: '/teacher/students', icon: Users },
    { label: 'Attendance', path: '/teacher/attendance', icon: Calendar },
    { label: 'Games', path: '/teacher/games', icon: Gamepad2 },
    { label: 'Behavior', path: '/teacher/behavior', icon: AlertCircle },
    { label: 'Messages', path: '/teacher/messages', icon: MessageSquare },
    { label: 'Profile', path: '/teacher/profile', icon: User },
];

export function TeacherSidebar() {
    const { user } = useAuthStore();

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#2C3E50] text-white flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3498DB] flex items-center justify-center">
                        <GraduationCap size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">EduPlatform</h1>
                        <p className="text-xs text-white/60">Teacher Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-custom">
                <div className="space-y-0.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-[#3498DB] text-white shadow-lg shadow-[#3498DB]/20'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} strokeWidth={2} />
                            <span className="font-medium text-[15px]">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Profile at Bottom */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-[#3498DB] flex items-center justify-center font-semibold">
                        {user?.first_name?.[0] || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {user?.first_name || 'Teacher'}
                        </p>
                        <p className="text-xs text-white/60 truncate">Teacher</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
