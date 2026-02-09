import { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Flame,
    Trophy,
    ClipboardList,
    CheckCircle,
    Zap,
    ArrowRight,
    Brain,
    Gamepad2,
    TrendingUp,
    Calendar,
    Target
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

// ============================================
// DESIGN SYSTEM COMPONENTS
// ============================================

const MetricCard = memo(({ icon: Icon, label, value, badge, badgeColor = 'blue' }) => {
    const badgeColors = {
        blue: 'bg-[#2D7FF9] text-white',
        cyan: 'bg-[#00BCD4] text-white',
        red: 'bg-[#E74C3C] text-white',
        green: 'bg-[#4CAF50] text-white',
        gray: 'bg-[#6C757D] text-white'
    };

    return (
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#2C3E50]">
                    <Icon size={24} strokeWidth={2} />
                </div>
                <div>
                    <p className="text-sm text-[#6C757D] font-medium">{label}</p>
                    <p className="text-2xl font-bold text-[#2C3E50] mt-1">{value}</p>
                </div>
            </div>
            {badge !== undefined && (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${badgeColors[badgeColor]}`}>
                    {badge}
                </div>
            )}
        </div>
    );
});

const StatusBadge = memo(({ status, children }) => {
    const statusColors = {
        completed: 'bg-[#4CAF50] text-white',
        pending: 'bg-[#FF9800] text-white',
        'in-progress': 'bg-[#2D7FF9] text-white',
        default: 'bg-[#6C757D] text-white'
    };

    return (
        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold ${statusColors[status] || statusColors.default}`}>
            {children}
        </span>
    );
});

const ListCard = memo(({ title, subtitle, status, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow"
    >
        <div className="text-left">
            <h3 className="text-base font-bold text-[#2C3E50]">{title}</h3>
            <p className="text-sm text-[#6C757D] mt-1">{subtitle}</p>
        </div>
        {status && <StatusBadge status={status}>{status}</StatusBadge>}
    </button>
));

const ActionButton = memo(({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-[#2D7FF9] hover:bg-[#1E6FE8] text-white',
        secondary: 'bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#E0E0E0]'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full h-11 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${variants[variant]}`}
        >
            {Icon && <Icon size={18} strokeWidth={2} />}
            {label}
        </button>
    );
});

const SectionCard = memo(({ title, action, children }) => (
    <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#2C3E50]">{title}</h2>
            {action && (
                <button className="text-[#2D7FF9] text-sm font-semibold hover:underline flex items-center gap-1">
                    {action} <ArrowRight size={14} />
                </button>
            )}
        </div>
        {children}
    </div>
));

// ============================================
// MAIN DASHBOARD
// ============================================

export function StudentDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        assignments: { pending: 0, total: 0 },
        attendance: { rate: 92 },
        averageScore: { score: 96 },
        dayStreak: 0,
        totalXP: 20,
        quizzes: { available: 0 },
        flashcards: { sets: 0 }
    });

    const fetchDashboardData = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const [assignmentsRes, quizzesRes, flashcardsRes] = await Promise.all([
                api.get('/assignments/').catch(() => ({ data: [] })),
                api.get('/assessments/quizzes/?is_published=true').catch(() => ({ data: [] })),
                api.get('/flashcards/flashcard-sets/?is_published=true').catch(() => ({ data: [] }))
            ]);

            const assignmentsData = assignmentsRes.data.results || assignmentsRes.data || [];
            const quizzesData = quizzesRes.data.results || quizzesRes.data || [];
            const flashcardsData = flashcardsRes.data.results || flashcardsRes.data || [];

            const pendingAssignments = assignmentsData.filter(a => a.status === 'pending').length;

            setStats({
                assignments: {
                    pending: pendingAssignments,
                    total: assignmentsData.length
                },
                attendance: { rate: 92 },
                averageScore: { score: 96 },
                dayStreak: 0,
                totalXP: 20,
                quizzes: { available: quizzesData.length },
                flashcards: { sets: flashcardsData.length }
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleNavigation = useCallback((path) => {
        navigate(path);
    }, [navigate]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">
                    Welcome back, {user?.first_name || 'Student'}! 👋
                </h1>
                <p className="text-sm text-[#6C757D] mt-1">
                    Manage your classes and track your progress
                </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={ClipboardList}
                    label="Pending Assignments"
                    value={`${stats.assignments.pending}/${stats.assignments.total}`}
                    badge={stats.assignments.pending}
                    badgeColor="red"
                />
                <MetricCard
                    icon={CheckCircle}
                    label="Attendance Rate"
                    value={`${stats.attendance.rate}%`}
                    badge={stats.attendance.rate}
                    badgeColor="green"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Average Score"
                    value={`${stats.averageScore.score}%`}
                    badge={stats.averageScore.score}
                    badgeColor="blue"
                />
                <MetricCard
                    icon={Flame}
                    label="Day Streak"
                    value={`${stats.dayStreak} days`}
                    badge={stats.dayStreak}
                    badgeColor="cyan"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Study Tools */}
                    <SectionCard title="Study Tools" action="View All">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ListCard
                                title="Quizzes"
                                subtitle={`${stats.quizzes.available} available`}
                                onClick={() => handleNavigation('/student/quizzes')}
                            />
                            <ListCard
                                title="Flashcards"
                                subtitle={`${stats.flashcards.sets} sets`}
                                onClick={() => handleNavigation('/student/flashcards')}
                            />
                        </div>
                    </SectionCard>

                    {/* Recent Activity */}
                    <SectionCard title="Recent Lectures" action="View All">
                        <div className="space-y-3">
                            <ListCard
                                title="Mathematics - Lesson 2"
                                subtitle="Chapter 2 - Topic 2: Fundamentals"
                                status="completed"
                                onClick={() => handleNavigation('/student/notes')}
                            />
                            <ListCard
                                title="Science - Lab Work"
                                subtitle="Chapter 3 - Experiments"
                                status="in-progress"
                                onClick={() => handleNavigation('/student/notes')}
                            />
                        </div>
                    </SectionCard>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <SectionCard title="Quick Actions">
                        <div className="space-y-3">
                            <ActionButton
                                icon={BookOpen}
                                label="Browse Lectures"
                                onClick={() => handleNavigation('/student/notes')}
                                variant="primary"
                            />
                            <ActionButton
                                icon={ClipboardList}
                                label="View Assignments"
                                onClick={() => handleNavigation('/student/assignments')}
                                variant="primary"
                            />
                            <ActionButton
                                icon={Gamepad2}
                                label="Practice Games"
                                onClick={() => handleNavigation('/student/games')}
                                variant="primary"
                            />
                            <ActionButton
                                icon={Trophy}
                                label="View Leaderboard"
                                onClick={() => handleNavigation('/student/leaderboard')}
                                variant="secondary"
                            />
                        </div>
                    </SectionCard>

                    {/* Today's Schedule */}
                    <SectionCard title="Today's Schedule">
                        <p className="text-sm text-[#6C757D] text-center py-8">
                            No classes scheduled today
                        </p>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
