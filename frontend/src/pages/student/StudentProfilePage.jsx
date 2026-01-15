import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User, Mail, Calendar, Award, BookOpen, Trophy, AlertCircle, Save, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function StudentProfilePage() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });

    const [stats, setStats] = useState({
        totalXP: 0,
        level: 0,
        lecturesAttended: 0,
        quizzesCompleted: 0,
        averageScore: 0,
        currentStreak: 0,
        achievements: [],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
        fetchProfileData();
    }, [user]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch gamification stats
            try {
                const statsRes = await api.get('/gamification/student-stats/');
                if (statsRes.data) {
                    setStats({
                        totalXP: statsRes.data.total_xp || 0,
                        level: statsRes.data.level || Math.floor((statsRes.data.total_xp || 0) / 100),
                        lecturesAttended: statsRes.data.lectures_attended || 0,
                        quizzesCompleted: statsRes.data.quizzes_completed || 0,
                        averageScore: statsRes.data.average_score || 0,
                        currentStreak: statsRes.data.current_streak || 0,
                        achievements: statsRes.data.achievements || [],
                    });
                }
            } catch (err) {
                console.log('Stats not available:', err.message);
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await api.patch(`/accounts/users/${user.id}/`, formData);

            setSuccess(true);
            setIsEditing(false);

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
        });
        setIsEditing(false);
        setError(null);
    };

    const getInitials = () => {
        if (formData.first_name && formData.last_name) {
            return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
        }
        return formData.email?.[0]?.toUpperCase() || 'U';
    };

    const defaultAchievements = [
        { id: 1, name: 'Quick Learner', description: 'Complete 10 quizzes', earned: stats.quizzesCompleted >= 10 },
        { id: 2, name: 'Perfect Score', description: 'Get 100% on a quiz', earned: stats.averageScore === 100 },
        { id: 3, name: 'Dedicated Student', description: '7-day streak', earned: stats.currentStreak >= 7 },
        { id: 4, name: 'Master Student', description: 'Reach level 15', earned: stats.level >= 15 },
        { id: 5, name: 'Consistent Learner', description: 'Attend 20 lectures', earned: stats.lecturesAttended >= 20 },
        { id: 6, name: 'High Achiever', description: 'Maintain 90%+ average', earned: stats.averageScore >= 90 },
    ];

    const achievements = stats.achievements.length > 0 ? stats.achievements : defaultAchievements;

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
                <p className="text-sm text-slate-600 mt-1">Manage your account and view your progress</p>
            </div>

            {/* Success Message */}
            {success && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-emerald-900">
                            <Award className="w-5 h-5" />
                            <p>Profile updated successfully!</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-900">
                            <AlertCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Personal Information</CardTitle>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <User className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="w-20 h-20">
                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {formData.first_name} {formData.last_name}
                                    </h2>
                                    <p className="text-sm text-slate-600">{formData.email}</p>
                                    <Badge variant="secondary" className="mt-1">Student</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Member since {new Date(user?.date_joined || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`p-4 rounded-lg border ${achievement.earned
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : 'border-slate-200 bg-slate-50 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${achievement.earned ? 'bg-emerald-100' : 'bg-slate-200'
                                                } flex items-center justify-center flex-shrink-0`}>
                                                <Award className={`w-5 h-5 ${achievement.earned ? 'text-emerald-600' : 'text-slate-400'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h3 className={`font-medium ${achievement.earned ? 'text-emerald-900' : 'text-slate-600'
                                                    }`}>
                                                    {achievement.name}
                                                </h3>
                                                <p className={`text-sm ${achievement.earned ? 'text-emerald-700' : 'text-slate-500'
                                                    }`}>
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* XP & Level */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                    <Trophy className="w-12 h-12 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{stats.totalXP}</p>
                                <p className="text-sm text-slate-600">Total XP</p>
                                <Badge variant="secondary" className="mt-2">Level {stats.level}</Badge>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Next Level</span>
                                        <span className="font-medium text-slate-900">
                                            {((stats.level + 1) * 100) - stats.totalXP} XP
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{ width: `${(stats.totalXP % 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Lectures Attended</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.lecturesAttended}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Quizzes Completed</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.quizzesCompleted}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Average Score</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.averageScore}%</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <span className="text-lg">🔥</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Current Streak</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.currentStreak} days</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
