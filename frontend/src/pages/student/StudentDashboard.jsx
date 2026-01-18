import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    BookOpen,
    Search,
    Flame,
    Award,
    Trophy,
    FileText,
    Layers,
    ClipboardList,
    Users,
    Bell,
    Loader2,
    Clock,
    ChevronRight,
    CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function StudentDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [lectures, setLectures] = useState([]);
    const [stats, setStats] = useState({
        level: 12,
        currentXP: 2450,
        nextLevelXP: 3000,
        dayStreak: 8,
        totalXP: 2450,
        achievements: 3,
        attendanceRate: 0
    });

    useEffect(() => {
        console.log('StudentDashboard useEffect triggered, user:', user);
        console.log('user?.id:', user?.id);

        const fetchData = async () => {
            if (!user?.id) {
                console.log('No user ID, setting loading to false');
                setLoading(false);
                return;
            }

            console.log('Fetching dashboard data for user:', user.id);

            try {
                setLoading(true);

                // Fetch lectures
                const lecturesRes = await api.get('/lectures/lectures/', {
                    params: { limit: 5, ordering: '-created_at' }
                });
                const lectureData = lecturesRes.data.results || lecturesRes.data || [];
                console.log('Fetched lectures:', lectureData.length);
                setLectures(lectureData);

                // Update stats from user data
                setStats(prev => ({
                    ...prev,
                    currentXP: user.xp || prev.currentXP,
                    totalXP: user.xp || prev.totalXP,
                    dayStreak: user.streak || prev.dayStreak
                }));

                // Fetch attendance records
                try {
                    const attendanceRes = await api.get('/attendance/records/', {
                        params: { student: user.id }
                    });
                    const attendanceData = attendanceRes.data.results || attendanceRes.data || [];
                    console.log('Fetched attendance records:', attendanceData.length);

                    // Calculate attendance rate
                    const totalRecords = attendanceData.length;
                    const presentRecords = attendanceData.filter(r => r.status === 'present').length;
                    const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

                    setStats(prev => ({
                        ...prev,
                        attendanceRate
                    }));
                } catch (err) {
                    console.error('Error fetching attendance:', err);
                }

                console.log('Dashboard data fetched successfully');
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]); // Only re-run when user ID changes

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const progressPercentage = (stats.currentXP / stats.nextLevelXP) * 100;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left: Dashboard Title */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-600">Welcome back, {user?.first_name || 'Alex'}!</p>
                    </div>

                    {/* Right: Search, Streak, XP, Buttons, Notification */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Day Streak */}
                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg">
                            <Flame className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-gray-900">{stats.dayStreak} day streak</span>
                        </div>

                        {/* Total XP */}
                        <div className="flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-lg">
                            <Award className="w-4 h-4 text-amber-700" />
                            <span className="text-sm font-semibold text-gray-900">{stats.totalXP} XP</span>
                        </div>

                        {/* Teacher/Student Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                Teacher
                            </button>
                            <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg">
                                Student
                            </button>
                        </div>

                        {/* Notification Bell */}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Level Card */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-6">
                                    {/* Level Badge */}
                                    <div className="w-20 h-20 bg-amber-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-3xl font-bold text-gray-900">{stats.level}</span>
                                    </div>

                                    {/* Level Info */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Level {stats.level}</h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {stats.currentXP} / {stats.nextLevelXP} XP to next level
                                        </p>
                                        {/* Progress Bar */}
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gray-900 transition-all duration-500"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-amber-600 mb-1">
                                                <Flame className="w-5 h-5" />
                                                <span className="text-2xl font-bold text-gray-900">{stats.dayStreak}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Day Streak</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-amber-600 mb-1">
                                                <Award className="w-5 h-5" />
                                                <span className="text-2xl font-bold text-gray-900">{stats.totalXP}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Total XP</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-amber-600 mb-1">
                                                <Trophy className="w-5 h-5" />
                                                <span className="text-2xl font-bold text-gray-900">{stats.achievements}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Achievements</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Lectures */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-amber-600" />
                                        <h3 className="text-lg font-bold text-gray-900">Available Lectures</h3>
                                    </div>
                                    <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                                        View All
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {lectures.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">No lectures available yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {lectures.slice(0, 3).map((lecture) => (
                                            <div
                                                key={lecture.id}
                                                className="p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer"
                                                onClick={() => navigate(`/student/lectures/${lecture.id}`)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-1">
                                                            {lecture.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {lecture.subject} • {lecture.duration || 45} min
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{formatDate(lecture.created_at)}</span>
                                                    </div>
                                                </div>

                                                {/* Resources */}
                                                <div className="flex items-center gap-2">
                                                    {lecture.has_notes && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            1 Notes
                                                        </Badge>
                                                    )}
                                                    {lecture.has_flashcards && (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                                            <Layers className="w-3 h-3 mr-1" />
                                                            1 Flashcards
                                                        </Badge>
                                                    )}
                                                    {lecture.has_quiz && (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                                            <ClipboardList className="w-3 h-3 mr-1" />
                                                            1 Quiz
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-6">
                        {/* Continue Learning */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Continue Learning</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/student/notes')}
                                        className="w-full p-4 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="w-5 h-5 text-gray-900" />
                                            <span className="font-semibold text-gray-900">Browse Lectures</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/student/attendance')}
                                        className="w-full p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                <span className="font-semibold text-gray-900">Attendance Rate</span>
                                            </div>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {stats.attendanceRate || 0}%
                                            </span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/student/quizzes')}
                                        className="w-full p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ClipboardList className="w-5 h-5 text-gray-700" />
                                            <span className="font-semibold text-gray-900">Take a Quiz</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/student/leaderboard')}
                                        className="w-full p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-gray-700" />
                                            <span className="font-semibold text-gray-900">View Leaderboard</span>
                                        </div>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Trophy className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                    <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">👑</span>
                                    </div>
                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <span className="text-xs text-gray-500 font-medium">Locked</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
