import { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    ClipboardCheck,
    AlertCircle,
    Calendar,
    CheckCircle,
    Sparkles,
    Clock,
    FileText,
    TrendingUp,
    ArrowRight
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
        published: 'bg-[#4CAF50] text-white',
        pending: 'bg-[#FF9800] text-white',
        draft: 'bg-[#6C757D] text-white',
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

export function TeacherDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        todayAttendance: 0,
        pendingGrading: 0,
        lecturesThisWeek: 0,
        studentAlerts: 0,
    });
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const [lecturesRes, assignmentsRes, incidentsRes] = await Promise.all([
                api.get('/lectures/lectures/', { params: { ordering: '-created_at', page_size: 5 } }).catch(() => ({ data: [] })),
                api.get('/assignments/assignments/').catch(() => ({ data: [] })),
                api.get('/behavior/incidents/', { params: { status: 'pending' } }).catch(() => ({ data: [] }))
            ]);

            const lectureData = lecturesRes.data.results || lecturesRes.data || [];
            const assignments = assignmentsRes.data.results || assignmentsRes.data || [];
            const incidents = incidentsRes.data.results || incidentsRes.data || [];

            setLectures(lectureData);
            setStats({
                todayAttendance: 0,
                pendingGrading: assignments.length,
                lecturesThisWeek: lectureData.length,
                studentAlerts: incidents.length,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2C3E50]">Teacher Dashboard</h1>
                    <p className="text-sm text-[#6C757D] mt-1">
                        Manage your classes and track student progress
                    </p>
                </div>
                <ActionButton
                    icon={Sparkles}
                    label="AI Features"
                    onClick={() => handleNavigation('/teacher/ai-features')}
                    variant="primary"
                />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={BookOpen}
                    label="Lectures This Week"
                    value={stats.lecturesThisWeek}
                    badge={stats.lecturesThisWeek}
                    badgeColor="blue"
                />
                <MetricCard
                    icon={Calendar}
                    label="Today's Attendance"
                    value={`${stats.todayAttendance}`}
                    badge={stats.todayAttendance}
                    badgeColor="cyan"
                />
                <MetricCard
                    icon={ClipboardCheck}
                    label="Pending Grading"
                    value={stats.pendingGrading}
                    badge={stats.pendingGrading}
                    badgeColor="red"
                />
                <MetricCard
                    icon={AlertCircle}
                    label="Student Alerts"
                    value={stats.studentAlerts}
                    badge={stats.studentAlerts}
                    badgeColor="gray"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Lectures */}
                    <SectionCard title="Recent Lectures" action="View All">
                        <div className="space-y-3">
                            {lectures.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="w-12 h-12 text-[#6C757D] mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-[#6C757D]">No lectures yet</p>
                                    <button
                                        onClick={() => handleNavigation('/teacher/lectures')}
                                        className="mt-4 text-[#2D7FF9] text-sm font-semibold hover:underline"
                                    >
                                        Create your first lecture
                                    </button>
                                </div>
                            ) : (
                                lectures.slice(0, 5).map((lecture) => (
                                    <ListCard
                                        key={lecture.id}
                                        title={lecture.title}
                                        subtitle={`${lecture.chapter || 'General'} • ${lecture.topic || 'No topic'}`}
                                        status={lecture.status}
                                        onClick={() => handleNavigation(`/teacher/lectures/${lecture.id}`)}
                                    />
                                ))
                            )}
                        </div>
                    </SectionCard>

                    {/* Pending Tasks */}
                    <SectionCard title="Pending Tasks" action="All">
                        <div className="space-y-3">
                            <p className="text-sm text-[#6C757D] text-center py-4">
                                No pending tasks
                            </p>
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
                                label="Manage Lectures"
                                onClick={() => handleNavigation('/teacher/lectures')}
                                variant="primary"
                            />
                            <ActionButton
                                icon={Sparkles}
                                label="AI Features"
                                onClick={() => handleNavigation('/teacher/ai-features')}
                                variant="primary"
                            />
                            <ActionButton
                                icon={FileText}
                                label="Create Assignment"
                                onClick={() => handleNavigation('/teacher/assignments')}
                                variant="primary"
                            />
                            <ActionButton
                                icon={Users}
                                label="View Students"
                                onClick={() => handleNavigation('/teacher/students')}
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
