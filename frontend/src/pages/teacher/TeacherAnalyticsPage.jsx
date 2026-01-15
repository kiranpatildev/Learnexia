import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    Trophy,
    Target,
    Calendar
} from 'lucide-react';

export function TeacherAnalyticsPage() {
    const [timeframe, setTimeframe] = useState('week');

    const stats = {
        totalStudents: 0,
        activeStudents: 0,
        averageAttendance: 0,
        averageScore: 0,
        lecturesThisWeek: 0,
        quizzesCompleted: 0,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-600 mt-1">Track class performance and engagement</p>
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

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Students</p>
                                <p className="text-3xl font-semibold text-slate-900">{stats.totalStudents}</p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                    {stats.activeStudents} active
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Target className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Attendance</p>
                                <p className="text-3xl font-semibold text-slate-900">{stats.averageAttendance}%</p>
                                <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Score</p>
                                <p className="text-3xl font-semibold text-slate-900">{stats.averageScore}%</p>
                                <p className="text-xs text-slate-500 mt-1">All assessments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lecture Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Lectures This Week</p>
                                        <p className="text-xs text-slate-600">Total conducted</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-semibold text-slate-900">{stats.lecturesThisWeek}</p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="h-40 flex items-end justify-center">
                                    <div className="text-center text-slate-400">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                                        <p className="text-sm">Chart visualization coming soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Trophy className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Quizzes Completed</p>
                                        <p className="text-xs text-slate-600">By all students</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-semibold text-slate-900">{stats.quizzesCompleted}</p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="h-40 flex items-end justify-center">
                                    <div className="text-center text-slate-400">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                                        <p className="text-sm">Chart visualization coming soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Engagement Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <p className="text-sm text-blue-900 font-medium">Daily Active</p>
                            <p className="text-2xl font-semibold text-blue-900 mt-1">0</p>
                            <p className="text-xs text-blue-700 mt-1">Students today</p>
                        </div>

                        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                            <p className="text-sm text-emerald-900 font-medium">Assignments</p>
                            <p className="text-2xl font-semibold text-emerald-900 mt-1">0%</p>
                            <p className="text-xs text-emerald-700 mt-1">Completion rate</p>
                        </div>

                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <p className="text-sm text-purple-900 font-medium">Participation</p>
                            <p className="text-2xl font-semibold text-purple-900 mt-1">0%</p>
                            <p className="text-xs text-purple-700 mt-1">Class average</p>
                        </div>

                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                            <p className="text-sm text-amber-900 font-medium">Response Time</p>
                            <p className="text-2xl font-semibold text-amber-900 mt-1">0h</p>
                            <p className="text-xs text-amber-700 mt-1">Avg to questions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Analytics Dashboard</p>
                            <p className="text-xs text-blue-700 mt-1">
                                Detailed analytics and visualizations will be available once you have student activity data.
                                Create lectures, assignments, and quizzes to start tracking performance.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
