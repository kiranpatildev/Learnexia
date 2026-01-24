import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCrosswordEngine } from './hooks/useCrosswordEngine';
import CrosswordGrid from './CrosswordGrid';
import ClueList from './ClueList';
import GameControls from './GameControls';
import ResultsScreen from './ResultsScreen';


const CrosswordGame = () => {
    const { id: gameId } = useParams();
    const {
        gameState,
        gridData,
        userInputs,
        selectedCell,
        direction,
        score,
        results,
        validationResults,
        handleCellClick,
        handleKeyDown,
        checkSolution,
        revealHint,
        setDirection
    } = useCrosswordEngine(gameId);

    // Attach global keyboard listener
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Prevent scrolling with arrows/space if game is active
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                // Check if target is not an input outside the game
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    // e.preventDefault(); // Moved to hook
                }
            }
            handleKeyDown(e);
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleKeyDown]);

    const handleClueClick = (clue, dir) => {
        handleCellClick(clue.row, clue.col);
        setDirection(dir);
    };

    if (gameState === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (gameState === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-red-500">
                Failed to load game. Please try again.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-8 px-4 relative">


            {/* Header */}
            <div className="w-full max-w-6xl mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="bg-indigo-600 text-white p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </span>
                        Crossword Puzzle
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Use the clues to fill in the grid. Press Space to switch direction.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Time</span>
                    <div className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {/* Timer could go here */}
                        --:--
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Hints (Across) */}
                <div className="lg:col-span-3 h-[600px] hidden lg:block">
                    {gridData && (
                        <ClueList
                            clues={gridData.across_clues}
                            direction={direction}
                            title="Across"
                            activeClueNumber={null} // We'd need to calculate which is active
                            onClueClick={handleClueClick}
                        />
                    )}
                </div>

                {/* Center Grid */}
                <div className="lg:col-span-6 flex flex-col items-center">
                    <CrosswordGrid
                        gridData={gridData}
                        userInputs={userInputs}
                        selectedCell={selectedCell}
                        direction={direction}
                        validationResults={validationResults}
                        onCellClick={handleCellClick}
                    />

                    <GameControls
                        gameState={gameState}
                        startValidation={validationResults}
                        onCheck={checkSolution}
                        onRevealLetter={() => revealHint('letter')}
                        onRevealWord={() => revealHint('word')}
                    />

                    {/* Clue Display for Mobile/Small Screens */}
                    <div className="lg:hidden w-full mt-6 space-y-4">
                        {gridData && (
                            <>
                                <ClueList clues={gridData.across_clues} direction={direction} title="Across" onClueClick={handleClueClick} activeClueNumber={null} />
                                <ClueList clues={gridData.down_clues} direction={direction} title="Down" onClueClick={handleClueClick} activeClueNumber={null} />
                            </>
                        )}
                    </div>
                </div>

                {/* Right Hints (Down) */}
                <div className="lg:col-span-3 h-[600px] hidden lg:block">
                    {gridData && (
                        <ClueList
                            clues={gridData.down_clues}
                            direction={direction}
                            title="Down"
                            activeClueNumber={null}
                            onClueClick={handleClueClick}
                        />
                    )}
                </div>
            </div>

            {/* Results Overlay */}
            {gameState === 'completed' && (
                <ResultsScreen
                    score={score}
                    results={results}
                />
            )}
        </div>
    );
};

export default CrosswordGame;
