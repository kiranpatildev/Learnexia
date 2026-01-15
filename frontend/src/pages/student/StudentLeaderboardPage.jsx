import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Trophy, Medal, TrendingUp, Star, AlertCircle, Users } from 'lucide-react';
import { leaderboardService } from '../../services/student.service';
import { useAuthStore } from '../../store/authStore';

export function StudentLeaderboardPage() {
    const { user } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeframe, setTimeframe] = useState('all'); // all, week, month

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await leaderboardService.getLeaderboard({ timeframe });
            const leaderboardData = response.results || response || [];

            // Sort by XP/score
            const sorted = leaderboardData.sort((a, b) => (b.xp || b.total_xp || 0) - (a.xp || a.total_xp || 0));
            setLeaderboard(sorted);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (index) => {
        if (index === 0) return { icon: Trophy, color: 'text-yellow-600 bg-yellow-100', label: '1st' };
        if (index === 1) return { icon: Medal, color: 'text-slate-400 bg-slate-100', label: '2nd' };
        if (index === 2) return { icon: Medal, color: 'text-amber-600 bg-amber-100', label: '3rd' };
        return { icon: Star, color: 'text-blue-600 bg-blue-100', label: `${index + 1}th` };
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const currentUserRank = leaderboard.findIndex(u => u.id === user?.id || u.user_id === user?.id);
    const currentUserData = leaderboard[currentUserRank];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Leaderboard</h1>
                    <p className="text-sm text-slate-600 mt-1">See how you rank against your classmates</p>
                </div>

                {/* Timeframe Filter */}
                <div className="flex gap-2">
                    <Button
                        variant={timeframe === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeframe('all')}
                    >
                        All Time
                    </Button>
                    <Button
                        variant={timeframe === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeframe('week')}
                    >
                        This Week
                    </Button>
                    <Button
                        variant={timeframe === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeframe('month')}
                    >
                        This Month
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-900">
                                <AlertCircle className="w-5 h-5" />
                                <p>{error}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchLeaderboard}>
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current User Stats */}
            {currentUserData && currentUserRank >= 0 && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Your Ranking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-slate-600">Rank</p>
                                <p className="text-2xl font-semibold text-blue-900">#{currentUserRank + 1}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">XP</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {currentUserData.xp || currentUserData.total_xp || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Level</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {currentUserData.level || Math.floor((currentUserData.xp || 0) / 100)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Score</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {currentUserData.average_score || 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {leaderboard.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No leaderboard data yet"
                    description="The leaderboard will appear once students start earning XP through quizzes and activities"
                />
            ) : (
                <>
                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                        <div className="grid grid-cols-3 gap-4">
                            {leaderboard.slice(0, 3).map((student, index) => {
                                const rank = getRankBadge(index);
                                const RankIcon = rank.icon;
                                const studentName = student.name || student.user_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                                const studentXP = student.xp || student.total_xp || 0;
                                const studentLevel = student.level || Math.floor(studentXP / 100);

                                return (
                                    <Card key={student.id || index} className={index === 0 ? 'border-2 border-yellow-300' : ''}>
                                        <CardContent className="pt-6 text-center">
                                            <div className={`w-16 h-16 mx-auto rounded-full ${rank.color} flex items-center justify-center mb-3`}>
                                                <RankIcon className="w-8 h-8" />
                                            </div>
                                            <Avatar className="w-20 h-20 mx-auto mb-3">
                                                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                                                    {getInitials(studentName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <h3 className="font-semibold text-slate-900 mb-1">{studentName}</h3>
                                            <p className="text-sm text-slate-600 mb-2">Level {studentLevel}</p>
                                            <Badge variant="secondary">{studentXP} XP</Badge>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Full Leaderboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Rankings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {leaderboard.map((student, index) => {
                                    const rank = getRankBadge(index);
                                    const RankIcon = rank.icon;
                                    const isCurrentUser = student.id === user?.id || student.user_id === user?.id;
                                    const studentName = student.name || student.user_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                                    const studentXP = student.xp || student.total_xp || 0;
                                    const studentLevel = student.level || Math.floor(studentXP / 100);

                                    return (
                                        <div
                                            key={student.id || index}
                                            className={`flex items-center gap-4 p-4 rounded-lg border ${isCurrentUser ? 'border-blue-300 bg-blue-50' : 'border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${rank.color} flex items-center justify-center flex-shrink-0`}>
                                                <RankIcon className="w-5 h-5" />
                                            </div>

                                            <Avatar>
                                                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                                    {getInitials(studentName)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <h3 className="font-medium text-slate-900">
                                                    {studentName}
                                                    {isCurrentUser && <Badge variant="secondary" className="ml-2">You</Badge>}
                                                </h3>
                                                <p className="text-sm text-slate-600">Level {studentLevel}</p>
                                            </div>

                                            <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                                                <div className="text-center">
                                                    <p className="font-medium text-slate-900">{studentXP}</p>
                                                    <p>XP</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-slate-900">
                                                        {student.quizzes_completed || 0}
                                                    </p>
                                                    <p>Quizzes</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-slate-900">
                                                        {student.average_score || 0}%
                                                    </p>
                                                    <p>Avg Score</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-slate-900">
                                                        {student.streak || student.current_streak || 0}
                                                    </p>
                                                    <p>Streak</p>
                                                </div>
                                            </div>

                                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
