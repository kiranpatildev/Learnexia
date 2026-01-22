import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Gamepad2,
    Plus,
    Eye,
    EyeOff,
    Trash2,
    Loader2,
    TrendingUp,
    Users,
    Target,
    Clock,
    Sparkles,
    BarChart3
} from 'lucide-react';
import gamesService from '../../services/games.service';

export function TeacherGamesPage() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publishingId, setPublishingId] = useState(null);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[Teacher Games] Fetching games...');

            const response = await gamesService.getGames({
                ordering: '-created_at'
            });

            console.log('[Teacher Games] Response:', response);

            const gamesData = response.results || response || [];
            setGames(gamesData);
        } catch (err) {
            console.error('[Teacher Games] Error:', err);
            setError('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToggle = async (gameId, currentStatus) => {
        try {
            setPublishingId(gameId);

            await gamesService.publishGame(gameId, !currentStatus);

            // Update local state
            setGames(games.map(game =>
                game.id === gameId
                    ? { ...game, is_published: !currentStatus }
                    : game
            ));

            console.log('[Teacher Games] Published status updated');
        } catch (err) {
            console.error('[Teacher Games] Error publishing:', err);
            alert('Failed to update publish status');
        } finally {
            setPublishingId(null);
        }
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'EASY': 'bg-green-100 text-green-700 border-green-200',
            'MEDIUM': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'HARD': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getGameIcon = (gameType) => {
        const icons = {
            'fall_drop': '🎯',
            'word_scramble': '🔤',
            'match_pairs': '🃏',
        };
        return icons[gameType] || '🎮';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Gamepad2 className="w-7 h-7 text-blue-600" />
                                Game Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Create and manage educational games for your students
                            </p>
                        </div>

                        <Button
                            onClick={() => navigate('/teacher/games/generate')}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Generate New Game
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Error State */}
                {error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-red-700">{error}</p>
                            <Button
                                onClick={fetchGames}
                                className="mt-2"
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Games List */}
                {games.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Games Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Generate your first game from a lecture transcript
                            </p>
                            <Button
                                onClick={() => navigate('/teacher/games/generate')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Generate Game
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {games.map((game) => (
                            <Card
                                key={game.id}
                                className="border-0 shadow-sm hover:shadow-md transition-all"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        {/* Left: Game Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-3xl">
                                                    {getGameIcon(game.template?.code)}
                                                </span>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">
                                                        {game.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {game.lecture_title} • {game.template?.name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-4 gap-4 mt-4">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Users className="w-4 h-4 text-blue-600" />
                                                        <span className="text-xs font-semibold text-blue-900">
                                                            Total Plays
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-blue-900">
                                                        {game.analytics?.total_plays || 0}
                                                    </div>
                                                </div>

                                                <div className="bg-green-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                        <span className="text-xs font-semibold text-green-900">
                                                            Avg Score
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-green-900">
                                                        {Math.round(game.analytics?.average_score || 0)}
                                                    </div>
                                                </div>

                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Target className="w-4 h-4 text-purple-600" />
                                                        <span className="text-xs font-semibold text-purple-900">
                                                            Completion
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-purple-900">
                                                        {Math.round(game.analytics?.completion_rate || 0)}%
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock className="w-4 h-4 text-amber-600" />
                                                        <span className="text-xs font-semibold text-amber-900">
                                                            Questions
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-amber-900">
                                                        {game.question_count}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-col gap-2 ml-6">
                                            <Badge className={getDifficultyColor(game.difficulty)}>
                                                {game.difficulty}
                                            </Badge>

                                            <Badge className={
                                                game.is_published
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }>
                                                {game.is_published ? '✓ Published' : '○ Draft'}
                                            </Badge>

                                            <div className="flex flex-col gap-2 mt-4">
                                                <Button
                                                    onClick={() => handlePublishToggle(game.id, game.is_published)}
                                                    disabled={publishingId === game.id}
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    {publishingId === game.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : game.is_published ? (
                                                        <>
                                                            <EyeOff className="w-4 h-4 mr-2" />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Publish
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    onClick={() => navigate(`/teacher/games/${game.id}/analytics`)}
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    <BarChart3 className="w-4 h-4 mr-2" />
                                                    Analytics
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
