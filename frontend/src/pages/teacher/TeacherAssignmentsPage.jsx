import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
    FileText,
    Plus,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Users
} from 'lucide-react';

export function TeacherAssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
                    <p className="text-sm text-slate-600 mt-1">Create and manage student assignments</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All (0)
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                    >
                        Pending Grading
                    </Button>
                    <Button
                        variant={filter === 'graded' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('graded')}
                    >
                        Graded
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Pending</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Graded</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Score</p>
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
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No assignments yet</h3>
                        <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                            Create your first assignment to get started
                        </p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Assignment
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
