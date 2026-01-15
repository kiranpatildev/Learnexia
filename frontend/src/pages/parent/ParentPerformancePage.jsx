import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    TrendingUp,
    TrendingDown,
    Trophy,
    Target,
    BarChart3,
    Calendar
} from 'lucide-react';

export function ParentPerformancePage() {
    const [timeframe, setTimeframe] = useState('month');

    const performanceData = {
        overallScore: 88,
        trend: 'up',
        trendValue: 5,
        subjects: [
            { name: 'Mathematics', score: 92, trend: 'up', assignments: 12, quizzes: 8 },
            { name: 'Science', score: 88, trend: 'up', assignments: 10, quizzes: 6 },
            { name: 'History', score: 85, trend: 'down', assignments: 8, quizzes: 5 },
            { name: 'English', score: 90, trend: 'up', assignments: 11, quizzes: 7 },
        ],
        recentScores: [
            { id: 1, title: 'Math Quiz Chapter 5', score: 95, date: '2 days ago', type: 'quiz' },
            { id: 2, title: 'Science Assignment', score: 88, date: '3 days ago', type: 'assignment' },
            { id: 3, title: 'History Essay', score: 82, date: '5 days ago', type: 'assignment' },
            { id: 4, title: 'English Quiz', score: 93, date: '1 week ago', type: 'quiz' },
        ],
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Performance Reports</h1>
                    <p className="text-sm text-slate-600 mt-1">Track academic progress and achievements</p>
                </div>
                <div className="flex gap-2">
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
                    <Button
                        variant={timeframe === 'year' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeframe('year')}
                    >
                        This Year
                    </Button>
                </div>
            </div>

            {/* Overall Performance */}
            <Card className="border-2 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Overall Performance</p>
                            <div className="flex items-center gap-3">
                                <p className="text-4xl font-bold text-slate-900">{performanceData.overallScore}%</p>
                                <div className={`flex items-center gap-1 ${performanceData.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {performanceData.trend === 'up' ? (
                                        <TrendingUp className="w-5 h-5" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5" />
                                    )}
                                    <span className="font-semibold">{performanceData.trendValue}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Subject Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {performanceData.subjects.map((subject, index) => (
                            <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-slate-900">{subject.name}</h3>
                                        <div className={`flex items-center gap-1 text-sm ${subject.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                            {subject.trend === 'up' ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900">{subject.score}%</span>
                                </div>

                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full bg-blue-500 transition-all"
                                        style={{ width: `${subject.score}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span>{subject.assignments} Assignments</span>
                                    <span>•</span>
                                    <span>{subject.quizzes} Quizzes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Scores */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Scores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {performanceData.recentScores.map((score) => (
                            <div
                                key={score.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900">{score.title}</h3>
                                        <p className="text-sm text-slate-600">{score.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={score.type === 'quiz' ? 'default' : 'secondary'}>
                                        {score.type}
                                    </Badge>
                                    <span className={`text-xl font-bold ${score.score >= 90 ? 'text-emerald-600' :
                                            score.score >= 80 ? 'text-blue-600' :
                                                score.score >= 70 ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {score.score}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-900">Strengths</p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    Excelling in Mathematics and English
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-900">Focus Areas</p>
                                <p className="text-xs text-amber-700 mt-1">
                                    History needs more attention
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Overall Trend</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Improving steadily this month
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
