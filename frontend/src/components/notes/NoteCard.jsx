
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileText, Calendar, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/shared/Button';

export function NoteCard({ note, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-light-gray/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md",
                    note.subject === 'Mathematics' ? "bg-brand-blue shadow-brand-blue/30" :
                        note.subject === 'Science' ? "bg-brand-green shadow-brand-green/30" :
                            "bg-brand-orange shadow-brand-orange/30"
                )}>
                    {/* Subject Initial */}
                    {note.subject[0]}
                </div>

                {note.is_ai_generated && (
                    <span className="bg-brand-purple/10 text-brand-purple text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <Sparkles size={12} /> AI Generated
                    </span>
                )}
            </div>

            <h3 className="font-poppins font-bold text-lg text-brand-navy mb-1 line-clamp-1" title={note.title}>
                {note.title}
            </h3>

            <p className="text-sm text-gray-400 font-instrument mb-4 flex items-center gap-2">
                <span>{note.chapter}</span> • <span>{note.topic}</span>
            </p>

            <div className="flex flex-col gap-1 text-xs text-gray-400 mb-6 font-instrument">
                <span className="flex items-center gap-1">By {note.teacher_name}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Added {note.date_added}</span>
            </div>

            <div className="flex items-center gap-3 mt-auto">
                <Button
                    className="flex-1 bg-brand-navy hover:bg-brand-purple text-white shadow-lg rounded-xl py-3 text-sm font-bold"
                >
                    <FileText size={16} className="mr-2" /> View
                </Button>

                <button
                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-brand-light-gray/20 hover:border-brand-navy hover:text-brand-navy hover:bg-brand-very-light transition-colors text-gray-400"
                    title="Download PDF"
                >
                    <Download size={20} />
                </button>
            </div>
        </motion.div>
    );
}
