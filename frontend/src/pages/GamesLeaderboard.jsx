
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GamificationProfile } from '@/components/games/GamificationProfile';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { BadgeGrid } from '@/components/games/BadgeGrid';
import { QuizAttempts } from '@/components/games/QuizAttempts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Gamepad2, Search } from 'lucide-react';

export function GamesLeaderboard() {
    const [activeTab, setActiveTab] = useState('leaderboard');

    const tabs = [
        { id: 'leaderboard', label: 'Class Leaderboard', icon: Trophy },
        { id: 'badges', label: 'My Badges', icon: Star },
        { id: 'quizzes', label: 'Quizzes & Games', icon: Gamepad2 },
    ];

    return (
        <div className="font-instrument pb-20 container mx-auto px-4 lg:px-8">
            <Header
                title="Games & Leaderboard"
                subtitle="Complete challenges and earn rewards!"
            />

            <GamificationProfile />

            {/* Tabs */}
            <div className="flex justify-center mb-12">
                <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-brand-light-gray/20">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-brand-navy text-white shadow-brand-navy/30 shadow-md transform scale-105"
                                    : "bg-transparent text-gray-400 hover:text-brand-navy hover:bg-gray-50"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'leaderboard' && (
                        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-light-gray/20">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold font-poppins text-brand-navy flex items-center gap-2">
                                    <Trophy className="text-brand-yellow-dark" /> Top Students
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Find friend..."
                                        className="pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
                                    />
                                </div>
                            </div>
                            <LeaderboardList />
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold font-poppins text-brand-navy">My Collection</h3>
                                <div className="flex gap-2">
                                    {['All', 'Common', 'Rare', 'Epic', 'Legendary'].map(filter => (
                                        <button key={filter} className="text-xs font-bold px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-brand-very-light hover:text-brand-navy transition-colors">
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <BadgeGrid />
                        </div>
                    )}

                    {activeTab === 'quizzes' && <QuizAttempts />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
