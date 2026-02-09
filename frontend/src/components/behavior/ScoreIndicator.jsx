
import { CircularProgress } from '@/components/shared/CircularProgress';
import { mockBehavior } from '@/services/mockData';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ScoreIndicator() {
    const { current_score, trend, class_average } = mockBehavior;

    const getTrendIcon = () => {
        if (trend === 'improving') return <ArrowUp size={20} className="text-brand-green" />;
        if (trend === 'declining') return <ArrowDown size={20} className="text-brand-orange" />;
        return <ArrowRight size={20} className="text-gray-400" />;
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-light-gray/20 max-w-md mx-auto text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-brand-very-light/20 to-transparent -z-10" />

            <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500">
                <CircularProgress
                    value={current_score}
                    size={220}
                    strokeWidth={18}
                    color={current_score >= 80 ? "#12F82D" : current_score >= 60 ? "#FFC71B" : "#F24400"}
                    trackColor="#F5F4F9"
                    showText={false}
                />

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-poppins font-bold text-brand-navy mb-1">{current_score}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Behavior Score</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {getTrendIcon()}
                    <span className={cn(
                        "font-bold text-sm capitalise",
                        trend === 'improving' ? "text-brand-green" : trend === 'declining' ? "text-brand-orange" : "text-gray-500"
                    )}>
                        {trend}
                    </span>
                </div>
            </div>

            <p className="text-sm font-instrument text-gray-400">
                Class Average: <span className="font-bold text-brand-navy">{class_average}</span>
            </p>
        </div>
    );
}
