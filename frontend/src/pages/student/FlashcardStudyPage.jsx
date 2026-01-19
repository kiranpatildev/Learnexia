import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    RotateCw,
    Check,
    X,
    Loader2,
    ArrowLeft,
    Trophy
} from 'lucide-react';
import api from '../../services/api';

export function FlashcardStudyPage() {
    const { setId } = useParams();
    const navigate = useNavigate();

    const [flashcardSet, setFlashcardSet] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [masteredCards, setMasteredCards] = useState(new Set());
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        incorrect: 0,
        total: 0
    });

    useEffect(() => {
        fetchFlashcardSet();
    }, [setId]);

    const fetchFlashcardSet = async () => {
        try {
            setLoading(true);
            console.log('[FlashcardStudy] Fetching flashcard set:', setId);

            const response = await api.get(`/flashcards/flashcard-sets/${setId}/`);
            console.log('[FlashcardStudy] Flashcard set:', response.data);
            setFlashcardSet(response.data);

            // Fetch flashcards for this set using the flashcards endpoint with filter
            console.log('[FlashcardStudy] Fetching flashcards for set:', setId);
            const cardsResponse = await api.get(`/flashcards/flashcards/`, {
                params: {
                    flashcard_set: setId,
                    ordering: 'order'
                }
            });

            console.log('[FlashcardStudy] Flashcards response:', cardsResponse.data);
            const cards = cardsResponse.data.results || cardsResponse.data || [];
            console.log('[FlashcardStudy] Number of flashcards:', cards.length);
            setFlashcards(cards);

            // Initialize mastered cards from backend if available
            const masteredIds = new Set(
                cards.filter(card => card.is_mastered).map(card => card.id)
            );
            setMasteredCards(masteredIds);
        } catch (error) {
            console.error('[FlashcardStudy] Error fetching flashcard set:', error);
            console.error('[FlashcardStudy] Error response:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleKnow = async () => {
        const currentCard = flashcards[currentIndex];

        // Mark as mastered
        setMasteredCards(prev => new Set([...prev, currentCard.id]));
        setSessionStats(prev => ({
            ...prev,
            correct: prev.correct + 1,
            total: prev.total + 1
        }));

        // Update backend
        try {
            await api.post(`/flashcards/flashcards/${currentCard.id}/mark-mastered/`);
        } catch (error) {
            console.error('Error marking card as mastered:', error);
        }

        // Move to next card
        handleNext();
    };

    const handleDontKnow = () => {
        const currentCard = flashcards[currentIndex];

        // Remove from mastered if it was there
        setMasteredCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentCard.id);
            return newSet;
        });

        setSessionStats(prev => ({
            ...prev,
            incorrect: prev.incorrect + 1,
            total: prev.total + 1
        }));

        // Move to next card
        handleNext();
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (!flashcardSet || flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">No flashcards found</p>
                    <Button onClick={() => navigate('/student/flashcards')}>
                        Back to Decks
                    </Button>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;
    const masteredCount = masteredCards.size;

    // Check if session is complete
    const isSessionComplete = currentIndex === flashcards.length - 1 && sessionStats.total > 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/student/flashcards')}
                    className="text-slate-400 hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Decks
                </Button>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">{flashcardSet.title || 'Flashcard Study'}</h1>
                        <p className="text-slate-400">{flashcardSet.subject || 'Study Session'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Progress</p>
                        <p className="text-xl font-bold text-cyan-400">
                            {currentIndex + 1} / {flashcards.length}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <span className="text-slate-400">Mastered: </span>
                        <span className="font-semibold text-white">{masteredCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                        <span className="text-slate-400">Session: </span>
                        <span className="font-semibold text-white">
                            {sessionStats.correct}/{sessionStats.total}
                        </span>
                    </div>
                </div>
            </div>

            {/* Flashcard */}
            <div className="max-w-4xl mx-auto">
                {isSessionComplete ? (
                    /* Session Complete */
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-12 text-center">
                            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
                            <p className="text-slate-400 mb-8">Great job studying!</p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-800 rounded-lg p-4">
                                    <p className="text-3xl font-bold text-emerald-400">{sessionStats.correct}</p>
                                    <p className="text-sm text-slate-400">Correct</p>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-4">
                                    <p className="text-3xl font-bold text-red-400">{sessionStats.incorrect}</p>
                                    <p className="text-sm text-slate-400">Incorrect</p>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-4">
                                    <p className="text-3xl font-bold text-cyan-400">{masteredCount}</p>
                                    <p className="text-sm text-slate-400">Mastered</p>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <Button onClick={handleRestart} className="bg-cyan-600 hover:bg-cyan-700">
                                    <RotateCw className="w-4 h-4 mr-2" />
                                    Study Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/student/flashcards')}
                                    className="border-slate-700 text-white hover:bg-slate-800"
                                >
                                    Back to Decks
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Flashcard with proper 3D flip */
                    <div className="relative" style={{ perspective: '1000px' }}>
                        <div
                            className="relative transition-transform duration-700 cursor-pointer"
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                minHeight: '400px'
                            }}
                            onClick={handleFlip}
                        >
                            {/* Front Side - Question */}
                            <Card
                                className={`absolute inset-0 bg-slate-900 border-slate-800 ${isFlipped ? 'invisible' : 'visible'}`}
                                style={{
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden'
                                }}
                            >
                                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="text-center">
                                        <p className="text-sm text-cyan-400 mb-4">Question</p>
                                        <h2 className="text-3xl font-bold mb-6">
                                            {currentCard.question || currentCard.front}
                                        </h2>
                                        <p className="text-slate-500 text-sm">Click to reveal answer</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Back Side - Answer */}
                            <Card
                                className={`absolute inset-0 bg-slate-900 border-slate-800 ${!isFlipped ? 'invisible' : 'visible'}`}
                                style={{
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                }}
                            >
                                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="text-center">
                                        <p className="text-sm text-emerald-400 mb-4">Answer</p>
                                        <h2 className="text-2xl font-semibold mb-6">
                                            {currentCard.answer || currentCard.back}
                                        </h2>
                                        {currentCard.explanation && (
                                            <p className="text-slate-400 text-sm mt-4">
                                                {currentCard.explanation}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Controls */}
                {!isSessionComplete && (
                    <div className="mt-6 flex items-center justify-between">
                        {/* Previous Button */}
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="border-slate-700 text-white hover:bg-slate-800"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        {/* Know / Don't Know Buttons (only when flipped) */}
                        {isFlipped && (
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleDontKnow}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Don't Know
                                </Button>
                                <Button
                                    onClick={handleKnow}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    I Know This
                                </Button>
                            </div>
                        )}

                        {/* Flip Button (when not flipped) */}
                        {!isFlipped && (
                            <Button
                                onClick={handleFlip}
                                className="bg-cyan-600 hover:bg-cyan-700"
                            >
                                <RotateCw className="w-4 h-4 mr-2" />
                                Flip Card
                            </Button>
                        )}

                        {/* Next Button */}
                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={currentIndex === flashcards.length - 1}
                            className="border-slate-700 text-white hover:bg-slate-800"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
