import { useState, useEffect } from 'react';
import { Users, Target, Trophy, BookOpen, Award } from 'lucide-react';
import api from '../../services/api';

export function TeacherAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('week');
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        avgAttendance: 0,
        avgScore: 0,
        lecturesThisWeek: 0,
        quizzesCompleted: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch students
            const classroomsRes = await api.get('/schools/classrooms/');
            const classrooms = classroomsRes.data.results || classroomsRes.data || [];

            const allStudents = new Set();
            for (const classroom of classrooms) {
                try {
                    const studentsRes = await api.get(`/schools/classrooms/${classroom.id}/students/`);
                    const students = studentsRes.data.results || studentsRes.data || [];
                    students.forEach(s => allStudents.add(s.student));
                } catch (err) {
                    console.error('Error fetching students:', err);
                }
            }

            // Fetch lectures
            const lecturesRes = await api.get('/lectures/lectures/');
            const lectures = lecturesRes.data.results || lecturesRes.data || [];

            // Fetch attendance records
            const attendanceRes = await api.get('/attendance/records/');
            const attendanceRecords = attendanceRes.data.results || attendanceRes.data || [];

            // Calculate attendance percentage
            const presentRecords = attendanceRecords.filter(r => r.status === 'present').length;
            const totalRecords = attendanceRecords.length;
            const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

            setStats({
                totalStudents: allStudents.size,
                activeStudents: allStudents.size,
                avgAttendance: avgAttendance,
                avgScore: 0, // Would need assessment API
                lecturesThisWeek: lectures.length,
                quizzesCompleted: 0 // Would need quiz API
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 animate-gradient-xy">
                {/* Sparkle Effects */}
                <div className="absolute inset-0 opacity-30">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>
                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
                        <p className="text-blue-200">Track class performance and engagement</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${timeRange === 'week'
                                ? 'bg-white text-blue-900'
                                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${timeRange === 'month'
                                ? 'bg-white text-blue-900'
                                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setTimeRange('year')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${timeRange === 'year'
                                ? 'bg-white text-blue-900'
                                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                                }`}
                        >
                            This Year
                        </button>
                    </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Total Students - Blue Gradient */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl blur-sm group-hover:blur-md transition-all opacity-50" />
                        <div className="relative bg-gradient-to-br from-blue-500/90 to-blue-700/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Total Students</p>
                                <p className="text-5xl font-bold text-white mb-2">
                                    {loading ? '...' : stats.totalStudents}
                                </p>
                                <p className="text-blue-200 text-xs">↗ {stats.activeStudents} active</p>
                            </div>
                        </div>
                    </div>

                    {/* Avg Attendance - Green Gradient */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl blur-sm group-hover:blur-md transition-all opacity-50" />
                        <div className="relative bg-gradient-to-br from-emerald-400/90 to-teal-600/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm mb-1">Avg Attendance</p>
                                <p className="text-5xl font-bold text-white mb-2">
                                    {loading ? '...' : `${stats.avgAttendance}%`}
                                </p>
                                <p className="text-emerald-200 text-xs">Last 30 days</p>
                            </div>
                        </div>
                    </div>

                    {/* Avg Score - Purple Gradient */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-sm group-hover:blur-md transition-all opacity-50" />
                        <div className="relative bg-gradient-to-br from-purple-500/90 to-pink-600/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm mb-1">Avg Score</p>
                                <p className="text-5xl font-bold text-white mb-2">
                                    {loading ? '...' : `${stats.avgScore}%`}
                                </p>
                                <p className="text-purple-200 text-xs">All assessments</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Lecture Activity */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-2xl blur-sm opacity-50" />
                        <div className="relative bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-orange-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 min-h-[300px]">
                            <h3 className="text-xl font-bold text-white mb-4">Lecture Activity</h3>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Lectures This Week</p>
                                    <p className="text-blue-200 text-sm">Total conducted</p>
                                </div>
                                <div className="ml-auto">
                                    <p className="text-4xl font-bold text-white">
                                        {loading ? '...' : stats.lecturesThisWeek}
                                    </p>
                                </div>
                            </div>
                            {/* Chart Placeholder */}
                            <div className="relative h-32 flex items-end justify-center gap-2 mb-4">
                                {[30, 50, 40, 60, 45, 70, 55].map((height, i) => (
                                    <div
                                        key={i}
                                        className="w-8 bg-white/20 rounded-t backdrop-blur-sm"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                            <p className="text-center text-white/60 text-sm">Chart visualization coming soon</p>
                        </div>
                    </div>

                    {/* Quiz Performance */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-blue-600 to-pink-500 rounded-2xl blur-sm opacity-50" />
                        <div className="relative bg-gradient-to-br from-teal-900/80 via-blue-900/80 to-pink-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 min-h-[300px]">
                            <h3 className="text-xl font-bold text-white mb-4">Quiz Performance</h3>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Quizzes Completed</p>
                                    <p className="text-teal-200 text-sm">By all students</p>
                                </div>
                                <div className="ml-auto">
                                    <p className="text-4xl font-bold text-white">
                                        {loading ? '...' : stats.quizzesCompleted}
                                    </p>
                                </div>
                            </div>
                            {/* Chart Placeholder */}
                            <div className="relative h-32 flex items-end justify-center gap-2 mb-4">
                                {[40, 60, 35, 70, 50, 65, 45].map((height, i) => (
                                    <div
                                        key={i}
                                        className="w-8 bg-white/20 rounded-t backdrop-blur-sm"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                            <p className="text-center text-white/60 text-sm">Chart visualization coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Gradient Wave */}
                <div className="relative h-32 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 via-pink-600 to-orange-500 opacity-80" />
                    <div className="absolute inset-0">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bottom-0 w-1 bg-white/30 rounded-full animate-wave"
                                style={{
                                    left: `${i * 3.33}%`,
                                    height: `${30 + Math.random() * 40}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient-xy {
                    0%, 100% { background-position: 0% 0%; }
                    25% { background-position: 100% 0%; }
                    50% { background-position: 100% 100%; }
                    75% { background-position: 0% 100%; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -20px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(20px, 20px) scale(1.05); }
                }
                @keyframes wave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.5); }
                }
                .animate-gradient-xy {
                    background-size: 400% 400%;
                    animation: gradient-xy 15s ease infinite;
                }
                .animate-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                }
                .animate-blob {
                    animation: blob 7s ease-in-out infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-wave {
                    animation: wave 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
