import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    Users,
    Search,
    Trophy,
    TrendingUp,
    Mail
} from 'lucide-react';

export function TeacherStudentsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
                <p className="text-sm text-slate-600 mt-1">View and manage your students</p>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Students</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Active</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Performance</p>
                                <p className="text-2xl font-semibold text-slate-900">0%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State */}
            <Card>
                <CardContent className="py-16">
                    <div className="text-center">
                        <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No students yet</h3>
                        <p className="text-sm text-slate-600 max-w-md mx-auto">
                            Students will appear here once they register and join your classes
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
