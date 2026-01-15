import { Menu, Bell, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export function Navbar({ onMenuClick }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div>
                        <p className="text-sm text-slate-600">Good {getGreeting()},</p>
                        <h1 className="text-xl font-semibold text-slate-900">
                            {user?.first_name || user?.email}
                        </h1>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                        <Bell className="w-5 h-5 text-slate-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User menu */}
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="hidden sm:flex"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
}
