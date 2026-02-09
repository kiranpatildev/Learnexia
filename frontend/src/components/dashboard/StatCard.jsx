import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Trophy } from 'lucide-react';

export function StatCard({
    title,
    subtitle,
    badgeValue,
    badgeColor,
    badgeTextSize = "text-2xl",
    icon: Icon,
    progressValue,
    isSelected,
    onClick
}) {
    // Badge color mapping
    const badgeColors = {
        orange: "bg-brand-orange text-white shadow-brand-orange/30",
        yellow: "bg-brand-yellow text-brand-navy shadow-brand-yellow/30",
        blue: "bg-brand-blue text-white shadow-brand-blue/30",
        green: "bg-brand-green text-brand-navy shadow-brand-green/30",
    };

    return (
        <motion.div
            layoutId={`card-${title}`}
            onClick={onClick}
            className={cn(
                "relative bg-white rounded-[2rem] p-6 shadow-sm border border-brand-light-gray/20 cursor-pointer overflow-hidden transition-all duration-300 group",
                isSelected ? "ring-4 ring-brand-purple/20 shadow-xl scale-[1.02]" : "hover:-translate-y-1 hover:shadow-md"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-instrument font-medium text-brand-navy text-lg">{title}</h3>
                    <p className="text-sm text-gray-400 font-instrument mt-1">{subtitle}</p>
                </div>
                {/* Checkmark or Icon */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                    isSelected ? "bg-brand-green text-white" : "bg-brand-very-light text-brand-light-gray group-hover:bg-brand-green/20 group-hover:text-brand-green"
                )}>
                    {Icon ? <Icon size={16} strokeWidth={3} /> : <Check size={16} strokeWidth={3} />}
                </div>
            </div>

            <div className="flex items-end justify-between">
                {progressValue ? (
                    // Circular Progress for Average
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full rotate-[-90deg]">
                            <circle cx="32" cy="32" r="28" stroke="#EBE9F1" strokeWidth="6" fill="transparent" />
                            <circle
                                cx="32" cy="32" r="28"
                                stroke="#12F82D" strokeWidth="6"
                                strokeDasharray={175.9}
                                strokeDashoffset={175.9 - (175.9 * progressValue) / 100}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm text-brand-navy">
                            {progressValue}%
                        </span>
                    </div>
                ) : (
                    // Badge
                    <div className={cn(
                        "rounded-full px-6 py-2 shadow-lg font-bold flex items-center justify-center min-w-[3rem]",
                        badgeColors[badgeColor] || badgeColors.orange,
                        badgeTextSize
                    )}>
                        {badgeValue}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
