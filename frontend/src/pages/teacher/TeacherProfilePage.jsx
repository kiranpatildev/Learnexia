import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    User,
    Mail,
    Calendar,
    BookOpen,
    Users,
    Trophy,
    Save,
    X,
    AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function TeacherProfilePage() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });

    const [stats, setStats] = useState({
        totalLectures: 0,
        totalStudents: 0,
        totalQuizzes: 0,
        averageScore: 0,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const statsRes = await api.get('/performance/teacher-stats/');
            if (statsRes.data) {
                setStats({
                    totalLectures: statsRes.data.total_lectures || 0,
                    totalStudents: statsRes.data.total_students || 0,
                    totalQuizzes: statsRes.data.total_quizzes || 0,
                    averageScore: statsRes.data.average_score || 0,
                });
            }
        } catch (err) {
            console.log('Stats not available:', err.message);
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
        return formData.email?.[0]?.toUpperCase() || 'T';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
                <p className="text-sm text-slate-600 mt-1">Manage your account and view your teaching stats</p>
            </div>

            {/* Success Message */}
            {success && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-emerald-900">
                            <Trophy className="w-5 h-5" />
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
                <div className="lg:col-span-2">
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
                                    <Badge variant="secondary" className="mt-1">Teacher</Badge>
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
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* Teaching Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Teaching Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Lectures</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.totalLectures}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Students</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.totalStudents}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Quizzes</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.totalQuizzes}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Class Avg Score</p>
                                    <p className="text-lg font-semibold text-slate-900">{stats.averageScore}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Lectures
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                View Students
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Trophy className="w-4 h-4 mr-2" />
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
