import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Sidebar({ items, isOpen, onClose, isMobile }) {
    const { user } = useAuthStore();

    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        if (user?.first_name) {
            return user.first_name.substring(0, 2).toUpperCase();
        }
        if (user?.username) {
            return user.username.substring(0, 2).toUpperCase();
        }
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    const getUserName = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        if (user?.first_name) {
            return user.first_name;
        }
        if (user?.username) {
            return user.username;
        }
        return user?.email || 'User';
    };

    const getUserRole = () => {
        if (!user?.role) return 'User';
        return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:sticky top-0 left-0 z-50 flex flex-col w-48 h-screen bg-slate-900 transition-transform duration-300',
                    isMobile && !isOpen && '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-800">
                    <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-slate-900" />
                    </div>
                    <h2 className="text-lg font-bold text-white">EduPlatform</h2>
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg ml-auto"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="space-y-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && onClose()}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    )
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Footer - User Profile */}
                <div className="p-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-900">{getInitials()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{getUserName()}</p>
                            <p className="text-xs text-slate-400 truncate">{getUserRole()}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
