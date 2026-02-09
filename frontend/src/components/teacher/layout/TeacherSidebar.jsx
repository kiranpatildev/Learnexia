import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    MessageSquare,
    User,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure alias is configured or use relative path '../lib/utils'

const navItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Lectures', path: '/teacher/lectures', icon: BookOpen },
    { label: 'Games & Leaderboard', path: '/teacher/games', icon: Trophy },
    { label: 'Behavior', path: '/teacher/behavior', icon: MessageSquare },
    { label: 'Profile', path: '/teacher/profile', icon: User },
];

export function TeacherSidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-20 bg-brand-purple flex flex-col items-center py-6 z-50 shadow-xl">
            {/* Logo Area */}
            <div className="mb-10 w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="text-white w-7 h-7" />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-6 w-full items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300",
                            "hover:scale-110",
                            isActive
                                ? "bg-white/10 text-brand-yellow shadow-[0_0_15px_rgba(255,199,27,0.3)]"
                                : "text-brand-light-gray hover:text-white hover:bg-white/5"
                        )}
                        title={item.label} // Basic tooltip
                    >
                        <item.icon size={24} strokeWidth={2} />

                        {/* Custom Tooltip on Hover */}
                        <div className="absolute left-14 bg-brand-navy text-white text-sm px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                            {item.label}
                        </div>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Avatar / Profile Link (Optional, but 'Profile' is already main nav) */}
            <div className="mt-auto mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-yellow/20 border-2 border-brand-yellow/50 flex items-center justify-center overflow-hidden">
                    {/* Placeholder Avatar */}
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </aside>
    );
}
