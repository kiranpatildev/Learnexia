import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Layers,
    Play,
    Clock,
    Loader2,
    BookOpen,
    TrendingUp
} from 'lucide-react';
import api from '../../services/api';

export function StudentFlashcardsPage() {
    const navigate = useNavigate();
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFlashcardSets();
    }, []);

    const fetchFlashcardSets = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[Flashcards] Fetching flashcard sets...');

            // Fetch flashcard sets from enrolled classrooms
            const response = await api.get('/flashcards/flashcard-sets/', {
                params: {
                    ordering: '-created_at'
                }
            });

            console.log('[Flashcards] Response:', response.data);

            const sets = response.data.results || response.data || [];
            console.log('[Flashcards] Parsed sets:', sets);
            console.log('[Flashcards] Number of sets:', sets.length);

            setFlashcardSets(sets);
        } catch (err) {
            console.error('[Flashcards] Error fetching flashcard sets:', err);
            console.error('[Flashcards] Error response:', err.response?.data);
            setError('Failed to load flashcard sets');
        } finally {
            setLoading(false);
        }
    };

    const getIconColor = (index) => {
        const colors = [
            { bg: 'bg-emerald-500', text: 'text-emerald-500' },
            { bg: 'bg-blue-500', text: 'text-blue-500' },
            { bg: 'bg-orange-500', text: 'text-orange-500' },
            { bg: 'bg-amber-500', text: 'text-amber-500' },
            { bg: 'bg-purple-500', text: 'text-purple-500' },
            { bg: 'bg-pink-500', text: 'text-pink-500' },
        ];
        return colors[index % colors.length];
    };

    const getSubjectIcon = (subject) => {
        // Return first letter or icon based on subject
        if (!subject) return '📚';
        return subject.charAt(0).toUpperCase();
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const calculateProgress = (set) => {
        // Calculate mastered cards vs total cards
        const total = set.card_count || set.flashcards?.length || 0;
        const mastered = set.mastered_count || 0;
        return { mastered, total };
    };

    const getProgressPercentage = (mastered, total) => {
        if (total === 0) return 0;
        return (mastered / total) * 100;
    };

    const handleStudy = (setId) => {
        navigate(`/student/flashcards/${setId}/study`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
                    <p className="text-slate-400">Loading flashcard decks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={fetchFlashcardSets} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                    <Layers className="w-5 h-5" />
                    <span className="text-sm font-medium">Flashcards</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Your Flashcard Decks</h1>
                <p className="text-slate-400 text-lg">
                    Master any subject with spaced repetition learning
                </p>
            </div>

            {/* Decks Grid */}
            {flashcardSets.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                        No flashcard decks yet
                    </h3>
                    <p className="text-slate-500">
                        Your teacher will create flashcard decks for you to study
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-white">Your Decks</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {flashcardSets.map((set, index) => {
                            const colors = getIconColor(index);
                            const progress = calculateProgress(set);
                            const progressPercent = getProgressPercentage(progress.mastered, progress.total);

                            return (
                                <Card
                                    key={set.id}
                                    className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-5">
                                        {/* Header with Icon and Card Count */}
                                        <div className="flex items-start justify-between mb-4">
                                            {/* Icon */}
                                            <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                                                {getSubjectIcon(set.subject || set.lecture?.subject)}
                                            </div>

                                            {/* Card Count Badge */}
                                            <Badge
                                                variant="outline"
                                                className="border-cyan-500 text-cyan-400 text-xs"
                                            >
                                                {progress.total} cards
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 min-h-[3.5rem]">
                                            {set.title || set.lecture?.title || 'Untitled Deck'}
                                        </h3>

                                        {/* Subject */}
                                        <p className="text-sm text-slate-400 mb-4">
                                            {set.subject || set.lecture?.subject || 'General'}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                                <span>Mastered</span>
                                                <span className="font-medium">
                                                    {progress.mastered}/{progress.total}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                            {/* Last Studied */}
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTimeAgo(set.last_studied_at)}</span>
                                            </div>

                                            {/* Study Button */}
                                            <Button
                                                size="sm"
                                                onClick={() => handleStudy(set.id)}
                                                className="bg-transparent hover:bg-slate-800 text-white border-0 group-hover:text-cyan-400 transition-colors"
                                            >
                                                <Play className="w-3 h-3 mr-1" />
                                                Study
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Stats Section (Optional) */}
            {flashcardSets.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {flashcardSets.length}
                                    </p>
                                    <p className="text-sm text-slate-400">Total Decks</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {flashcardSets.reduce((acc, set) => acc + (calculateProgress(set).mastered), 0)}
                                    </p>
                                    <p className="text-sm text-slate-400">Cards Mastered</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {flashcardSets.reduce((acc, set) => acc + (calculateProgress(set).total), 0)}
                                    </p>
                                    <p className="text-sm text-slate-400">Total Cards</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
