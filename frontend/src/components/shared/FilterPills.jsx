
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Clock, FileText } from 'lucide-react';

export function FilterPills({ items, activeFilter, onFilterChange }) {
    return (
        <div className="flex flex-wrap gap-3 items-center">
            <span className="text-gray-400 text-sm font-instrument mr-2">sorted by :</span>
            {items.map((item) => {
                const isActive = activeFilter === item.value;
                return (
                    <motion.button
                        key={item.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onFilterChange(item.value)}
                        className={cn(
                            "relative flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-sm border",
                            isActive
                                ? "text-white shadow-md border-transparent ring-2 ring-offset-2 ring-transparent"
                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50",
                            isActive && item.colorClass // Apply specific color class when active (e.g. bg-brand-orange)
                        )}
                        style={{
                            backgroundColor: isActive ? item.color : undefined,
                            borderColor: isActive ? item.color : undefined
                        }}
                    >
                        {item.label}
                        {item.count !== undefined && (
                            <span className={cn(
                                "flex items-center justify-center w-5 h-5 rounded-full text-[10px]",
                                isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                            )}>
                                {item.count}
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
