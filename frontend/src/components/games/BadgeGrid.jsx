
import { mockBadges } from '@/services/mockData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Lock, Award } from 'lucide-react';

export function BadgeGrid() {
    const rarityColors = {
        common: "border-gray-200 text-gray-400 bg-gray-50",
        rare: "border-brand-blue/30 text-brand-blue bg-brand-blue/5 shadow-brand-blue/10",
        epic: "border-brand-purple/30 text-brand-purple bg-brand-purple/5 shadow-brand-purple/10",
        legendary: "border-brand-yellow/50 text-brand-yellow-dark bg-brand-yellow/5 shadow-brand-yellow/20 animate-pulse-slow"
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mockBadges.map((badge, index) => (
                <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={!badge.is_locked ? { scale: 1.05, y: -5 } : {}}
                    className={cn(
                        "relative aspect-square rounded-[2rem] p-6 flex flex-col items-center justify-center text-center border-2 transition-all duration-300 group cursor-pointer",
                        badge.is_locked ? "bg-gray-50 border-gray-100 grayscale hover:grayscale-0" : "bg-white shadow-sm hover:shadow-xl",
                        !badge.is_locked && rarityColors[badge.rarity] || "border-gray-100"
                    )}
                >
                    {/* Badge Icon */}
                    <div className="text-6xl mb-4 transform transition-transform duration-500 group-hover:scale-110 relative z-10">
                        {badge.img_url ? (
                            <img src={badge.img_url} alt={badge.name} className="w-20 h-20 object-contain" />
                        ) : (
                            <span>{badge.icon || "🏅"}</span>
                        )}

                        {badge.is_locked && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                <Lock size={32} />
                            </div>
                        )}
                    </div>

                    <h3 className={cn("font-poppins font-bold text-sm mb-1 line-clamp-2", badge.is_locked ? "text-gray-400" : "text-brand-navy")}>
                        {badge.name}
                    </h3>

                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2",
                        badge.is_locked ? "bg-gray-200 text-gray-500" :
                            badge.category === 'Behavior' ? "bg-brand-green/10 text-brand-green" :
                                "bg-brand-blue/10 text-brand-blue"
                    )}>
                        {badge.category}
                    </span>

                    {!badge.is_locked && (
                        <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold text-gray-400">
                            Earned {badge.earned_date}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
