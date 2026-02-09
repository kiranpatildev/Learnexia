
import { mockQuizzes } from '@/services/mockData';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/utils';
import { Play, RotateCw, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuizAttempts() {
    return (
        <div className="animate-in fade-in slide-in-from-right-5 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-poppins text-brand-navy">Recent Challenges</h3>
                <Button variant="cta" className="rounded-full shadow-brand-blue/30 gap-2">
                    <Play size={16} fill="currentColor" /> Start New Quiz
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockQuizzes.attempts.map((quiz, index) => (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-light-gray/20 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                        {/* Status Stripe */}
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1",
                            quiz.status === 'Completed' ? "bg-brand-green" : "bg-brand-orange"
                        )} />

                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md",
                                quiz.subject === 'Mathematics' ? "bg-brand-blue shadow-brand-blue/20" :
                                    quiz.subject === 'Science' ? "bg-brand-green shadow-brand-green/20" :
                                        "bg-brand-orange shadow-brand-orange/20"
                            )}>
                                {quiz.subject[0]}
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                quiz.difficulty === 'hard' ? "bg-red-100 text-red-500" :
                                    quiz.difficulty === 'medium' ? "bg-brand-yellow/10 text-brand-yellow-dark" :
                                        "bg-brand-green/10 text-brand-green"
                            )}>
                                {quiz.difficulty}
                            </span>
                        </div>

                        <h4 className="font-poppins font-bold text-brand-navy text-lg mb-1">{quiz.title}</h4>
                        <p className="text-xs text-brand-light-gray font-instrument font-medium mb-4">{quiz.topic}</p>

                        <div className="flex items-center justify-between mt-auto">
                            {quiz.status === 'Completed' ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-brand-navy">{quiz.score}%</span>
                                    <CheckCircle size={16} className="text-brand-green" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-brand-orange text-xs font-bold bg-brand-orange/10 px-3 py-1 rounded-full">
                                    <Clock size={12} /> In Progress
                                </div>
                            )}

                            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-colors text-gray-400">
                                <RotateCw size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
