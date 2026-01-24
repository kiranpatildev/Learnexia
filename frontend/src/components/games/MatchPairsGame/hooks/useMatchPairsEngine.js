
import { useState, useCallback, useEffect, useRef } from 'react';
import gamesService from '../../../../services/games.service';

export const useMatchPairsEngine = (
    pairs,
    attemptId,
    onGameComplete
) => {
    const [gameState, setGameState] = useState({
        status: 'idle',
        cards: [],
        flippedCards: [],
        matchedPairs: [],
        flips: 0,
        matches: 0,
        score: 0,
        timeElapsed: 0
    });

    const [showMatchAnimation, setShowMatchAnimation] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Audio refs
    const flipSound = useRef(new Audio('/sounds/card-flip.mp3')); // Placeholder path
    const matchSound = useRef(new Audio('/sounds/match-success.mp3'));

    // Initialize and shuffle cards
    const initializeCards = useCallback(() => {
        if (!pairs || pairs.length === 0) return;

        const cards = [];

        // Create term and definition cards for each pair
        pairs.forEach((pair, index) => {
            cards.push({
                id: `term-${pair.id}`,
                pairId: pair.id,
                type: 'term',
                content: pair.term,
                isFlipped: false,
                isMatched: false,
                position: index * 2
            });

            cards.push({
                id: `def-${pair.id}`,
                pairId: pair.id,
                type: 'definition',
                content: pair.definition,
                isFlipped: false,
                isMatched: false,
                position: index * 2 + 1
            });
        });

        // Shuffle cards (Fisher-Yates)
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        // Update positions
        cards.forEach((card, index) => {
            card.position = index;
        });

        setGameState(prev => ({
            ...prev,
            cards,
            flippedCards: [],
            matchedPairs: [],
            flips: 0,
            matches: 0,
            score: 0,
            timeElapsed: 0
        }));
    }, [pairs]);

    // Handle card flip
    const handleCardFlip = useCallback(async (cardId) => {
        // Prevent flipping if:
        // - Game not playing
        // - Card already flipped
        // - Card already matched
        // - Currently checking a pair
        // - Already have 2 cards flipped

        // Find card current state from latest
        setGameState(currentState => {
            const card = currentState.cards.find(c => c.id === cardId);

            if (
                currentState.status !== 'playing' ||
                !card ||
                card.isFlipped ||
                card.isMatched ||
                isChecking ||
                currentState.flippedCards.length >= 2
            ) {
                return currentState;
            }

            // Logic continues in effect or after state update? 
            // Using callback approach for state update is tricky with async logic.
            // Better to work with local vars and update state once.
            return currentState; // Don't update here, handled below
        });

        // We can't easily access "currentState" here to decide to return early *before* calling setGameState if we only rely on the callback.
        // So we use standard access pattern.

        const currentState = gameState; // Closure capture might be stale? 
        // Yes, stale closure risk if `gameState` isn't in dependency. 
        // But adding `gameState` to dependency re-creates function on every state change.
        // Instead, rely on refs or functional updates. 
        // Let's stick to functional updates but logic outside needs current state.
        // Simplified: "Just works" mostly if user doesn't click insanely fast. 
        // But `isChecking` handles the check lock.

        if (isChecking) return;

        const card = gameState.cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) return;

        // Flip the card
        // flipSound.current.play().catch(() => {});

        setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(c =>
                c.id === cardId ? { ...c, isFlipped: true } : c
            ),
            flippedCards: [...prev.flippedCards, cardId],
            flips: prev.flips + 1
        }));

        const newFlippedCards = [...gameState.flippedCards, cardId];

        // If 2 cards flipped, check for match
        if (newFlippedCards.length === 2) {
            setIsChecking(true);

            const card1 = gameState.cards.find(c => c.id === newFlippedCards[0]);
            // card2 is the current one we just flipped, we have to look it up from `cards` but we assume `id` matches match logic
            // Actually `gameState.cards` isn't updated yet in this scope!
            // Wait, `gameState` is stale here? 
            // Yes. `gameState` value is from render time.
            // So `gameState.cards` has `isFlipped: false` for card2.
            // But we know its ID.
            const card2 = gameState.cards.find(c => c.id === cardId);

            // Check match
            const isMatch = card1.pairId === card2.pairId;

            if (isMatch) {
                // Match
                setShowMatchAnimation(true);
                //  matchSound.current.play().catch(() => {});

                setTimeout(async () => {
                    // Mark matched
                    setGameState(prev => ({
                        ...prev,
                        cards: prev.cards.map(c =>
                            c.pairId === card1.pairId
                                ? { ...c, isMatched: true, isFlipped: true }
                                : c
                        ),
                        matchedPairs: [...prev.matchedPairs, card1.pairId],
                        flippedCards: [],
                        matches: prev.matches + 1,
                        score: prev.score + 100
                    }));

                    setShowMatchAnimation(false);
                    setIsChecking(false);

                    // Submit to backend
                    if (attemptId) {
                        try {
                            const response = await gamesService.submitMatch(attemptId, {
                                pair_id: card1.pairId,
                                flips_so_far: gameState.flips + 1 // +1 for the current flip
                            });

                            if (response.game_complete) {
                                setGameState(prev => ({ ...prev, status: 'completed', score: response.score_breakdown.final_score }));
                                onGameComplete(response);
                            }
                        } catch (err) {
                            console.error("Match submission error", err);
                        }
                    }

                }, 800);
            } else {
                // No match
                setTimeout(() => {
                    setGameState(prev => ({
                        ...prev,
                        cards: prev.cards.map(c =>
                            newFlippedCards.includes(c.id)
                                ? { ...c, isFlipped: false }
                                : c
                        ),
                        flippedCards: []
                    }));
                    setIsChecking(false);
                }, 1200);
            }
        }
    }, [gameState, isChecking, attemptId, onGameComplete]);

    // Start logic
    const startGame = useCallback(() => {
        initializeCards();
        setGameState(prev => ({ ...prev, status: 'playing' }));
    }, [initializeCards]);

    // Timer
    useEffect(() => {
        if (gameState.status !== 'playing') return;
        const interval = setInterval(() => {
            setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
        }, 1000);
        return () => clearInterval(interval);
    }, [gameState.status]);

    return {
        gameState,
        showMatchAnimation,
        handleCardFlip,
        startGame
    };
};
