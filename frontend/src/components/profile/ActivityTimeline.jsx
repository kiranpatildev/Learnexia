
import { mockActivityLog } from '@/services/mockData';
import { LogIn, FileText, CheckCircle, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ActivityTimeline() {
    const iconMap = {
        LogIn: LogIn,
        FileText: FileText,
        CheckCircle: CheckCircle,
        BookOpen: BookOpen,
    };

    const colorMap = {
        login: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
        submission: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
        quiz: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
        notes: "bg-brand-green/10 text-brand-green border-brand-green/20",
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20 animate-in fade-in slide-in-from-right-5 duration-500">
            <h3 className="text-xl font-bold font-poppins text-brand-navy mb-8 border-b pb-4">Recent Activity</h3>

            <div className="relative border-l-2 border-brand-light-gray/20 ml-4 space-y-8">
                {mockActivityLog.map((activity, index) => {
                    const Icon = iconMap[activity.icon] || Clock;
                    return (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={activity.id}
                            className="relative pl-8 group"
                        >
                            <span className={cn(
                                "absolute -left-5 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all shadow-sm group-hover:scale-110",
                                colorMap[activity.type] || "bg-gray-100 text-gray-500"
                            )}>
                                <Icon size={18} strokeWidth={2.5} />
                            </span>

                            <div className="bg-brand-very-light/20 p-4 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-brand-light-gray/20 transition-all">
                                <p className="font-poppins font-bold text-brand-navy text-sm mb-1">{activity.description}</p>
                                <span className="text-xs text-brand-light-gray font-instrument flex items-center gap-1">
                                    <Clock size={12} /> {new Date(activity.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <button className="w-full mt-8 text-center text-sm font-bold text-brand-purple hover:text-brand-navy hover:underline transition-colors">
                Load More History
            </button>
        </div>
    );
}
