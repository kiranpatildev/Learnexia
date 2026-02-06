import { Outlet } from 'react-router-dom';
import AnimatedDock from '../components/common/AnimatedDock';
import {
    LayoutDashboard,
    BookOpen,
    Sparkles,
    Trophy,
    AlertCircle,
    User,
    Gamepad2
} from 'lucide-react';


const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Lecture Notes', path: '/student/notes', icon: BookOpen },
    { label: 'Study Tools', path: '/student/study-tools', icon: Sparkles },
    { label: 'Games', path: '/student/games', icon: Gamepad2 },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { label: 'Behavior', path: '/student/behavior', icon: AlertCircle },
    { label: 'Profile', path: '/student/profile', icon: User },
];

export function StudentLayout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
            <AnimatedDock items={studentNavItems} />
            <div className="ml-24">
                <Outlet />
            </div>
        </div>
    );
}

