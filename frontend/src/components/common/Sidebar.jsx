import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LeafBottomLeft } from '../nature/BotanicalElements';
import '../../styles/nature-theme.css';

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
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen nature-sidebar transition-transform duration-300',
                    isMobile && !isOpen && '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Decorative Leaf */}
                <div className="absolute bottom-0 left-0 pointer-events-none opacity-40">
                    <LeafBottomLeft />
                </div>

                {/* Header */}
                <div className="relative flex items-center gap-3 p-6 border-b border-[#D4896B]/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4896B] to-[#B86F54] flex items-center justify-center shadow-md">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#4A4A4A]">EduPlatform</h2>
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-white/50 rounded-lg ml-auto transition-colors"
                        >
                            <X className="w-5 h-5 text-[#4A4A4A]" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 nature-scrollbar relative z-10">
                    <div className="space-y-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && onClose()}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                        isActive
                                            ? 'bg-[#8FB569] text-white shadow-md'
                                            : 'text-[#4A4A4A] hover:bg-white/60'
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-colors",
                                            isActive ? "text-white" : "text-[#7A7A7A] group-hover:text-[#D4896B]"
                                        )} />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <div className="absolute right-3 w-2 h-2 rounded-full bg-white/80" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Footer - User Profile */}
                <div className="relative z-10 p-4 border-t border-[#D4896B]/20 bg-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 p-3 hover:bg-white/50 rounded-xl cursor-pointer transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4896B] to-[#E8B4A0] border-2 border-white flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">{getInitials()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#4A4A4A] group-hover:text-[#D4896B] truncate transition-colors">
                                {getUserName()}
                            </p>
                            <p className="text-xs text-[#7A7A7A] truncate">{getUserRole()}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
