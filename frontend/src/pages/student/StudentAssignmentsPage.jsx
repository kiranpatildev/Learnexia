import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Calendar } from 'lucide-react';
import { assignmentService } from '../../services/student.service';

export function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        submitted: 0,
        graded: 0,
        averageScore: 0,
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await assignmentService.getAssignments();
            const assignmentData = response.results || response || [];

            setAssignments(assignmentData);

            // Calculate stats
            const pending = assignmentData.filter(a => !a.submitted).length;
            const submitted = assignmentData.filter(a => a.submitted && a.status !== 'graded').length;
            const graded = assignmentData.filter(a => a.status === 'graded').length;
            const avgScore = graded > 0
                ? Math.round(assignmentData.filter(a => a.status === 'graded').reduce((acc, a) => acc + (a.score || 0), 0) / graded)
                : 0;

            setStats({
                total: assignmentData.length,
                pending,
                submitted,
                graded,
                averageScore: avgScore,
            });
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError('Failed to load assignments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusBadge = (assignment) => {
        if (assignment.status === 'graded') {
            const scorePercent = (assignment.score / assignment.max_score) * 100;
            return (
                <Badge variant={scorePercent >= 70 ? 'success' : 'warning'}>
                    Graded: {Math.round(scorePercent)}%
                </Badge>
            );
        }
        if (assignment.submitted) {
            return <Badge variant="secondary">Submitted</Badge>;
        }
        const daysLeft = getDaysUntilDue(assignment.due_date);
        if (daysLeft < 0) {
            return <Badge variant="destructive">Overdue</Badge>;
        }
        if (daysLeft <= 2) {
            return <Badge variant="warning">Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };

    const filteredAssignments = assignments.filter(assignment => {
        if (filter === 'pending') return !assignment.submitted;
        if (filter === 'submitted') return assignment.submitted && assignment.status !== 'graded';
        if (filter === 'graded') return assignment.status === 'graded';
        return true;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
                    <p className="text-sm text-slate-600 mt-1">Track your homework and submissions</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All ({assignments.length})
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </Button>
                    <Button
                        variant={filter === 'submitted' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('submitted')}
                    >
                        Submitted ({stats.submitted})
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

            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-900">
                                <AlertCircle className="w-5 h-5" />
                                <p>{error}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchAssignments}>
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total</p>
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
                                <p className="text-sm text-slate-600">Pending</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.pending}</p>
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
                                <p className="text-2xl font-semibold text-slate-900">{stats.graded}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Score</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.averageScore}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assignments List */}
            {filteredAssignments.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title={assignments.length === 0 ? "No assignments yet" : "No assignments found"}
                    description={
                        assignments.length === 0
                            ? "Assignments will appear here once your teacher creates them"
                            : filter === 'pending'
                                ? "You're all caught up! No pending assignments."
                                : filter === 'submitted'
                                    ? "No assignments awaiting grading"
                                    : "You haven't received any graded assignments yet"
                    }
                    action={
                        assignments.length > 0 && filter !== 'all' ? (
                            <Button variant="outline" onClick={() => setFilter('all')}>
                                View All Assignments
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAssignments.map((assignment) => {
                        const daysLeft = getDaysUntilDue(assignment.due_date);
                        const isOverdue = daysLeft < 0 && !assignment.submitted;

                        return (
                            <Card key={assignment.id} className={`hover:shadow-lg transition-shadow ${isOverdue ? 'border-red-200' : ''
                                }`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-lg ${assignment.status === 'graded' ? 'bg-emerald-100' :
                                                        assignment.submitted ? 'bg-blue-100' :
                                                            isOverdue ? 'bg-red-100' : 'bg-amber-100'
                                                    } flex items-center justify-center`}>
                                                    {assignment.status === 'graded' ? (
                                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                    ) : assignment.submitted ? (
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Clock className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                                                    <p className="text-sm text-slate-600">
                                                        {assignment.subject || assignment.class_name || 'Class'}
                                                    </p>
                                                </div>
                                            </div>

                                            {assignment.description && (
                                                <p className="text-sm text-slate-600 mb-3">{assignment.description}</p>
                                            )}

                                            <div className="flex items-center gap-4 flex-wrap">
                                                {getStatusBadge(assignment)}
                                                <span className="text-sm text-slate-600 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                </span>
                                                <span className="text-sm text-slate-600">
                                                    Max Score: {assignment.max_score}
                                                </span>
                                            </div>

                                            {assignment.status === 'graded' && assignment.feedback && (
                                                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                    <p className="text-sm font-medium text-emerald-900">Teacher Feedback:</p>
                                                    <p className="text-sm text-emerald-700 mt-1">{assignment.feedback}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4">
                                            {!assignment.submitted ? (
                                                <Button>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Submit
                                                </Button>
                                            ) : assignment.status === 'graded' ? (
                                                <Button variant="outline">
                                                    View Details
                                                </Button>
                                            ) : (
                                                <Button variant="outline" disabled>
                                                    Awaiting Grade
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
