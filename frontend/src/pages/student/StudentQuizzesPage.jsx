import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ClipboardList, Trophy, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { quizService } from '../../services/student.service';

export function StudentQuizzesPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        averageScore: 0,
    });

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await quizService.getQuizzes({ published: true });
            const quizData = response.results || response || [];

            setQuizzes(quizData);

            // Calculate stats
            const completed = quizData.filter(q => q.attempted).length;
            const avgScore = completed > 0
                ? Math.round(quizData.filter(q => q.attempted).reduce((acc, q) => acc + (q.score || 0), 0) / completed)
                : 0;

            setStats({
                total: quizData.length,
                completed,
                pending: quizData.length - completed,
                averageScore: avgScore,
            });
        } catch (err) {
            console.error('Error fetching quizzes:', err);
            setError('Failed to load quizzes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const difficultyColors = {
        EASY: 'emerald',
        MEDIUM: 'amber',
        HARD: 'red',
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        if (filter === 'completed') return quiz.attempted;
        if (filter === 'pending') return !quiz.attempted;
        return true;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Quizzes</h1>
                    <p className="text-sm text-slate-600 mt-1">Test your knowledge and track your progress</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All ({quizzes.length})
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({stats.completed})
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
                            <Button variant="outline" size="sm" onClick={fetchQuizzes}>
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Quizzes</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Completed</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.completed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Pending</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.pending}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Score</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.averageScore}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quizzes List */}
            {filteredQuizzes.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title={quizzes.length === 0 ? "No quizzes available" : "No quizzes found"}
                    description={
                        quizzes.length === 0
                            ? "Quizzes will appear here once your teacher creates them"
                            : filter === 'completed'
                                ? "You haven't completed any quizzes yet"
                                : "You've completed all available quizzes!"
                    }
                    action={
                        quizzes.length > 0 && filter !== 'all' ? (
                            <Button variant="outline" onClick={() => setFilter('all')}>
                                View All Quizzes
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredQuizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg ${quiz.attempted ? 'bg-emerald-100' : 'bg-blue-100'
                                                } flex items-center justify-center`}>
                                                {quiz.attempted ? (
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {quiz.title || quiz.lecture?.title || 'Quiz'}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    {quiz.lecture?.class_name || 'Class'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 flex-wrap">
                                            <Badge variant={difficultyColors[quiz.difficulty] || 'secondary'}>
                                                {quiz.difficulty || 'MEDIUM'}
                                            </Badge>
                                            <span className="text-sm text-slate-600 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {quiz.time_limit || 15} min
                                            </span>
                                            <span className="text-sm text-slate-600">
                                                {quiz.question_count || quiz.questions?.length || 10} questions
                                            </span>
                                            {quiz.attempted && quiz.score !== undefined && (
                                                <Badge variant={quiz.score >= 70 ? 'success' : 'warning'}>
                                                    Score: {quiz.score}%
                                                </Badge>
                                            )}
                                        </div>

                                        {quiz.attempted && quiz.completed_at && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                Completed on {new Date(quiz.completed_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        {quiz.attempted ? (
                                            <Button variant="outline">
                                                <Trophy className="w-4 h-4 mr-2" />
                                                View Results
                                            </Button>
                                        ) : (
                                            <Button>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Quiz
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
