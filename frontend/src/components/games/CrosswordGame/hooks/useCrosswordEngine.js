/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import gamesService from '../../../../services/games.service';


export const useCrosswordEngine = (gameId) => {
    const [gameState, setGameState] = useState('loading'); // loading, playing, checking, completed, error
    const [gridData, setGridData] = useState(null);
    const [userInputs, setUserInputs] = useState({}); // Map "r,c" -> letter
    const [selectedCell, setSelectedCell] = useState(null); // { r, c }
    const [direction, setDirection] = useState('across'); // 'across' | 'down'
    const [attemptId, setAttemptId] = useState(null);
    const [score, setScore] = useState(0);
    const [results, setResults] = useState(null);
    const [validationResults, setValidationResults] = useState({ correct: [], incorrect: [] });

    // Fetch game data
    useEffect(() => {
        const initGame = async () => {
            try {
                setGameState('loading');
                const response = await gamesService.startGame(gameId);
                console.log("Start Game Response:", response);

                // response: { attempt_id, game_data: { grid: [[...]], grid_size, across_clues, down_clues, width, height } }
                const { attempt_id, game_data } = response;

                if (!game_data) {
                    console.error("game_data is missing in response");
                    throw new Error("Missing game data");
                }

                // Handle nested grid_data (actual structure from backend)
                const actualGridData = game_data.grid_data || game_data;
                console.log("Grid Data to use:", actualGridData);

                setAttemptId(attempt_id);
                setGridData(actualGridData);

                setUserInputs({});

                // Find first playable cell
                if (actualGridData.grid && actualGridData.grid.length > 0) {
                    for (let r = 0; r < actualGridData.grid.length; r++) {
                        for (let c = 0; c < actualGridData.grid[r].length; c++) {
                            const cell = actualGridData.grid[r][c];
                            if (cell && !cell.is_blocked) {
                                setSelectedCell({ r, c });
                                setDirection('across');
                                setGameState('playing');
                                return;
                            }
                        }
                    }
                }
                setGameState('playing');
            } catch (error) {
                console.error("Failed to load crossword:", error);
                setGameState('error');
                console.error("Failed to load game");
            }
        };

        if (gameId) {
            initGame();
        }
    }, [gameId]);

    const isCellPlayable = useCallback((r, c) => {
        if (!gridData || !gridData.grid) return false;
        if (r < 0 || r >= gridData.grid.length) return false;
        if (c < 0 || c >= gridData.grid[0].length) return false;
        const cell = gridData.grid[r][c];
        return cell && !cell.is_blocked;
    }, [gridData]);

    const handleCellClick = (r, c) => {
        if (!isCellPlayable(r, c)) return;

        if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        } else {
            setSelectedCell({ r, c });
        }
    };

    const moveSelection = useCallback((r, c, dir) => {
        let dr = 0, dc = 0;
        if (dir === 'across') dc = 1;
        else dr = 1;

        let nr = r + dr;
        let nc = c + dc;

        if (isCellPlayable(nr, nc)) {
            setSelectedCell({ r: nr, c: nc });
        }
    }, [isCellPlayable]);

    const moveSelectionBack = useCallback((r, c, dir) => {
        let dr = 0, dc = 0;
        if (dir === 'across') dc = -1;
        else dr = -1;

        let nr = r + dr;
        let nc = c + dc;

        if (isCellPlayable(nr, nc)) {
            setSelectedCell({ r: nr, c: nc });
        }
    }, [isCellPlayable]);

    const handleInputChange = useCallback((char) => {
        if (!selectedCell || gameState !== 'playing') return;
        const { r, c } = selectedCell;
        const key = `${r},${c}`;

        setUserInputs(prev => ({
            ...prev,
            [key]: char.toUpperCase()
        }));

        if (validationResults.correct.length > 0 || validationResults.incorrect.length > 0) {
            setValidationResults({ correct: [], incorrect: [] });
        }

        moveSelection(r, c, direction);
    }, [selectedCell, direction, gameState, moveSelection, validationResults]);

    const handleKeyDown = useCallback((e) => {
        if (!selectedCell || gameState !== 'playing') return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                {
                    const nr = selectedCell.r - 1;
                    if (isCellPlayable(nr, selectedCell.c)) setSelectedCell({ r: nr, c: selectedCell.c });
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                {
                    const nr = selectedCell.r + 1;
                    if (isCellPlayable(nr, selectedCell.c)) setSelectedCell({ r: nr, c: selectedCell.c });
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                {
                    const nc = selectedCell.c - 1;
                    if (isCellPlayable(selectedCell.r, nc)) setSelectedCell({ r: selectedCell.r, c: nc });
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                {
                    const nc = selectedCell.c + 1;
                    if (isCellPlayable(selectedCell.r, nc)) setSelectedCell({ r: selectedCell.r, c: nc });
                }
                break;
            case 'Backspace':
                e.preventDefault();
                const key = `${selectedCell.r},${selectedCell.c}`;
                if (userInputs[key]) {
                    setUserInputs(prev => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                    });
                    moveSelectionBack(selectedCell.r, selectedCell.c, direction);
                } else {
                    moveSelectionBack(selectedCell.r, selectedCell.c, direction);
                }
                break;
            case ' ': // Space
                e.preventDefault();
                setDirection(prev => prev === 'across' ? 'down' : 'across');
                break;
            default:
                if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                    handleInputChange(e.key);
                }
                break;
        }
    }, [selectedCell, direction, gameState, isCellPlayable, moveSelection, moveSelectionBack, userInputs, handleInputChange]);

    const checkSolution = async () => {
        if (!attemptId) {
            alert("Error: Attempt ID missing. Please refresh the page.");
            console.error("Attempt ID missing");
            return;
        }
        setGameState('checking');

        try {
            // alert("Validating..."); // Uncomment if needed, but might be annoying
            const answers = {};
            ['across', 'down'].forEach(dir => {
                const clues = dir === 'across' ? gridData.across_clues : gridData.down_clues;
                if (!clues) return;

                clues.forEach(clue => {
                    let word = "";
                    let r = clue.row;
                    let c = clue.col;
                    const len = clue.length;

                    for (let i = 0; i < len; i++) {
                        const key = `${r},${c}`;
                        word += (userInputs[key] || " ");
                        if (dir === 'across') c++; else r++;
                    }
                    answers[`${clue.number}-${dir}`] = word.trim();
                });
            });

            const result = await gamesService.checkCrossword(attemptId, answers);
            console.log("Validation Result:", result);
            if (result.stats) {
                console.log(`Validation Stats: Correct ${result.stats.correct} / Total ${result.stats.total}`);
            }

            if (result.correct || result.incorrect) {
                setValidationResults({
                    correct: result.correct || [],
                    incorrect: result.incorrect || []
                });
            }

            if (result.is_complete) {
                console.log("Game Completed!");
                setGameState('completed');
                setResults(result);
                setScore(result.final_score);
            } else {
                console.log("Game NOT Complete. Pct:", result.completion_percentage);
                setGameState('playing');
            }
        } catch (error) {
            console.error("Check failed:", error);
            setGameState('playing');
        }
    };

    const revealHint = async (type) => {
        if (!selectedCell || !attemptId) return;

        // Find current clue
        const clues = direction === 'across' ? gridData.across_clues : gridData.down_clues;
        const currentClue = clues.find(clue => {
            if (direction === 'across') {
                return clue.row === selectedCell.r &&
                    selectedCell.c >= clue.col &&
                    selectedCell.c < clue.col + clue.length;
            } else {
                return clue.col === selectedCell.c &&
                    selectedCell.r >= clue.row &&
                    selectedCell.r < clue.row + clue.length;
            }
        });

        if (!currentClue) {
            console.log('No clue selected');
            return;
        }

        const clueKey = `${currentClue.number}-${direction}`;
        let cellIndex = 0;
        if (direction === 'across') {
            cellIndex = selectedCell.c - currentClue.col;
        } else {
            cellIndex = selectedCell.r - currentClue.row;
        }

        try {
            const result = await gamesService.revealHint(attemptId, {
                type,
                clue_key: clueKey,
                cell_index: cellIndex
            });

            // Handle result
            if (type === 'letter' && result.letter) {
                const key = `${selectedCell.r},${selectedCell.c}`;
                setUserInputs(prev => ({ ...prev, [key]: result.letter }));
                moveSelection(selectedCell.r, selectedCell.c, direction);
                console.log('Letter revealed');
            } else if (type === 'word' && result.answer) {
                setUserInputs(prev => {
                    const next = { ...prev };
                    let r = currentClue.row;
                    let c = currentClue.col;
                    for (let i = 0; i < result.answer.length; i++) {
                        next[`${r},${c}`] = result.answer[i];
                        if (direction === 'across') c++; else r++;
                    }
                    return next;
                });
                console.log('Word revealed');
            }
        } catch (error) {
            console.error("Hint failed:", error);
            console.error("Failed to get hint");
        }
    };

    return {
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
        setDirection // Export needed for clue list clicks
    };
};
