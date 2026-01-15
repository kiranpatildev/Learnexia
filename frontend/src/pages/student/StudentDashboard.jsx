import { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { BookOpen, Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Changed to false to show content immediately

    // Simple mock data for now
    const stats = {
        lecturesWatched: 0,
        assignmentsPending: 0,
        quizzesCompleted: 0,
        averageScore: 0,
        xp: 0,
        streak: 0,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header with XP and Streak */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-600 mt-1">Welcome back! Here's your progress</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{stats.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg">
                        <Flame className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">{stats.streak} Day Streak</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Lectures Watched"
                    value={stats.lecturesWatched}
                    icon={BookOpen}
                    color="blue"
                />
                <StatCard
                    label="Assignments Pending"
                    value={stats.assignmentsPending}
                    icon={Target}
                    color="amber"
                />
                <StatCard
                    label="Quizzes Completed"
                    value={stats.quizzesCompleted}
                    icon={Trophy}
                    color="emerald"
                />
                <StatCard
                    label="Average Score"
                    value={`${stats.averageScore}%`}
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column - Recent Lecture Notes */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Lecture Notes</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/student/notes')}>
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No lecture notes yet</h3>
                                <p className="text-sm text-slate-600">
                                    Notes will appear here once your teacher generates them
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Assignments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm text-slate-600">No pending assignments</p>
                                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => navigate('/student/assignments')}
                            >
                                View All Assignments
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/student/notes')}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    View Notes
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/student/quizzes')}
                                >
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Take Quiz
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/student/leaderboard')}
                                >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    View Leaderboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
