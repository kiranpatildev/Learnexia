import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Gamepad2,
    Play,
    Trophy,
    Clock,
    Loader2,
    Filter,
    TrendingUp,
    Target,
    Zap,
    Award,
    Users,
    ChevronRight
} from 'lucide-react';
import gamesService from '../../services/games.service';

export function StudentGamesPage() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
    const [selectedGameType, setSelectedGameType] = useState('ALL');
    const [filterPlayed, setFilterPlayed] = useState('ALL');

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[Games] Fetching games...');

            const response = await gamesService.getGames({
                ordering: '-created_at'
            });

            console.log('[Games] Response:', response);

            const gamesData = response.results || response || [];
            console.log('[Games] Number of games:', gamesData.length);

            setGames(gamesData);
        } catch (err) {
            console.error('[Games] Error fetching games:', err);
            console.error('[Games] Error response:', err.response?.data);
            setError('Failed to load games');
        } finally {
            setLoading(false);
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

    const getGameGradient = (index) => {
        const gradients = [
            'from-cyan-500 to-blue-500',
            'from-purple-500 to-pink-500',
            'from-orange-500 to-red-500',
            'from-green-500 to-emerald-500',
            'from-indigo-500 to-purple-500',
            'from-amber-500 to-orange-500',
        ];
        return gradients[index % gradients.length];
    };

    const filteredGames = games.filter(game => {
        if (selectedDifficulty !== 'ALL' && game.difficulty !== selectedDifficulty) {
            return false;
        }
        if (selectedGameType !== 'ALL' && game.template?.code !== selectedGameType) {
            return false;
        }
        if (filterPlayed === 'PLAYED' && !game.student_stats?.played) {
            return false;
        }
        if (filterPlayed === 'NOT_PLAYED' && game.student_stats?.played) {
            return false;
        }
        return true;
    });

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
                                Educational Games
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Learn through play! Test your knowledge and compete with classmates
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <Card className="mb-6 border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">Filters</span>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {/* Difficulty Filter */}
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Difficulty</label>
                                <div className="flex gap-2">
                                    {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(diff => (
                                        <button
                                            key={diff}
                                            onClick={() => setSelectedDifficulty(diff)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDifficulty === diff
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Played Filter */}
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                                <div className="flex gap-2">
                                    {['ALL', 'PLAYED', 'NOT_PLAYED'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterPlayed(status)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterPlayed === status
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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

                {/* Games Grid */}
                {filteredGames.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                            <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Games Available
                            </h3>
                            <p className="text-gray-600">
                                {selectedDifficulty !== 'ALL' || filterPlayed !== 'ALL'
                                    ? 'Try adjusting your filters'
                                    : 'Your teacher hasn\'t published any games yet'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGames.map((game, index) => (
                            <Card
                                key={game.id}
                                className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                                onClick={() => navigate(`/student/games/${game.id}/play`)}
                            >
                                {/* Game Header with Gradient */}
                                <div className={`h-32 bg-gradient-to-br ${getGameGradient(index)} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl opacity-90">
                                            {getGameIcon(game.template?.code)}
                                        </span>
                                    </div>

                                    {/* Difficulty Badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge className={`${getDifficultyColor(game.difficulty)} border font-semibold`}>
                                            {game.difficulty}
                                        </Badge>
                                    </div>

                                    {/* Played Badge */}
                                    {game.student_stats?.played && (
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-white/90 text-gray-900 border-0 font-semibold">
                                                ✓ Played
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-5">
                                    {/* Game Title */}
                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {game.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                        {game.lecture_title}
                                    </p>

                                    {/* Game Stats */}
                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Target className="w-4 h-4" />
                                            <span>{game.question_count} questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{game.estimated_duration} min</span>
                                        </div>
                                    </div>

                                    {/* Personal Best or Analytics */}
                                    {game.student_stats?.played ? (
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-amber-900">Your Best</span>
                                                <Trophy className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold text-amber-900">
                                                        {game.student_stats.best_score}
                                                    </div>
                                                    <div className="text-xs text-amber-700">
                                                        Rank #{game.student_stats.best_rank || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-amber-700">
                                                        {game.student_stats.total_attempts} attempts
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-semibold text-blue-900">
                                                    Class Stats
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                                                <div>
                                                    <div className="font-semibold">{game.analytics?.total_plays || 0}</div>
                                                    <div>plays</div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{game.analytics?.highest_score || 0}</div>
                                                    <div>high score</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Play Button */}
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md group-hover:shadow-lg transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/student/games/${game.id}/play`);
                                        }}
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {game.student_stats?.played ? 'Play Again' : 'Start Game'}
                                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
