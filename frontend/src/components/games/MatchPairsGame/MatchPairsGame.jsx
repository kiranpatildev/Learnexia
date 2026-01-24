
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMatchPairsEngine } from './hooks/useMatchPairsEngine';
import { CardGrid } from './CardGrid';
import { GameStats } from './GameStats';
import { MatchAnimation } from './MatchAnimation';
import { ResultsScreen } from './ResultsScreen';
import gamesService from '../../../services/games.service';

export const MatchPairsGame = () => {
    const { id: gameId } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [pairs, setPairs] = React.useState([]);
    const [config, setConfig] = React.useState(null);
    const [attemptId, setAttemptId] = React.useState(null);

    // Initialize game
    useEffect(() => {
        const initGame = async () => {
            try {
                if (gameId) {
                    const data = await gamesService.startGame(gameId);
                    console.log('[MatchPairs] Start Game Response:', data);

                    // Support both structures
                    const gamePairs = data.pairs || data.questions || [];
                    console.log('[MatchPairs] Extracted pairs:', gamePairs);

                    setPairs(gamePairs);


                    setConfig(data.game?.config);
                    setAttemptId(data.attempt_id);

                    if (gamePairs.length === 0) {
                        setError('No pairs found for this game');
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load game');
            } finally {
                setIsLoading(false);
            }
        };

        initGame();
    }, [gameId]);

    // Hook handles logic
    const {
        gameState,
        showMatchAnimation,
        handleCardFlip,
        startGame
    } = useMatchPairsEngine(
        pairs,
        attemptId,
        (finalState) => {
            console.log('Game completed:', finalState);
        }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
                      flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">Loading Match the Pairs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
                      flex items-center justify-center">
                <div className="text-white text-2xl">{error}</div>
            </div>
        );
    }

    // Idle state - show start screen
    if (gameState.status === 'idle') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
                      flex flex-col items-center justify-center gap-8 p-4">
                <div className="text-9xl animate-bounce">🎴</div>
                <h1 className="text-6xl font-black text-white text-center">
                    MATCH THE PAIRS
                </h1>
                <p className="text-xl text-gray-300 text-center max-w-md">
                    Flip cards to find matching terms and definitions.
                    <br />Use your memory to match all pairs!
                </p>

                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                    <div className="grid grid-cols-2 gap-6 text-white">
                        <div className="text-center">
                            <div className="text-4xl font-bold">{pairs.length}</div>
                            <div className="text-sm text-gray-300">Pairs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">{pairs.length * 2}</div>
                            <div className="text-sm text-gray-300">Cards</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={startGame}
                    className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500
                     text-white text-2xl font-bold rounded-2xl
                     transform transition-all duration-200
                     hover:scale-110 hover:shadow-2xl
                     active:scale-95"
                >
                    🎯 START GAME
                </button>
            </div>
        );
    }

    // Completed state
    if (gameState.status === 'completed') {
        return <ResultsScreen gameState={gameState} pairs={pairs} onPlayAgain={() => navigate('/student/games')} />;
    }

    // Playing state
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
            {/* Match Animation */}
            <MatchAnimation show={showMatchAnimation} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-black text-white mb-2">MATCH THE PAIRS</h2>
                    <p className="text-gray-300">Find all matching term-definition pairs</p>
                </div>

                {/* Stats */}
                <GameStats
                    matches={gameState.matches}
                    totalPairs={pairs.length}
                    flips={gameState.flips}
                    perfectFlips={pairs.length * 2}
                    timeElapsed={gameState.timeElapsed}
                    score={gameState.score}
                />

                {/* Card Grid */}
                <CardGrid
                    cards={gameState.cards}
                    onCardFlip={handleCardFlip}
                />

                {/* Hint */}
                <div className="mt-6 text-center text-white/60 text-sm">
                    💡 Tip: Try to remember where you saw each card!
                </div>
            </div>
        </div>
    );
};
