
import { mockGrades } from '@/services/mockData';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { GradesGraph } from '@/components/dashboard/GradesGraph';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function AverageExpanded() {
    return (
        <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in slide-in-from-top-5 duration-500">
            {/* Left: Overall Score */}
            <div className="w-full xl:w-1/3 flex flex-col items-center justify-center bg-brand-very-light/20 rounded-[2rem] p-8 border border-brand-light-gray/20">
                <div className="relative mb-8 transform hover:scale-105 transition-transform duration-300">
                    <CircularProgress
                        value={mockGrades.overall_percentage}
                        size={200}
                        strokeWidth={15}
                        color="#12F82D"
                        trackColor="#EBE9F1"
                        textSub="Overall Score"
                    />

                    {/* Floating GPA Badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="absolute -bottom-4 bg-white shadow-lg rounded-full px-6 py-2 border border-brand-light-gray/20 flex flex-col items-center"
                    >
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">GPA</span>
                        <span className="text-xl font-poppins font-bold text-brand-navy">{mockGrades.gpa}</span>
                    </motion.div>
                </div>

                <div className="w-full space-y-3 mt-4">
                    {mockGrades.subjects.map((subject, index) => (
                        <div key={subject.subject} className="flex items-center justify-between w-full p-3 bg-white rounded-xl shadow-sm border border-brand-light-gray/10">
                            <span className="font-bold text-brand-navy text-sm font-poppins">{subject.subject}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 rounded-full bg-brand-very-light overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subject.percentage}%` }}
                                        transition={{ delay: 0.5 + (index * 0.1), duration: 1 }}
                                        className={cn(
                                            "h-full rounded-full",
                                            subject.percentage >= 90 ? "bg-brand-green" :
                                                subject.percentage >= 80 ? "bg-brand-blue" : "bg-brand-yellow"
                                        )}
                                    />
                                </div>
                                <span className="font-bold text-xs w-8 text-right">{subject.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Performance Graph */}
            <div className="flex-1 bg-white rounded-[2rem] p-2 shadow-lg border border-brand-light-gray/20 min-h-[400px]">
                <GradesGraph data={mockGrades.trend_data} />
            </div>
        </div>
    );
}
