import { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
    Users,
    BookOpen,
    ClipboardCheck,
    AlertCircle,
    Calendar,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export function TeacherDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayAttendance: 0,
        pendingGrading: 0,
        lecturesThisWeek: 0,
        studentAlerts: 0,
    });
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch lectures
            const lecturesRes = await api.get('/lectures/lectures/', {
                params: { ordering: '-created_at', page_size: 5 }
            });
            const lectureData = lecturesRes.data.results || lecturesRes.data || [];
            setLectures(lectureData);

            // Fetch assignments for pending grading count
            const assignmentsRes = await api.get('/assignments/assignments/');
            const assignments = assignmentsRes.data.results || assignmentsRes.data || [];

            // Fetch behavior incidents for alerts
            const incidentsRes = await api.get('/behavior/incidents/', {
                params: { status: 'pending' }
            });
            const incidents = incidentsRes.data.results || incidentsRes.data || [];

            // Update stats
            setStats({
                todayAttendance: 0, // Would need attendance API
                pendingGrading: assignments.length,
                lecturesThisWeek: lectureData.length,
                studentAlerts: incidents.length,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Teacher Dashboard</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage your classes and track student progress</p>
                </div>
                <Button onClick={() => navigate('/teacher/ai-features')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Features
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Today's Attendance"
                    value={stats.todayAttendance}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="Pending Grading"
                    value={stats.pendingGrading}
                    icon={ClipboardCheck}
                    color="amber"
                />
                <StatCard
                    label="Lectures This Week"
                    value={stats.lecturesThisWeek}
                    icon={BookOpen}
                    color="emerald"
                />
                <StatCard
                    label="Student Alerts"
                    value={stats.studentAlerts}
                    icon={AlertCircle}
                    color="red"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column - Recent Lectures */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Lectures</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/lectures')}>
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">Loading...</p>
                                </div>
                            ) : lectures.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No lectures yet</h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Create your first lecture to get started
                                    </p>
                                    <Button onClick={() => navigate('/teacher/lectures')}>
                                        Create Lecture
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lectures.map((lecture) => (
                                        <div
                                            key={lecture.id}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                                            onClick={() => navigate('/teacher/lectures')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{lecture.title}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {lecture.chapter || 'No chapter'} • {lecture.topic || 'No topic'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                {lecture.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm text-slate-600">No classes scheduled today</p>
                            </div>
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
                                    onClick={() => navigate('/teacher/lectures')}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Manage Lectures
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/teacher/ai-features')}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI Features
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/teacher/assignments')}
                                >
                                    <ClipboardCheck className="w-4 h-4 mr-2" />
                                    Create Assignment
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/teacher/students')}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    View Students
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">All caught up!</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
