
import React, { useEffect, useState } from 'react';

export const ResultsScreen = ({
    gameState,
    pairs,
    onPlayAgain
}) => {
    const [scoreBreakdown, setScoreBreakdown] = useState(null);

    const perfectFlips = pairs.length * 2;
    const efficiency = gameState.flips > 0 ? (perfectFlips / gameState.flips) * 100 : 0;
    const isPerfect = gameState.flips === perfectFlips;

    useEffect(() => {
        // In real implementation, the score breakdown might come from the final API response
        // But we can approximate display here
        setScoreBreakdown({
            base_points: gameState.matches * 100,
            efficiency_bonus: Math.max(0, (perfectFlips - gameState.flips) * 10), // approximate logic
            memory_bonus: Math.floor(efficiency * 2),
            final_score: gameState.score
        });
    }, [gameState, pairs.length, perfectFlips, efficiency]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
                    flex items-center justify-center p-4">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-8xl mb-4">
                        {isPerfect ? '🏆' : '🎉'}
                    </div>
                    <h2 className="text-5xl font-black text-white mb-2">
                        {isPerfect ? 'PERFECT!' : 'COMPLETE!'}
                    </h2>
                    <p className="text-gray-300">
                        {isPerfect
                            ? 'You matched all pairs with perfect memory!'
                            : 'You found all the matching pairs!'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="backdrop-blur-lg bg-gradient-to-br from-cyan-500 to-blue-500 
                          rounded-2xl p-6 text-center">
                        <div className="text-white text-5xl font-black mb-2">
                            {gameState.score}
                        </div>
                        <div className="text-white/80 text-sm">Final Score</div>
                    </div>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-green-500 to-emerald-500 
                          rounded-2xl p-6 text-center">
                        <div className="text-white text-5xl font-black mb-2">
                            {efficiency.toFixed(0)}%
                        </div>
                        <div className="text-white/80 text-sm">Efficiency</div>
                    </div>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-purple-500 to-pink-500 
                          rounded-2xl p-6 text-center">
                        <div className="text-white text-5xl font-black mb-2">
                            {gameState.flips}
                        </div>
                        <div className="text-white/80 text-sm">Total Flips</div>
                    </div>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-orange-500 to-red-500 
                          rounded-2xl p-6 text-center">
                        <div className="text-white text-5xl font-black mb-2">
                            {Math.floor(gameState.timeElapsed / 60)}:{(gameState.timeElapsed % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-white/80 text-sm">Time</div>
                    </div>
                </div>

                {/* Score Breakdown (Optional if backend provides it exactly) */}
                {scoreBreakdown && (
                    <div className="backdrop-blur-lg bg-white/10 rounded-xl p-6 mb-8 text-white">
                        <h3 className="text-xl font-bold mb-4">Score Breakdown</h3>
                        <ul className="space-y-2">
                            <li className="flex justify-between">
                                <span>Base</span>
                                <span>{scoreBreakdown.base_points}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Bonus</span>
                                <span>+{gameState.score - scoreBreakdown.base_points}</span>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onPlayAgain}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500
                       text-white text-xl font-bold rounded-xl
                       transform transition-all duration-200
                       hover:scale-105 active:scale-95"
                    >
                        🎴 Play Again
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 px-6 py-4 backdrop-blur-lg bg-white/10 border border-white/20
                       text-white text-xl font-bold rounded-xl
                       transform transition-all duration-200
                       hover:scale-105 active:scale-95 hover:bg-white/20"
                    >
                        Back to Games
                    </button>
                </div>
            </div>
        </div>
    );
};
