import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Search,
    Flame,
    Trophy,
    FileText,
    Layers,
    ClipboardList,
    TrendingUp,
    CheckCircle,
    Target,
    Zap,
    ArrowRight,
    Star,
    Gamepad2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function StudentDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        assignments: { pending: 0, total: 0 },
        attendance: { rate: 92 },
        averageScore: { score: 96 },
        dayStreak: 0,
        totalXP: 20
    });

    useEffect(() => {
        fetchDashboardData();
    }, [user?.id]);

    const fetchDashboardData = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const assignmentsRes = await api.get('/assignments/');
            const assignmentsData = assignmentsRes.data.results || assignmentsRes.data || [];
            const pendingAssignments = assignmentsData.filter(a => a.status === 'pending').length;

            const attendanceRes = await api.get('/attendance/student-summary/');
            const attendanceData = attendanceRes.data || {};

            setStats({
                assignments: {
                    pending: pendingAssignments,
                    total: assignmentsData.length
                },
                attendance: {
                    rate: attendanceData.attendance_percentage || 92
                },
                averageScore: {
                    score: attendanceData.average_score || 96
                },
                dayStreak: user?.day_streak || 0,
                totalXP: user?.total_xp || 20
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#dfe9f3] via-[#e0c3fc] to-[#cfd9df]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 text-sm font-medium">Loading your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#dfe9f3] via-[#e0c3fc] to-[#cfd9df] relative overflow-hidden">
            {/* Ambient Light Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="ml-[120px] max-w-[1400px] px-16 py-10 relative z-10">
                {/* Header Section - Premium Glass Container */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-8 p-8 rounded-[28px] bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-[30px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                >
                    <div className="flex items-start justify-between mb-6">
                        {/* Welcome Section */}
                        <div>
                            <h1 className="text-[38px] font-bold text-gray-800 mb-2 tracking-tight">
                                Welcome back, {user?.first_name || 'Rohan'}! 👋
                            </h1>
                            <p className="text-[15px] text-gray-600 font-medium">
                                Ready to continue your learning journey?
                            </p>
                        </div>

                        {/* Badges with Glow */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-orange-200/60 to-orange-100/40 backdrop-blur-xl rounded-full border border-orange-300/40 shadow-[0_4px_20px_rgba(251,146,60,0.3)]"
                            >
                                <Flame className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                                <span className="text-sm font-bold text-orange-700">
                                    {stats.dayStreak} day streak
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-purple-200/60 to-purple-100/40 backdrop-blur-xl rounded-full border border-purple-300/40 shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                            >
                                <Zap className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                                <span className="text-sm font-bold text-purple-700">
                                    {stats.totalXP} xp
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Search Bar with Inner Glow */}
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search lectures, assignments, or study materials..."
                            className="w-full h-14 pl-14 pr-6 bg-white/40 backdrop-blur-xl border border-white/50 rounded-[20px] text-[15px] text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] transition-all duration-300"
                        />
                    </div>
                </motion.div>

                {/* Performance Cards */}
                <div className="mb-10">
                    <h2 className="text-[24px] font-bold text-gray-800 mb-6 tracking-tight">Your Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pending Assignments - Blue Tint */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-cyan-200/20 rounded-[24px] blur-sm"></div>
                            <div className="relative p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-300/60 to-blue-200/40 backdrop-blur-xl rounded-[18px] flex items-center justify-center shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
                                        <ClipboardList className="w-6 h-6 text-blue-700" strokeWidth={2.5} />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Pending Assignments
                                </p>
                                <div className="mb-4">
                                    <span className="text-[36px] font-bold text-gray-800 leading-none">
                                        {stats.assignments.pending}
                                    </span>
                                    <span className="text-[36px] font-bold text-gray-500 leading-none"> of {stats.assignments.total}</span>
                                </div>
                                <button
                                    onClick={() => navigate('/student/assignments')}
                                    className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:gap-2.5 transition-all duration-200"
                                >
                                    View All
                                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Attendance Rate - Green Tint */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/40 to-teal-200/20 rounded-[24px] blur-sm"></div>
                            <div className="relative p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-300/60 to-emerald-200/40 backdrop-blur-xl rounded-[18px] flex items-center justify-center shadow-[0_4px_15px_rgba(16,185,129,0.3)]">
                                        <CheckCircle className="w-6 h-6 text-emerald-700" strokeWidth={2.5} />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Attendance Rate
                                </p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-[36px] font-bold text-gray-800 leading-none">{stats.attendance.rate}%</span>
                                    <span className="text-[14px] text-gray-600 font-semibold">this month</span>
                                </div>
                                <button
                                    onClick={() => navigate('/student/attendance')}
                                    className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600 hover:gap-2.5 transition-all duration-200"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Average Score - Purple Tint */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 to-pink-200/20 rounded-[24px] blur-sm"></div>
                            <div className="relative p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-300/60 to-purple-200/40 backdrop-blur-xl rounded-[18px] flex items-center justify-center shadow-[0_4px_15px_rgba(168,85,247,0.3)]">
                                        <Target className="w-6 h-6 text-purple-700" strokeWidth={2.5} />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Average Score
                                </p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-[36px] font-bold text-gray-800 leading-none">{stats.averageScore.score}%</span>
                                    <span className="text-[14px] text-gray-600 font-semibold">overall</span>
                                </div>
                                <button
                                    onClick={() => navigate('/student/leaderboard')}
                                    className="flex items-center gap-1.5 text-[13px] font-bold text-purple-600 hover:gap-2.5 transition-all duration-200"
                                >
                                    View Leaderboard
                                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Continue Learning */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                        >
                            <h2 className="text-[22px] font-bold text-gray-800 mb-6 tracking-tight">Continue Learning</h2>
                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/student/notes')}
                                    className="flex items-center gap-2.5 px-7 py-4 bg-gradient-to-br from-emerald-400/80 to-emerald-500/70 backdrop-blur-xl text-white text-[14px] font-bold rounded-[18px] shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.5)] border border-white/30 transition-all duration-300"
                                >
                                    <BookOpen className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                    Browse Lectures
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/student/assignments')}
                                    className="flex items-center gap-2.5 px-7 py-4 bg-gradient-to-br from-amber-300/80 to-amber-400/70 backdrop-blur-xl text-gray-800 text-[14px] font-bold rounded-[18px] shadow-[0_8px_25px_rgba(251,191,36,0.4)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.5)] border border-white/30 transition-all duration-300"
                                >
                                    <FileText className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                    View Assignments
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/student/games')}
                                    className="flex items-center gap-2.5 px-7 py-4 bg-gradient-to-br from-purple-400/80 to-purple-500/70 backdrop-blur-xl text-white text-[14px] font-bold rounded-[18px] shadow-[0_8px_25px_rgba(168,85,247,0.4)] hover:shadow-[0_12px_35px_rgba(168,85,247,0.5)] border border-white/30 transition-all duration-300"
                                >
                                    <Gamepad2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                    Practice Games
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Study Tools */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quizzes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                whileHover={{ scale: 1.03, y: -4 }}
                                onClick={() => navigate('/student/quizzes')}
                                className="p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-300/60 to-blue-200/40 backdrop-blur-xl rounded-[18px] flex items-center justify-center mb-5 shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
                                    <ClipboardList className="w-6 h-6 text-blue-700" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[20px] font-bold text-gray-800 mb-2">Quizzes</h3>
                                <p className="text-[13px] text-gray-600 mb-5 font-semibold">Test your knowledge</p>
                                <div className="text-[48px] font-bold text-gray-800 leading-none">3</div>
                            </motion.div>

                            {/* Flashcards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                whileHover={{ scale: 1.03, y: -4 }}
                                onClick={() => navigate('/student/flashcards')}
                                className="p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-300/60 to-purple-200/40 backdrop-blur-xl rounded-[18px] flex items-center justify-center mb-5 shadow-[0_4px_15px_rgba(168,85,247,0.3)]">
                                    <Layers className="w-6 h-6 text-purple-700" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[20px] font-bold text-gray-800 mb-2">Flashcards</h3>
                                <p className="text-[13px] text-gray-600 mb-5 font-semibold">Review key concepts</p>
                                <div className="text-[48px] font-bold text-gray-800 leading-none">2</div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column - Achievements */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="p-7 rounded-[24px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[25px] border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] sticky top-6"
                    >
                        <h2 className="text-[22px] font-bold text-gray-800 mb-6 tracking-tight">Achievements</h2>

                        <div className="space-y-4">
                            {/* First Steps */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-start gap-4 p-5 bg-white/30 backdrop-blur-xl rounded-[20px] border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.08)]"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-300/70 to-amber-200/50 backdrop-blur-xl rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(251,191,36,0.3)]">
                                    <Trophy className="w-6 h-6 text-amber-700" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-[15px] font-bold text-gray-800">First Steps</h4>
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[12px] text-gray-600 font-semibold">Complete your first lecture</p>
                                </div>
                            </motion.div>

                            {/* On Fire */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-start gap-4 p-5 bg-white/30 backdrop-blur-xl rounded-[20px] border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.08)]"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-300/70 to-purple-200/50 backdrop-blur-xl rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(168,85,247,0.3)]">
                                    <Flame className="w-6 h-6 text-purple-700" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-bold text-gray-800 mb-1">On Fire!</h4>
                                    <p className="text-[12px] text-gray-600 font-semibold">7 day learning streak</p>
                                </div>
                            </motion.div>

                            {/* Rising Star */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-start gap-4 p-5 bg-white/30 backdrop-blur-xl rounded-[20px] border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.08)]"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-300/70 to-blue-200/50 backdrop-blur-xl rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                                    <Star className="w-6 h-6 text-blue-700" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-bold text-gray-800 mb-1">Rising Star</h4>
                                    <p className="text-[12px] text-gray-600 font-semibold">Score 90% or higher on a quiz</p>
                                </div>
                            </motion.div>
                        </div>

                        <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => navigate('/student/profile')}
                            className="flex items-center gap-1.5 text-[13px] font-bold text-purple-600 mt-6 hover:gap-2.5 transition-all duration-200"
                        >
                            View All Achievements
                            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
