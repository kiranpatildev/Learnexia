
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Trophy, BarChart3, User, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Notes', path: '/student/notes-flashcards', icon: BookOpen },
    { label: 'Games', path: '/student/games-leaderboard', icon: Trophy },
    { label: 'Behavior', path: '/student/behavior', icon: BarChart3 },
    { label: 'Schedule', path: '/student/attendance', icon: Calendar },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Settings', path: '/student/profile?tab=settings', icon: Settings },
];

export function Sidebar() {
    return (
        <aside className="fixed left-4 top-1/2 -translate-y-1/2 h-[90vh] w-20 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl flex flex-col items-center py-8 z-50">
            <div className="mb-8 w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">L</span>
            </div>

            <nav className="flex flex-col gap-4 w-full items-center flex-1 justify-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300",
                            isActive
                                ? "bg-gradient-to-r from-brand-purple to-pink-500 text-white shadow-lg scale-110"
                                : "text-gray-500 hover:bg-white/50 hover:text-brand-purple"
                        )}
                        title={item.label}
                    >
                        <item.icon size={22} strokeWidth={2} />
                        {/* Tooltip dot */}
                        <span className="absolute right-0 top-0 w-2 h-2 rounded-full bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
                    R
                </div>
            </div>
        </aside>
    );
}
