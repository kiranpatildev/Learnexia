import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    TrendingUp,
    Calendar,
    Trophy,
    AlertCircle,
    BookOpen,
    CheckCircle,
    Clock,
    MessageSquare,
    BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ParentDashboard() {
    const navigate = useNavigate();

    // Mock data - will be replaced with real API calls
    const children = [
        {
            id: 1,
            name: 'Emma Johnson',
            grade: 'Grade 4A',
            attendance: 95,
            averageScore: 88,
            rank: 5,
        },
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'assignment',
            title: 'Math Worksheet Chapter 5',
            subject: 'Mathematics',
            status: 'completed',
            score: 92,
            date: 'Today',
        },
        {
            id: 2,
            type: 'quiz',
            title: 'Science Quiz: Photosynthesis',
            subject: 'Science',
            status: 'completed',
            score: 85,
            date: 'Yesterday',
        },
        {
            id: 3,
            type: 'assignment',
            title: 'History Essay',
            subject: 'History',
            status: 'pending',
            dueDate: 'Due in 2 days',
            date: '2 days ago',
        },
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Parent-Teacher Meeting',
            date: 'Jan 20, 2026',
            time: '3:00 PM',
            type: 'meeting',
        },
        {
            id: 2,
            title: 'Science Fair',
            date: 'Jan 25, 2026',
            time: '10:00 AM',
            type: 'event',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Parent Dashboard</h1>
                <p className="text-sm text-slate-600 mt-1">Monitor your child's progress and activities</p>
            </div>

            {/* Children Cards */}
            <div className="grid grid-cols-1 gap-6">
                {children.map((child) => (
                    <Card key={child.id} className="border-2 border-blue-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                                            {child.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">{child.name}</h2>
                                        <p className="text-sm text-slate-600">{child.grade}</p>
                                    </div>
                                </div>
                                <Button onClick={() => navigate('/parent/performance')}>
                                    View Details
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        <p className="text-sm font-medium text-emerald-900">Attendance</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-emerald-700">{child.attendance}%</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-900">Average Score</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-blue-700">{child.averageScore}%</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy className="w-4 h-4 text-amber-600" />
                                        <p className="text-sm font-medium text-amber-900">Class Rank</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-amber-700">#{child.rank}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column - Recent Activity */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Activity</CardTitle>
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100'
                                            }`}>
                                            {activity.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-amber-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-slate-900 mb-1">{activity.title}</h3>
                                            <p className="text-sm text-slate-600 mb-2">{activity.subject} • {activity.date}</p>
                                            {activity.status === 'completed' ? (
                                                <Badge variant="success">Score: {activity.score}%</Badge>
                                            ) : (
                                                <Badge variant="warning">{activity.dueDate}</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subject Performance */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Subject Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">Mathematics</span>
                                        <span className="font-medium text-slate-900">92%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">Science</span>
                                        <span className="font-medium text-slate-900">88%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '88%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">History</span>
                                        <span className="font-medium text-slate-900">85%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">English</span>
                                        <span className="font-medium text-slate-900">90%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: '90%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                                    >
                                        <p className="text-sm font-medium text-blue-900">{event.title}</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            {event.date} • {event.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/parent/attendance')}>
                                View Calendar
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
                                    onClick={() => navigate('/parent/messages')}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message Teacher
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/parent/performance')}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Reports
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/parent/attendance')}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Attendance History
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card className="border-amber-200 bg-amber-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-900">
                                <AlertCircle className="w-5 h-5" />
                                Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-amber-900">
                                    1 assignment due in 2 days
                                </p>
                                <p className="text-sm text-amber-900">
                                    Parent-teacher meeting scheduled
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
