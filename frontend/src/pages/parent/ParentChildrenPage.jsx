import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
    Users,
    TrendingUp,
    Calendar,
    Trophy,
    BookOpen,
    Mail,
    Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ParentChildrenPage() {
    const navigate = useNavigate();

    // Mock data - will be replaced with real API
    const children = [
        {
            id: 1,
            name: 'Emma Johnson',
            grade: 'Grade 4A',
            email: 'emma.j@student.com',
            phone: '123-456-7890',
            attendance: 95,
            averageScore: 88,
            rank: 5,
            totalXP: 1250,
            level: 12,
        },
    ];

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">My Children</h1>
                <p className="text-sm text-slate-600 mt-1">View and manage your children's profiles</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Children</p>
                                <p className="text-2xl font-semibold text-slate-900">{children.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Attendance</p>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {Math.round(children.reduce((acc, c) => acc + c.attendance, 0) / children.length)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Score</p>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {Math.round(children.reduce((acc, c) => acc + c.averageScore, 0) / children.length)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total XP</p>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {children.reduce((acc, c) => acc + c.totalXP, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Children List */}
            <div className="grid grid-cols-1 gap-6">
                {children.map((child) => (
                    <Card key={child.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                                            {getInitials(child.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">{child.name}</h2>
                                        <p className="text-sm text-slate-600">{child.grade}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="secondary">Level {child.level}</Badge>
                                            <Badge variant="secondary">{child.totalXP} XP</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={() => navigate('/parent/performance')}>
                                    View Performance
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                        <p className="text-sm font-medium text-purple-900">Level</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-purple-700">{child.level}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-6 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{child.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{child.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Banner */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Managing Multiple Children</p>
                            <p className="text-xs text-blue-700 mt-1">
                                You can view detailed performance reports, attendance history, and communicate with teachers for each child.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
