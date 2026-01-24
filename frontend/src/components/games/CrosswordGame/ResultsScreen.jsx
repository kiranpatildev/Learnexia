import React from 'react';

const ResultsScreen = ({ score, results, onRestart }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        Puzzle Completed!
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Great job mastering this topic.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-8">
                    <div className="text-5xl font-black text-slate-800 dark:text-white mb-2">
                        {score}
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Score</div>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span>Time Bonus</span>
                        <span className="font-mono font-bold text-green-600">+{results?.time_bonus || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span>Hints Penalty</span>
                        <span className="font-mono font-bold text-red-500">{results?.hints_penalty || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-200">XP Earned</span>
                        <span className="font-mono font-bold text-amber-500">+{results?.xp_earned || 0} XP</span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 mb-3"
                >
                    Play Again
                </button>
                <button
                    onClick={() => window.location.href = '/student/dashboard'}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all active:scale-95"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ResultsScreen;
