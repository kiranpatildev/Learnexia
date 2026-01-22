import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ResultsScreen = ({ gameState, onPlayAgain }) => {
    const navigate = useNavigate();

    const accuracy = gameState.answers.length > 0
        ? (gameState.answers.filter(a => a.is_correct).length / gameState.answers.length) * 100
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 
                    flex items-center justify-center p-4">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-8xl mb-4 animate-bounce">
                        {gameState.lives > 0 ? '🎉' : '💥'}
                    </div>
                    <h2 className="text-5xl font-black text-white mb-2 tracking-tight">
                        {gameState.lives > 0 ? 'SURVIVED!' : 'GAME OVER'}
                    </h2>
                    <p className="text-gray-300 text-lg">
                        {gameState.lives > 0
                            ? 'You answered all questions before the bomb exploded!'
                            : 'The pressure was too much this time!'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="backdrop-blur-lg bg-gradient-to-br from-cyan-500 to-blue-500 
                          rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                        <div className="text-white text-5xl font-black mb-2">
                            {gameState.score.toLocaleString()}
                        </div>
                        <div className="text-white/80 text-sm font-bold uppercase tracking-wider">Final Score</div>
                    </div>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-green-500 to-emerald-500 
                          rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                        <div className="text-white text-5xl font-black mb-2">
                            {accuracy.toFixed(0)}%
                        </div>
                        <div className="text-white/80 text-sm font-bold uppercase tracking-wider">Accuracy</div>
                    </div>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-purple-500 to-pink-500 
                          rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                        <div className="text-white text-5xl font-black mb-2">
                            {gameState.answers.filter(a => a.is_correct).length}
                        </div>
                        <div className="text-white/80 text-sm font-bold uppercase tracking-wider">Correct</div>
                    </div>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-orange-500 to-red-500 
                          rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                        <div className="text-white text-5xl font-black mb-2">
                            x{gameState.combo}
                        </div>
                        <div className="text-white/80 text-sm font-bold uppercase tracking-wider">Best Combo</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onPlayAgain}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500
                       text-white text-xl font-bold rounded-xl
                       transform transition-all duration-200
                       hover:scale-105 active:scale-95 shadow-lg
                       flex items-center justify-center gap-2"
                    >
                        <span>🔥</span> Play Again
                    </button>
                    <button
                        onClick={() => navigate('/student/games')} // Back to student games library
                        className="flex-1 px-6 py-4 backdrop-blur-lg bg-white/10 border border-white/20
                       text-white text-xl font-bold rounded-xl
                       transform transition-all duration-200
                       hover:scale-105 active:scale-95 hover:bg-white/20"
                    >
                        Exit Game
                    </button>
                </div>
            </div>
        </div>
    );
};
