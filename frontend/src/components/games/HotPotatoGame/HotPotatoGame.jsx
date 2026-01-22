import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotPotatoEngine } from './hooks/useHotPotatoEngine';
import { BombTimer } from './BombTimer';
import { AnswerButtons } from './AnswerButtons';
import { ExplosionEffect } from './ExplosionEffect';
import { QuestionCard } from './QuestionCard';
import { ResultsScreen } from './ResultsScreen';
import gamesService from '../../../services/games.service';

export const HotPotatoGame = () => {
    const { id } = useParams();
    const gameId = id;
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [config, setConfig] = useState(null);
    const [attemptId, setAttemptId] = useState(null);

    // Initialize game
    useEffect(() => {
        const initGame = async () => {
            try {
                const gameData = await gamesService.startGame(gameId);

                if (gameData.error) {
                    throw new Error(gameData.detail || "Failed to start");
                }

                setQuestions(gameData.questions);
                setConfig(gameData.game.config);
                setAttemptId(gameData.attempt_id);
                setIsLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to load game');
                setIsLoading(false);
            }
        };

        if (gameId) initGame();
    }, [gameId]);

    // Game engine
    const {
        gameState,
        currentQuestion,
        showExplanation,
        currentExplanation,
        showExplosion,
        startGame,
        handleAnswerSelect,
        handleTimeout,
        closeExplanation
    } = useHotPotatoEngine(
        questions,
        config,
        attemptId,
        (finalState) => {
            console.log('Game completed:', finalState);
        }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 
                      flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">Loading Hot Potato...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 
                      flex flex-col items-center justify-center p-4">
                <div className="text-white text-2xl mb-4 text-center">❌ {error}</div>
                <button onClick={() => navigate('/student/games')} className="text-blue-300 hover:text-blue-100 underline">
                    Back to Games
                </button>
            </div>
        );
    }

    // Completed state - show results
    if (gameState.status === 'completed') {
        return <ResultsScreen gameState={gameState} onPlayAgain={() => window.location.reload()} />;
    }

    // Idle state - show start screen
    if (gameState.status === 'idle') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 
                      flex flex-col items-center justify-center gap-8 p-4">
                <div className="text-9xl animate-bounce">💣</div>
                <h1 className="text-6xl font-black text-white text-center tracking-tighter drop-shadow-lg">
                    HOT POTATO
                </h1>
                <p className="text-xl text-gray-300 text-center max-w-md leading-relaxed">
                    Answer questions before the timer explodes!
                    <br /><span className="text-orange-400 font-bold">Velocity is Key.</span>
                </p>

                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md">
                    <div className="grid grid-cols-2 gap-6 text-white divide-x divide-white/20">
                        <div className="text-center">
                            <div className="text-4xl font-bold">{questions.length}</div>
                            <div className="text-sm text-gray-300 uppercase tracking-wider mt-1">Questions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">{config?.lives || 3}</div>
                            <div className="text-sm text-gray-300 uppercase tracking-wider mt-1">Lives</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={startGame}
                    className="px-12 py-5 bg-gradient-to-r from-red-600 to-orange-600
                     text-white text-2xl font-bold rounded-2xl
                     transform transition-all duration-200
                     hover:scale-105 hover:shadow-2xl hover:brightness-110
                     active:scale-95 ring-4 ring-offset-4 ring-offset-slate-900 ring-red-600/30"
                >
                    🔥 START GAME
                </button>
            </div>
        );
    }

    // Playing state - main game UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 overflow-hidden relative">
            {/* Explosion Effect */}
            <ExplosionEffect show={showExplosion} />

            {/* Game HUD */}
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-8">
                    {/* Lives */}
                    <div className="flex gap-2">
                        {[...Array(config?.lives || 3)].map((_, i) => (
                            <div
                                key={i}
                                className={`text-4xl transition-all duration-300 filter drop-shadow-md ${i < gameState.lives ? 'animate-pulse scale-100' : 'opacity-20 grayscale scale-90'
                                    }`}
                            >
                                ❤️
                            </div>
                        ))}
                    </div>

                    {/* Score */}
                    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl px-8 py-4 shadow-xl">
                        <div className="text-white text-center">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">SCORE</div>
                            <div className="text-4xl font-black tabular-nums tracking-tight">
                                {gameState.score.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Combo */}
                    <div className={`transition-opacity duration-300 ${gameState.combo > 1 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="backdrop-blur-lg bg-gradient-to-r from-yellow-500 to-orange-500 
                            border border-white/20 rounded-2xl px-6 py-3 shadow-lg transform rotate-2">
                            <div className="text-white text-center">
                                <div className="text-2xl font-black animate-bounce">
                                    🔥 x{gameState.combo}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Progress */}
                <div className="mb-8 max-w-3xl mx-auto">
                    <div className="flex justify-between text-white text-sm mb-2 font-medium opacity-80">
                        <span>Question {gameState.currentQuestionIndex + 1} / {questions.length}</span>
                        <span className={`uppercase text-xs px-3 py-1 rounded-full font-bold ${currentQuestion.difficulty === 'hard' ? 'bg-red-500' :
                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-500 text-black' :
                                'bg-green-500'
                            }`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
                            style={{ width: `${((gameState.currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex flex-col lg:flex-row gap-12 items-center justify-center mt-4">
                    {/* Left: Bomb Timer */}
                    <div className="flex-shrink-0 transform scale-110">
                        <BombTimer
                            timeLimit={currentQuestion.time_limit}
                            onExpire={handleTimeout}
                            isPaused={gameState.status !== 'playing'}
                        />
                    </div>

                    {/* Right: Question & Answers */}
                    <div className="flex-1 flex flex-col items-center gap-8 w-full">
                        <QuestionCard question={currentQuestion.question} />
                        <AnswerButtons
                            options={currentQuestion.options}
                            onSelect={handleAnswerSelect}
                            disabled={gameState.status !== 'playing'}
                        />
                    </div>
                </div>
            </div>

            {/* Explanation Modal */}
            {showExplanation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border-2 border-red-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4 animate-bounce">❌</div>
                            <h3 className="text-3xl font-black text-white mb-2">WRONG!</h3>
                            <div className="inline-block bg-red-500/20 text-red-400 font-bold px-4 py-1 rounded-full border border-red-500/50">
                                -1 Life
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 mb-8 text-white text-lg leading-relaxed border border-white/10">
                            {currentExplanation}
                        </div>

                        <button
                            onClick={closeExplanation}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600
                         text-white font-bold text-xl rounded-xl
                         transform transition-all duration-200
                         hover:scale-105 active:scale-95 shadow-lg border-t border-white/20"
                        >
                            CONTINUE ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
