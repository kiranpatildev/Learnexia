import React, { memo } from 'react';
import { mockUser, mockBadges } from '@/services/mockData';
import {
    Flame,
    Zap,
    ClipboardList,
    CheckCircle,
    ArrowRight,
    Trophy,
    BookOpen,
    Gamepad2,
    Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ============================================
// OPTIMIZED COMPONENTS (Memoized)
// ============================================

const StatBadge = memo(({ icon: Icon, value, label, variant = 'default' }) => {
    const variants = {
        streak: 'bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 border-orange-100',
        xp: 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 border-purple-100',
        default: 'bg-white/80 text-slate-600 border-slate-200'
    };

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm shadow-sm",
            variants[variant]
        )}>
            <Icon size={18} strokeWidth={2.5} />
            <span className="font-semibold text-sm">{value} {label}</span>
        </div>
    );
});

const PerformanceCard = memo(({ icon: Icon, title, value, subtitle, linkTo, variant = 'blue' }) => {
    const variants = {
        blue: {
            bg: 'from-blue-50 to-cyan-50',
            icon: 'bg-blue-100 text-blue-600',
            text: 'text-blue-600'
        },
        green: {
            bg: 'from-emerald-50 to-teal-50',
            icon: 'bg-emerald-100 text-emerald-600',
            text: 'text-emerald-600'
        }
    };

    const colors = variants[variant];

    return (
        <Link to={linkTo} className="group block">
            <div className={cn(
                "relative p-6 rounded-3xl bg-gradient-to-br border border-white/60",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "bg-white/70 backdrop-blur-sm"
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                    colors.icon
                )}>
                    <Icon size={24} strokeWidth={2} />
                </div>

                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    {title}
                </p>

                <p className="text-3xl font-bold text-slate-900 mb-1">
                    {value}
                </p>

                {subtitle && (
                    <p className="text-sm text-slate-500 mb-3">{subtitle}</p>
                )}

                <div className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold",
                    colors.text,
                    "group-hover:gap-2 transition-all"
                )}>
                    View Details <ArrowRight size={14} />
                </div>
            </div>
        </Link>
    );
});

const ActionCard = memo(({ icon: Icon, title, description, count, linkTo, variant = 'indigo' }) => {
    const variants = {
        indigo: 'from-indigo-500 to-purple-600',
        rose: 'from-rose-500 to-pink-600',
        emerald: 'from-emerald-500 to-teal-600',
        amber: 'from-amber-500 to-orange-600',
        violet: 'from-violet-500 to-purple-600'
    };

    return (
        <Link to={linkTo} className="group block">
            <div className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg",
                        `bg-gradient-to-br ${variants[variant]}`
                    )}>
                        {count}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-0.5 group-hover:text-slate-700 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
});

const QuickActionButton = memo(({ icon: Icon, label, linkTo, variant = 'emerald' }) => {
    const variants = {
        emerald: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
        amber: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
        violet: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
    };

    return (
        <Link to={linkTo} className="flex-1 min-w-[180px]">
            <button className={cn(
                "w-full h-14 rounded-xl bg-gradient-to-r text-white font-semibold",
                "shadow-lg hover:shadow-xl transition-all duration-200",
                "flex items-center justify-center gap-2",
                variants[variant]
            )}>
                <Icon size={20} strokeWidth={2} />
                {label}
            </button>
        </Link>
    );
});

const AchievementCard = memo(({ badge }) => (
    <div className={cn(
        "p-4 rounded-2xl border transition-all duration-200",
        badge.is_locked
            ? "bg-slate-50/50 border-slate-200 opacity-60"
            : "bg-white/70 border-white/60 hover:shadow-sm"
    )}>
        <div className="flex items-start gap-3">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                badge.is_locked ? "bg-slate-100 grayscale" : "bg-gradient-to-br from-amber-50 to-orange-50"
            )}>
                {badge.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                        "font-semibold text-sm",
                        badge.is_locked ? "text-slate-400" : "text-slate-900"
                    )}>
                        {badge.name}
                    </h4>
                    {!badge.is_locked && (
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {badge.description}
                </p>
            </div>
        </div>
    </div>
));

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export function Dashboard() {
    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">
                        Welcome back, {mockUser.first_name}! 👋
                    </h1>
                    <p className="text-slate-600">Ready to continue your learning journey?</p>
                </div>

                <div className="flex items-center gap-3">
                    <StatBadge
                        icon={Flame}
                        value={mockUser.current_streak}
                        label="day streak"
                        variant="streak"
                    />
                    <StatBadge
                        icon={Zap}
                        value={mockUser.total_xp}
                        label="xp"
                        variant="xp"
                    />
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column - Main Content */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Performance Cards */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PerformanceCard
                                icon={ClipboardList}
                                title="Pending Assignments"
                                value="0 of 0"
                                linkTo="/student/assignments"
                                variant="blue"
                            />
                            <PerformanceCard
                                icon={CheckCircle}
                                title="Attendance Rate"
                                value="92%"
                                subtitle="this month"
                                linkTo="/student/attendance"
                                variant="green"
                            />
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                        <div className="flex flex-wrap gap-3">
                            <QuickActionButton
                                icon={BookOpen}
                                label="Browse Lectures"
                                linkTo="/student/notes"
                                variant="emerald"
                            />
                            <QuickActionButton
                                icon={ClipboardList}
                                label="View Assignments"
                                linkTo="/student/assignments"
                                variant="amber"
                            />
                            <QuickActionButton
                                icon={Gamepad2}
                                label="Practice Games"
                                linkTo="/student/games"
                                variant="violet"
                            />
                        </div>
                    </section>

                    {/* Study Tools */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Study Tools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ActionCard
                                icon={Brain}
                                title="Quizzes"
                                description="Test your knowledge"
                                count="3"
                                linkTo="/student/quizzes"
                                variant="indigo"
                            />
                            <ActionCard
                                icon={Brain}
                                title="Flashcards"
                                description="Review key concepts"
                                count="2"
                                linkTo="/student/flashcards"
                                variant="rose"
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column - Achievements */}
                <div className="xl:col-span-1">
                    <div className="sticky top-6 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-900">Achievements</h2>
                            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                                <Trophy size={18} className="text-amber-600" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-5">
                            {mockBadges.slice(0, 3).map((badge) => (
                                <AchievementCard key={badge.id} badge={badge} />
                            ))}
                        </div>

                        <Link to="/student/leaderboard" className="group block">
                            <button className="w-full py-3 rounded-xl border-2 border-purple-200 text-purple-600 font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                                View All Achievements
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
