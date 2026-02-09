
import { mockQuizzes } from '@/services/mockData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

export function QuizExpanded() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-5 duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: mockQuizzes.total, icon: '📚', color: 'bg-brand-blue/10 text-brand-blue' },
                    { label: 'Completed', value: mockQuizzes.completed, icon: '✅', color: 'bg-brand-green/10 text-brand-green' },
                    { label: 'Remaining', value: mockQuizzes.remaining, icon: '⏳', color: 'bg-brand-orange/10 text-brand-orange' },
                    { label: 'Average', value: `${mockQuizzes.average}%`, icon: '🎯', color: 'bg-brand-purple/10 text-brand-purple' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-brand-very-light/50 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-brand-light-gray/20"
                    >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2", stat.color)}>
                            {stat.icon}
                        </div>
                        <span className="text-3xl font-poppins font-bold text-brand-navy">{stat.value}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Quiz List */}
            <h3 className="font-poppins font-bold text-lg text-brand-navy border-b pb-2 mb-4">Quiz History</h3>

            <div className="space-y-3">
                {mockQuizzes.attempts.map((quiz, index) => (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-brand-light-gray/20 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transform group-hover:rotate-12 transition-transform",
                                quiz.subject === 'Mathematics' ? "bg-brand-orange shadow-brand-orange/20" :
                                    quiz.subject === 'Science' ? "bg-brand-green shadow-brand-green/20" :
                                        "bg-brand-blue shadow-brand-blue/20"
                            )}>
                                <span className="font-poppins font-bold text-lg">{quiz.subject[0]}</span>
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-brand-navy">{quiz.title}</h4>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider",
                                        quiz.difficulty === 'hard' ? "bg-brand-orange/10 text-brand-orange" :
                                            quiz.difficulty === 'medium' ? "bg-brand-yellow/10 text-brand-yellow-dark" :
                                                "bg-brand-green/10 text-brand-green"
                                    )}>
                                        {quiz.difficulty}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-light-gray font-instrument flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1"><Clock size={10} /> Due {quiz.due_date}</span>
                                    <span>•</span>
                                    <span>{quiz.topic}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            {quiz.status === 'Completed' ? (
                                <>
                                    <span className="text-2xl font-bold font-poppins text-brand-navy">{quiz.score}%</span>
                                    <span className="flex items-center gap-1 text-xs text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded-full">
                                        <CheckCircle size={10} /> Completed
                                    </span>
                                </>
                            ) : (
                                <span className="flex items-center gap-1 text-xs text-brand-orange font-bold bg-brand-orange/10 px-3 py-1 rounded-full animate-pulse">
                                    In Progress
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
