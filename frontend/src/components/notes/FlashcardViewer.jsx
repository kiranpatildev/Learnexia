
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/utils'; // Assuming cn utility

export function FlashcardViewer({ flashcards, setInfo, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const currentCard = flashcards[currentIndex];

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleConfidence = (level) => {
        // Mock handle confidence logic
        console.log(`Marked as ${level}`);
        handleNext();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
            {/* Main Flashcard Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* Progress Indicator */}
                <div className="absolute top-0 w-full flex justify-between items-center px-4 mb-4">
                    <span className="font-bold text-gray-400 font-instrument">Card {currentIndex + 1} / {flashcards.length}</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-brand-navy">Close</button>
                </div>

                {/* The Card */}
                <div
                    className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer perspective-1000"
                    onClick={handleFlip}
                >
                    <motion.div
                        className="w-full h-full relative transform-style-3d transition-all duration-600"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    >
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border border-brand-light-gray/20 flex flex-col items-center justify-center p-12 text-center group hover:shadow-2xl transition-shadow">
                            <div className="absolute top-6 right-6 text-brand-light-gray group-hover:text-brand-purple transition-colors">
                                <HelpCircle size={32} />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-poppins font-bold text-brand-navy leading-tight">
                                {currentCard.question}
                            </h3>
                            <p className="mt-6 text-gray-400 font-instrument text-sm">Click to flip</p>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute w-full h-full backface-hidden bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl shadow-xl flex flex-col items-center justify-center p-12 text-center text-white transform rotate-y-180"
                            style={{ transform: "rotateY(180deg)" }}
                        >
                            <div className="absolute top-6 right-6 text-white/50">
                                <Sparkles size={32} />
                            </div>
                            <p className="text-2xl md:text-3xl font-instrument font-medium leading-relaxed">
                                {currentCard.answer}
                            </p>
                            {currentCard.hint && (
                                <div className="mt-8 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
                                    <p className="text-sm font-bold text-brand-yellow">💡 Hint: {currentCard.hint}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Navigation & Controls */}
                <div className="mt-12 flex flex-col items-center gap-6 w-full max-w-2xl">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            disabled={currentIndex === 0}
                            variant="secondary"
                            className="rounded-full w-12 h-12 p-0 flex items-center justify-center disabled:opacity-30"
                        >
                            <ChevronLeft size={24} />
                        </Button>

                        {/* Confidence Buttons (Only show when flipped?) - Prompt says visible below */}
                        <div className="flex gap-4">
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleConfidence('hard'); }}
                                className="bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white min-w-[100px]"
                            >
                                Hard
                            </Button>
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleConfidence('medium'); }}
                                className="bg-brand-yellow hover:bg-yellow-500 shadow-yellow-500/30 text-brand-navy min-w-[100px]"
                            >
                                Medium
                            </Button>
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleConfidence('easy'); }}
                                className="bg-brand-green hover:bg-green-600 shadow-green-500/30 text-white min-w-[100px]"
                            >
                                Easy
                            </Button>
                        </div>

                        <Button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            disabled={currentIndex === flashcards.length - 1}
                            variant="secondary"
                            className="rounded-full w-12 h-12 p-0 flex items-center justify-center disabled:opacity-30"
                        >
                            <ChevronRight size={24} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="w-full lg:w-80 bg-white rounded-[2rem] p-6 shadow-sm border border-brand-light-gray/20 h-fit">
                <h3 className="font-poppins font-bold text-lg text-brand-navy mb-6">Session Stats</h3>

                <div className="space-y-6">
                    <div className="bg-brand-very-light/50 p-4 rounded-xl">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Cards Studied</span>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-brand-navy">{currentIndex + 1}</span>
                            <span className="text-gray-400 mb-1">/ {flashcards.length}</span>
                        </div>
                    </div>

                    <div className="bg-brand-very-light/50 p-4 rounded-xl">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Mastery</span>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-brand-green h-full rounded-full" style={{ width: `${setInfo?.mastery_percentage || 0}%` }} />
                        </div>
                        <span className="text-right block text-xs font-bold text-brand-green mt-1">{setInfo?.mastery_percentage || 0}%</span>
                    </div>

                    <div className="bg-brand-purple/5 p-4 rounded-xl border border-brand-purple/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="text-brand-yellow fill-brand-yellow" size={16} />
                            <span className="font-bold text-brand-navy text-sm">XP Earned</span>
                        </div>
                        <span className="text-2xl font-bold text-brand-purple">+{(currentIndex + 1) * 5} XP</span>
                    </div>
                </div>

                {/* 🎨 BRAND ASSET: Replace with studying monster */}
                <div className="mt-8 flex justify-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center opacity-50">
                        <span className="text-4xl">👾</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
