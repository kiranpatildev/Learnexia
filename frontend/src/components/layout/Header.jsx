import { Flame } from 'lucide-react';
import { mockUser } from '@/services/mockData';

export function Header({ title, subtitle }) {
    return (
        <header className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-brand-light-gray/20 relative overflow-hidden mb-8 group">
            {/* Mascot Placeholder - Greeting Monster */}
            {/* 🎨 BRAND ASSET: Replace with greeting monster illustration */}
            <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10">
                <h1 className="text-3xl font-poppins font-bold text-brand-navy mb-2 animate-in slide-in-from-left duration-500">
                    {title || `Hello ${mockUser.first_name}! 👋`}
                </h1>
                <p className="text-lg font-instrument text-gray-500 animate-in slide-in-from-left duration-700 delay-100">
                    {subtitle || "It's good to see you again"}
                </p>
            </div>

            <div className="flex items-center gap-6 relative z-10">
                {/* Streak Badge */}
                <div className="bg-brand-navy text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-default">
                    <div className="bg-brand-orange p-1.5 rounded-full animate-pulse">
                        <Flame size={20} fill="white" className="text-white" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-brand-light-gray uppercase tracking-wider block leading-none mb-1">Current</span>
                        <span className="text-lg font-bold font-poppins leading-none">Streak {mockUser.current_streak}</span>
                    </div>
                </div>

                {/* 🎨 BRAND ASSET: Replace with specific greeting monster PNG */}
                <div className="w-24 h-24 bg-gradient-to-br from-brand-purple to-brand-blue rounded-2xl flex items-center justify-center opacity-80 rotate-12 transform translate-y-2 hover:rotate-0 transition-transform duration-500 shadow-xl border-4 border-white">
                    <span className="text-white text-xs font-bold emoji">👾</span>
                </div>
            </div>
        </header>
    );
}
