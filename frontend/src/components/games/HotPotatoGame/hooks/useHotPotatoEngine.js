import { useState, useCallback } from 'react';
import gamesService from '../../../../services/games.service';

export const useHotPotatoEngine = (
    questions,
    config,
    attemptId,
    onGameComplete
) => {
    const [gameState, setGameState] = useState({
        status: 'idle',
        currentQuestionIndex: 0,
        lives: config ? config.lives : 3,
        score: 0,
        combo: 0,
        timeRemaining: (questions && questions[0]) ? questions[0].time_limit : 15,
        answers: []
    });

    const [showExplanation, setShowExplanation] = useState(false);
    const [currentExplanation, setCurrentExplanation] = useState('');
    const [showExplosion, setShowExplosion] = useState(false);

    // Get current question
    const currentQuestion = questions ? questions[gameState.currentQuestionIndex] : null;

    // Start game
    const startGame = useCallback(() => {
        if (!currentQuestion) return;
        setGameState(prev => ({
            ...prev,
            status: 'playing',
            timeRemaining: currentQuestion.time_limit
        }));
    }, [currentQuestion]);

    // Handle timer expiration (bomb explodes!)
    const handleTimeout = useCallback(async () => {
        setShowExplosion(true);

        // Lose a life
        const newLives = gameState.lives - 1;

        setGameState(prev => ({
            ...prev,
            status: 'paused',
            lives: newLives,
            combo: 0
        }));

        try {
            // Submit timeout as wrong answer
            await gamesService.submitAnswer(attemptId, {
                question_id: currentQuestion.id,
                selected_index: -1, // -1 indicates timeout
                time_taken: currentQuestion.time_limit,
                time_remaining: 0
            });
        } catch (err) {
            console.error("Failed to submit timeout:", err);
        }

        // Hide explosion after 1 second
        setTimeout(() => {
            setShowExplosion(false);

            if (newLives <= 0) {
                endGame();
            } else {
                nextQuestion();
            }
        }, 1000);
    }, [gameState.lives, gameState.combo, currentQuestion, attemptId]); // Careful with deps

    // Handle answer selection
    const handleAnswerSelect = useCallback(async (selectedIndex) => {
        if (gameState.status !== 'playing') return;

        // Pause game locally while validating
        setGameState(prev => ({ ...prev, status: 'paused' }));

        try {
            // Calculate times
            const timeTaken = currentQuestion.time_limit - gameState.timeRemaining;

            // Submit answer to backend
            const result = await gamesService.submitAnswer(attemptId, {
                question_id: currentQuestion.id,
                selected_index: selectedIndex,
                time_taken: Math.max(0, timeTaken), // Ensure pos
                time_remaining: Math.max(0, gameState.timeRemaining)
            });

            // Answer record
            const answerRecord = {
                question_id: currentQuestion.id,
                selected_index: selectedIndex,
                time_taken: timeTaken,
                time_remaining: gameState.timeRemaining,
                is_correct: result.is_correct,
                points_earned: result.points_earned
            };

            if (result.is_correct) {
                // Correct answer!
                const newCombo = gameState.combo + 1;

                setGameState(prev => ({
                    ...prev,
                    score: result.current_score || (prev.score + result.points_earned),
                    // Backend should return total score, but if not we add points. 
                    // Result from API usually has: is_correct, points_earned, game_over, current_score
                    combo: newCombo,
                    answers: [...prev.answers, answerRecord]
                }));

                // Short delay then next question
                setTimeout(() => {
                    nextQuestion();
                }, 500);

            } else {
                // Wrong answer
                const newLives = gameState.lives - 1; // Or use result.lives_remaining

                setGameState(prev => ({
                    ...prev,
                    lives: result.lives_remaining !== undefined ? result.lives_remaining : newLives,
                    combo: 0,
                    answers: [...prev.answers, answerRecord]
                }));

                // Show explanation
                setCurrentExplanation(result.explanation || "Detailed explanation not available.");
                setShowExplanation(true);

                // Check game over
                if (result.game_over || newLives <= 0) {
                    // We wait for user to close explanation then end
                }
            }

        } catch (error) {
            console.error('Failed to submit answer:', error);
            // Handle error gracefully? Resume?
        }
    }, [gameState, currentQuestion, attemptId]);

    // Move to next question
    const nextQuestion = useCallback(() => {
        const nextIndex = gameState.currentQuestionIndex + 1;

        if (nextIndex >= questions.length) {
            // Game complete!
            endGame();
        } else {
            const nextQ = questions[nextIndex];

            setGameState(prev => ({
                ...prev,
                currentQuestionIndex: nextIndex,
                timeRemaining: nextQ.time_limit || 10,
                status: 'playing'
            }));
        }
    }, [gameState.currentQuestionIndex, questions]);

    // End game
    const endGame = useCallback(async () => {
        setGameState(prev => ({ ...prev, status: 'completed' }));
        if (onGameComplete) onGameComplete(gameState);
    }, [gameState, onGameComplete]);

    // Close explanation and continue
    const closeExplanation = useCallback(() => {
        setShowExplanation(false);
        if (gameState.lives > 0 && gameState.currentQuestionIndex < questions.length - 1) {
            nextQuestion();
        } else {
            // If lives 0 or last question, end game
            endGame();
        }
    }, [gameState.lives, gameState.currentQuestionIndex, questions.length, nextQuestion, endGame]);

    return {
        gameState,
        currentQuestion,
        showExplanation,
        currentExplanation,
        showExplosion,
        startGame,
        handleAnswerSelect,
        handleTimeout,
        closeExplanation
    };
};
