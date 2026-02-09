
import { mockUser } from '@/services/mockData';
import { Avatar } from '@/components/shared/Avatar';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { motion } from 'framer-motion';
import { Star, Flame, Trophy, Award } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility

export function GamificationProfile() {
    const nextLevelXP = mockUser.xp_to_next_level + mockUser.total_xp; // Mock calculation
    const progress = (mockUser.total_xp / nextLevelXP) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-light-gray/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 mb-12 relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/5 to-brand-blue/5 rounded-full blur-3xl -z-10" />

            {/* Avatar & Level */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-brand-purple to-brand-blue shadow-lg">
                    <Avatar src={mockUser.avatar} alt={mockUser.name} size="2xl" className="border-4 border-white" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-navy text-white px-4 py-1 rounded-full text-sm font-bold shadow-md border-2 border-white whitespace-nowrap">
                    Level {mockUser.current_level}
                </div>
            </div>

            {/* Stats & Progress */}
            <div className="flex-1 w-full text-center md:text-left space-y-6">
                <div>
                    <h2 className="text-3xl font-poppins font-bold text-brand-navy mb-1">{mockUser.name}</h2>
                    <p className="text-gray-400 font-instrument">Keep pushing! You're doing great 🚀</p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                        <span>XP Progress</span>
                        <span className="text-brand-purple">{mockUser.total_xp} / {nextLevelXP} XP</span>
                    </div>
                    <div className="w-full bg-brand-very-light h-4 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse w-full h-full" />
                        </motion.div>
                    </div>
                </div>

                <div className="flex justify-between gap-4 mt-6">
                    {[
                        { label: 'Current Streak', value: `${mockUser.current_streak} days`, icon: Flame, color: 'text-brand-orange bg-brand-orange/10' },
                        { label: 'Longest Streak', value: `${mockUser.longest_streak} days`, icon: Trophy, color: 'text-brand-yellow-dark bg-brand-yellow/10' }, // customized yellow
                        { label: 'Total XP', value: mockUser.total_xp, icon: Star, color: 'text-brand-purple bg-brand-purple/10' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center md:items-start flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-2", stat.color)}>
                                <stat.icon size={16} fill="currentColor" className="opacity-80" />
                            </div>
                            <span className="text-lg font-bold font-poppins text-brand-navy">{stat.value}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
