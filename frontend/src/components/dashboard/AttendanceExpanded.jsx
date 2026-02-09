
import { mockAttendance } from '@/services/mockData';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function AttendanceExpanded() {
    const total = mockAttendance.length;
    const present = mockAttendance.filter(a => a.status === 'present').length;
    const percentage = Math.round((present / total) * 100);

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-top-5 duration-500">
            {/* Left: Attendance List */}
            <div className="flex-1 overflow-hidden">
                <div className="space-y-4">
                    {mockAttendance.slice(0, 5).map((record, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-light-gray/20 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                                    record.status === 'present' ? "bg-brand-green shadow-brand-green/20" :
                                        record.status === 'late' ? "bg-brand-yellow shadow-brand-yellow/20" :
                                            "bg-brand-orange shadow-brand-orange/20"
                                )}>
                                    {record.status === 'present' ? <Check size={18} strokeWidth={3} /> : record.status === 'late' ? <Clock size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-navy font-poppins">{record.subject}</h4>
                                    <p className="text-xs text-brand-light-gray font-instrument flex items-center gap-1">
                                        <Clock size={10} /> {record.date} • {record.session_type}
                                    </p>
                                </div>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                record.status === 'present' ? "bg-brand-green/10 text-brand-green" :
                                    record.status === 'late' ? "bg-brand-yellow/10 text-brand-navy" :
                                        "bg-brand-orange/10 text-brand-orange"
                            )}>
                                {record.status}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right: Stats & Mascot */}
            <div className="w-full lg:w-1/3 flex flex-col items-center justify-center bg-brand-very-light/30 rounded-[2rem] p-8 border border-white relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="mb-8 transform scale-125">
                    <CircularProgress value={percentage} color="#FFC71B" trackColor="#EBE9F1" size={160} strokeWidth={12} textSub="Attended" />
                </div>

                <div className="text-center relative z-10">
                    <h3 className="text-xl font-poppins font-bold text-brand-navy mb-2">Be Quick for next!!!</h3>
                    <p className="text-sm text-gray-400 font-instrument">Keep your streak alive 🔥</p>
                </div>

                {/* 🎨 BRAND ASSET: Replace with car/vehicle illustration */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-6 w-40 h-24 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300"
                >
                    <span className="text-4xl">🏎️</span>
                </motion.div>
            </div>
        </div>
    );
}
