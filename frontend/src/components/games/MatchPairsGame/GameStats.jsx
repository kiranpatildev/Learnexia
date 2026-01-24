
import React from 'react';

export const GameStats = ({
    matches,
    totalPairs,
    flips,
    perfectFlips,
    timeElapsed,
    score
}) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const efficiency = flips > 0 ? ((perfectFlips / flips) * 100) : 100;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Matches */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                <div className="text-white text-3xl font-bold">
                    {matches}/{totalPairs}
                </div>
                <div className="text-white/60 text-sm">Matches</div>
            </div>

            {/* Flips */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                <div className="text-white text-3xl font-bold">{flips}</div>
                <div className="text-white/60 text-sm">Flips</div>
            </div>

            {/* Time */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                <div className="text-white text-3xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="text-white/60 text-sm">Time</div>
            </div>

            {/* Score */}
            <div className="backdrop-blur-lg bg-gradient-to-r from-cyan-500 to-blue-500 
                      border border-white/20 rounded-xl p-4 text-center">
                <div className="text-white text-3xl font-bold">{score}</div>
                <div className="text-white/80 text-sm">Score</div>
            </div>

            {/* Efficiency Bar */}
            {flips > 0 && (
                <div className="col-span-2 md:col-span-4 backdrop-blur-lg bg-white/10 
                        border border-white/20 rounded-xl p-3">
                    <div className="flex justify-between items-center text-white">
                        <span className="text-sm">Memory Efficiency</span>
                        <span className="font-bold">{efficiency.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${efficiency > 80 ? 'bg-green-500' :
                                    efficiency > 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(efficiency, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
