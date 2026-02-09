import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    LayoutDashboard,
    BookOpen,
    Sparkles,
    Gamepad2,
    Trophy,
    AlertCircle,
    User,
    GraduationCap
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Lecture Notes', path: '/student/notes', icon: BookOpen },
    { label: 'Study Tools', path: '/student/study-tools', icon: Sparkles },
    { label: 'Games', path: '/student/games', icon: Gamepad2 },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { label: 'Behavior', path: '/student/behavior', icon: AlertCircle },
    { label: 'Profile', path: '/student/profile', icon: User },
];

export function StudentSidebar() {
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
                        <p className="text-xs text-white/60">Student Portal</p>
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
                        {user?.first_name?.[0] || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {user?.first_name || 'Student'}
                        </p>
                        <p className="text-xs text-white/60 truncate">Student</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
