import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Sidebar({ items, isOpen, onClose, isMobile }) {
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
                    'fixed lg:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen border-r border-slate-200 bg-white transition-transform duration-300',
                    isMobile && !isOpen && '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">EduPlatform</h2>
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="space-y-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && onClose()}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    )
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                        © 2026 EduPlatform
                    </p>
                </div>
            </aside>
        </>
    );
}
