import { useState, useEffect } from 'react';
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
    Users,
    Upload
} from 'lucide-react';
import api from '../../services/api';

export function TeacherAssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [assignmentStats, setAssignmentStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        needsGrading: 0,
        graded: 0,
        avgScore: 0
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);

            // Fetch assignments
            const response = await api.get('/assignments/assignments/');
            const assignmentData = response.data.results || response.data || [];

            // Fetch submissions for each assignment to get accurate counts
            const statsPromises = assignmentData.map(async (assignment) => {
                try {
                    const submissionsRes = await api.get(`/assignments/assignments/${assignment.id}/submissions/`);
                    const submissions = submissionsRes.data.results || submissionsRes.data || [];

                    const totalSubmissions = submissions.length;
                    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
                    const needsGrading = totalSubmissions - gradedSubmissions;

                    return {
                        id: assignment.id,
                        totalSubmissions,
                        gradedSubmissions,
                        needsGrading
                    };
                } catch (err) {
                    console.error(`Error fetching submissions for assignment ${assignment.id}:`, err);
                    return {
                        id: assignment.id,
                        totalSubmissions: 0,
                        gradedSubmissions: 0,
                        needsGrading: 0
                    };
                }
            });

            const assignmentStatsArray = await Promise.all(statsPromises);
            const statsMap = {};
            assignmentStatsArray.forEach(stat => {
                statsMap[stat.id] = stat;
            });

            setAssignments(assignmentData);
            setAssignmentStats(statsMap);

            // Calculate overall stats
            const total = assignmentData.length;
            const totalNeedsGrading = assignmentStatsArray.reduce((sum, stat) => sum + stat.needsGrading, 0);
            const totalGraded = assignmentStatsArray.reduce((sum, stat) => sum + stat.gradedSubmissions, 0);

            setStats({
                total,
                needsGrading: totalNeedsGrading,
                graded: totalGraded,
                avgScore: 0 // Would need to calculate from submissions
            });
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const stat = assignmentStats[assignment.id] || {};

        const matchesFilter = filter === 'all' ||
            (filter === 'needsGrading' && stat.needsGrading > 0) ||
            (filter === 'graded' && stat.gradedSubmissions > 0 && stat.needsGrading === 0);
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusBadge = (assignment) => {
        const stat = assignmentStats[assignment.id];
        if (!stat) return <Badge variant="secondary">No submissions</Badge>;

        if (stat.totalSubmissions === 0) {
            return <Badge variant="secondary">No submissions</Badge>;
        }

        if (stat.needsGrading > 0) {
            return <Badge variant="warning">{stat.needsGrading} need grading</Badge>;
        }

        return <Badge variant="success">All graded</Badge>;
    };

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
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filter === 'needsGrading' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('needsGrading')}
                    >
                        Needs Grading ({stats.needsGrading})
                    </Button>
                    <Button
                        variant={filter === 'graded' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('graded')}
                    >
                        Graded ({stats.graded})
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
                                <p className="text-sm text-slate-600">Total Assignments</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
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
                                <p className="text-sm text-slate-600">Needs Grading</p>
                                <p className="text-2xl font-semibold text-amber-600">{stats.needsGrading}</p>
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
                                <p className="text-2xl font-semibold text-emerald-600">{stats.graded}</p>
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
                                <p className="text-2xl font-semibold text-slate-900">{stats.avgScore}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assignments List */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">Loading assignments...</p>
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {searchTerm ? 'No assignments found' : 'No assignments yet'}
                            </h3>
                            <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Create your first assignment to get started'
                                }
                            </p>
                            {!searchTerm && (
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Assignment
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAssignments.map((assignment) => {
                                const stat = assignmentStats[assignment.id] || {};
                                return (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{assignment.title}</p>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Due: {formatDate(assignment.due_date)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{assignment.total_points} points</span>
                                                    {stat.totalSubmissions > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Upload className="w-3 h-3" />
                                                                {stat.totalSubmissions} submission{stat.totalSubmissions !== 1 ? 's' : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(assignment)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
