
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/shared/SearchBar';
import { NoteCard } from '@/components/notes/NoteCard';
import { FlashcardViewer } from '@/components/notes/FlashcardViewer';
import { mockNotes, mockFlashcardSets, mockFlashcards } from '@/services/mockData';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function NotesFlashcards() {
    const [activeTab, setActiveTab] = useState('notes');
    const [selectedSet, setSelectedSet] = useState(null);

    return (
        <div className="font-instrument pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
            <Header
                title="Notes & Flashcards"
                subtitle="Your personal knowledge base"
            />

            {/* Tabs */}
            <div className="flex gap-4 mb-8 bg-white p-2 rounded-[2rem] shadow-sm border border-brand-light-gray/20 w-fit">
                {['notes', 'flashcards'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 capitalize",
                            activeTab === tab
                                ? "bg-brand-navy text-white shadow-brand-navy/30 shadow-md"
                                : "bg-transparent text-gray-400 hover:text-brand-navy hover:bg-gray-50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'notes' ? (
                    <motion.div
                        key="notes"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Notes Section */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <SearchBar placeholder="Search notes..." className="w-full md:w-1/2" />
                            <div className="flex gap-2">
                                {/* Subject Filter Dropdown Mock */}
                                <select className="bg-white border border-brand-light-gray/20 px-4 py-2 rounded-full text-sm font-bold text-gray-500 focus:ring-2 focus:ring-brand-purple">
                                    <option>All Subjects</option>
                                    <option>Mathematics</option>
                                    <option>Science</option>
                                    <option>English</option>
                                </select>
                            </div>
                        </div>

                        {mockNotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mockNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-brand-light-gray/20">
                                {/* 🎨 BRAND ASSET: Replace with reading monster */}
                                <div className="text-6xl mb-4 grayscale opacity-50">👾</div>
                                <h3 className="font-poppins font-bold text-xl text-gray-400">No notes found!</h3>
                                <p className="text-gray-400 font-instrument text-sm">Create your first note to get started.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="flashcards"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Flashcards Section */}
                        {!selectedSet ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {mockFlashcardSets.map((set) => (
                                    <motion.div
                                        key={set.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedSet(set)}
                                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20 cursor-pointer group hover:shadow-xl hover:border-brand-purple/30 transition-all duration-300"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-brand-very-light flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:bg-brand-purple group-hover:text-white transition-colors duration-300">
                                            📚
                                        </div>
                                        <h3 className="font-poppins font-bold text-xl text-brand-navy mb-2 line-clamp-1">{set.title}</h3>
                                        <span className={cn(
                                            "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6",
                                            set.subject === 'Mathematics' ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-green/10 text-brand-green"
                                        )}>
                                            {set.subject}
                                        </span>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-xs font-bold text-gray-400">
                                                <span>Progress</span>
                                                <span className="text-brand-purple">{set.cards_studied}/{set.total_cards} Cards</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all duration-500 group-hover:w-full"
                                                    style={{ width: `${(set.cards_studied / set.total_cards) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <FlashcardViewer
                                flashcards={mockFlashcards.filter(f => f.set_id === selectedSet.id)}
                                setInfo={selectedSet}
                                onClose={() => setSelectedSet(null)}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
