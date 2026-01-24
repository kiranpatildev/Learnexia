import React, { useState } from 'react';

const GameControls = ({ onCheck, onRevealLetter, onRevealWord, gameState, startValidation }) => {
    const [showHints, setShowHints] = useState(false);

    return (
        <div className="flex flex-col items-center gap-2 mt-6">
            <div className="flex flex-wrap gap-3 justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <button
                    onClick={onCheck}
                    disabled={gameState === 'loading' || gameState === 'checking'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg shadow-md transition-all font-bold tracking-wide active:scale-95 disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Check Puzzle
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowHints(!showHints)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-lg shadow-md transition-all font-bold tracking-wide active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        Hints
                    </button>

                    {showHints && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden ring-1 ring-black/5">
                            <button
                                onClick={() => { onRevealLetter(); setShowHints(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <span className="bg-amber-100 text-amber-600 rounded px-1.5 py-0.5 text-xs font-bold">A</span>
                                Reveal Letter
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                            <button
                                onClick={() => { onRevealWord(); setShowHints(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <span className="bg-amber-100 text-amber-600 rounded px-1.5 py-0.5 text-xs font-bold">ABC</span>
                                Reveal Word
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback Message */}
            {startValidation && (startValidation.correct.length > 0 || startValidation.incorrect.length > 0) && (
                <div className="flex gap-4 text-sm font-medium animate-fade-in-up">
                    {startValidation.correct.length > 0 && (
                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            {startValidation.correct.length} Correct
                        </span>
                    )}
                    {startValidation.incorrect.length > 0 && (
                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                            {startValidation.incorrect.length} Incorrect
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default GameControls;
