import { Heart, Zap } from 'lucide-react';

export default function GameHUD({ lives, score, combo, currentQuestion, totalQuestions }) {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-start justify-between">

                {/* Left: Lives & Progress */}
                <div className="flex flex-col gap-2">
                    {/* Lives */}
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        {[...Array(3)].map((_, i) => (
                            <Heart
                                key={i}
                                className={`w-5 h-5 transition-all duration-300 ${i < lives
                                        ? 'text-red-500 fill-red-500 scale-100'
                                        : 'text-gray-600 fill-gray-900 scale-90'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Progress */}
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-slate-300 font-medium tracking-wide">
                        Question {currentQuestion} / {totalQuestions}
                    </div>
                </div>

                {/* Right: Score & Combo */}
                <div className="flex flex-col items-end gap-2">
                    {/* Score */}
                    <div className="bg-gradient-to-r from-blue-900/80 to-slate-900/80 backdrop-blur-md px-5 py-2 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                        <span className="text-2xl font-black text-white tracking-widest tabular-nums drop-shadow-sm">
                            {score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-blue-300 ml-1 uppercase font-bold">PTS</span>
                    </div>

                    {/* Combo */}
                    {combo > 1 && (
                        <div className="flex items-center gap-1 animate-bounce bg-yellow-500/20 px-2 py-0.5 rounded-lg border border-yellow-500/40">
                            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold text-yellow-400">
                                {combo}x COMBO
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar Top */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500 ease-out"
                    style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                />
            </div>
        </div>
    );
}
