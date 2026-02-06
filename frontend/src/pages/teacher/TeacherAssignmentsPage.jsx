import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Calendar,
    Users,
    Sparkles,
    Eye,
    BarChart3,
    Zap,
    X,
    Edit3
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { AIAssignmentWizard } from '../../components/teacher/assignments/AIAssignmentWizard';
import { GradingInterface } from '../../components/teacher/assignments/GradingInterface';
import { BatchGradingView } from '../../components/teacher/assignments/BatchGradingView';
import { ManualAssignmentCreator } from '../../components/teacher/assignments/ManualAssignmentCreator';

export function TeacherAssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [assignmentStats, setAssignmentStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [showManualCreator, setShowManualCreator] = useState(false);
    const [showCreationChoice, setShowCreationChoice] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showGrading, setShowGrading] = useState(false);
    const [showBatchGrading, setShowBatchGrading] = useState(false);
    const [submissions, setSubmissions] = useState([]);

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
            const response = await api.get('/assignments/assignments/');
            const assignmentData = response.data.results || response.data || [];

            // Fetch stats for each assignment
            const statsPromises = assignmentData.map(async (assignment) => {
                try {
                    const analyticsRes = await api.get(`/assignments/assignments/${assignment.id}/analytics/`);
                    return {
                        id: assignment.id,
                        ...analyticsRes.data
                    };
                } catch (err) {
                    return {
                        id: assignment.id,
                        total_students: 0,
                        submitted: 0,
                        graded: 0,
                        pending: 0
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
            const totalNeedsGrading = assignmentStatsArray.reduce((sum, stat) => sum + (stat.submitted - stat.graded || 0), 0);
            const totalGraded = assignmentStatsArray.reduce((sum, stat) => sum + (stat.graded || 0), 0);

            setStats({
                total,
                needsGrading: totalNeedsGrading,
                graded: totalGraded,
                avgScore: 0
            });
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAssignment = async (assignment) => {
        setSelectedAssignment(assignment);
        try {
            const response = await api.get(`/assignments/submissions/?assignment=${assignment.id}`);
            setSubmissions(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to load submissions');
        }
    };

    const handleGradeSubmission = (submission) => {
        setSelectedSubmission(submission);
        setShowGrading(true);
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const stat = assignmentStats[assignment.id] || {};
        const needsGrading = (stat.submitted || 0) - (stat.graded || 0);

        const matchesFilter = filter === 'all' ||
            (filter === 'needsGrading' && needsGrading > 0) ||
            (filter === 'graded' && stat.graded > 0 && needsGrading === 0);
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        Assignments
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Create and manage student assignments with AI
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreationChoice(true)}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                </Button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="glass-card border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Needs Grading</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.needsGrading}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Graded</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.graded}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Avg Score</p>
                                <p className="text-2xl font-bold text-violet-600">{stats.avgScore}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-violet-500 hover:bg-violet-600 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filter === 'needsGrading' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('needsGrading')}
                        className={filter === 'needsGrading' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                    >
                        Needs Grading ({stats.needsGrading})
                    </Button>
                    <Button
                        variant={filter === 'graded' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('graded')}
                        className={filter === 'graded' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                    >
                        Graded ({stats.graded})
                    </Button>
                </div>
            </motion.div>

            {/* Assignments List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="glass-card border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading assignments...</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? 'No assignments found' : 'No assignments yet'}
                                </h3>
                                <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                                    {searchTerm
                                        ? 'Try adjusting your search terms'
                                        : 'Create your first assignment with AI in seconds'
                                    }
                                </p>
                                {!searchTerm && (
                                    <Button
                                        onClick={() => setShowCreationChoice(true)}
                                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Assignment
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filteredAssignments.map((assignment, index) => {
                                        const stat = assignmentStats[assignment.id] || {};
                                        const needsGrading = (stat.submitted || 0) - (stat.graded || 0);

                                        return (
                                            <motion.div
                                                key={assignment.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() => handleViewAssignment(assignment)}
                                                className="p-4 rounded-xl bg-white/60 border border-gray-200 hover:bg-white/80 hover:shadow-md transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${assignment.is_ai_generated
                                                            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                                                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                            }`}>
                                                            {assignment.is_ai_generated ? (
                                                                <Sparkles className="w-6 h-6 text-white" />
                                                            ) : (
                                                                <FileText className="w-6 h-6 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold text-gray-900">{assignment.title}</p>
                                                                {assignment.is_ai_generated && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        <Zap className="w-3 h-3 mr-1" />
                                                                        AI Generated
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Due: {formatDate(assignment.due_date)}
                                                                </span>
                                                                <span>•</span>
                                                                <span>{assignment.total_marks} marks</span>
                                                                {stat.total_students > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="w-3 h-3" />
                                                                            {stat.submitted}/{stat.total_students} submitted
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {needsGrading > 0 ? (
                                                            <Badge variant="warning">
                                                                {needsGrading} need grading
                                                            </Badge>
                                                        ) : stat.graded > 0 ? (
                                                            <Badge variant="success">
                                                                All graded
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                No submissions
                                                            </Badge>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-white/70 hover:text-white hover:bg-white/10"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Assignment Detail View */}
            <AnimatePresence>
                {selectedAssignment && (
                    <AssignmentDetailView
                        assignment={selectedAssignment}
                        submissions={submissions}
                        onClose={() => setSelectedAssignment(null)}
                        onGradeSubmission={handleGradeSubmission}
                        onBatchGrade={() => setShowBatchGrading(true)}
                        onRefresh={fetchAssignments}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {/* Creation Choice Modal */}
                {showCreationChoice && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="glass-card border-0 shadow-2xl">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-2xl font-bold text-white">Create New Assignment</h2>
                                        <Button variant="ghost" size="icon" onClick={() => setShowCreationChoice(false)} className="text-white/70 hover:text-white">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button
                                            onClick={() => {
                                                setShowCreationChoice(false);
                                                setShowManualCreator(true);
                                            }}
                                            className="flex flex-col items-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 transition-all group text-center"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Edit3 className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Create Manually</h3>
                                            <p className="text-white/60">
                                                Write your own questions, instructions, and grading criteria from scratch.
                                            </p>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowCreationChoice(false);
                                                setShowWizard(true);
                                            }}
                                            className="flex flex-col items-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 transition-all group text-center"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-8 h-8 text-violet-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Generate with AI</h3>
                                            <p className="text-white/60">
                                                Auto-create assignments from your lecture content in seconds.
                                            </p>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                {showWizard && (
                    <AIAssignmentWizard
                        onClose={() => setShowWizard(false)}
                        onSuccess={fetchAssignments}
                    />
                )}

                {showManualCreator && (
                    <ManualAssignmentCreator
                        onClose={() => setShowManualCreator(false)}
                        onSuccess={fetchAssignments}
                    />
                )}

                {showGrading && selectedSubmission && (
                    <GradingInterface
                        submission={selectedSubmission}
                        assignment={selectedAssignment}
                        onClose={() => setShowGrading(false)}
                        onGraded={() => {
                            fetchAssignments();
                            handleViewAssignment(selectedAssignment);
                        }}
                    />
                )}

                {showBatchGrading && selectedAssignment && (
                    <BatchGradingView
                        submissions={submissions}
                        assignment={selectedAssignment}
                        onClose={() => setShowBatchGrading(false)}
                        onGraded={() => {
                            fetchAssignments();
                            handleViewAssignment(selectedAssignment);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Assignment Detail View Component
function AssignmentDetailView({ assignment, submissions, onClose, onGradeSubmission, onBatchGrade, onRefresh }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
                <Card className="glass-card border-0 shadow-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{assignment.title}</h2>
                                <p className="text-sm text-white/60 mt-1">{assignment.description}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {submissions.filter(s => s.status === 'submitted').length > 0 && (
                            <div className="mb-4">
                                <Button
                                    onClick={onBatchGrade}
                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Batch Grade with AI
                                </Button>
                            </div>
                        )}

                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                            {submissions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/60">No submissions yet</p>
                                </div>
                            ) : (
                                submissions.map((submission) => (
                                    <div
                                        key={submission.id}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-white">
                                                    {submission.student?.first_name} {submission.student?.last_name}
                                                </p>
                                                <p className="text-sm text-white/60">
                                                    {submission.submitted_at
                                                        ? new Date(submission.submitted_at).toLocaleString()
                                                        : 'Not submitted'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={submission.status === 'graded' ? 'success' : 'warning'}>
                                                    {submission.status}
                                                </Badge>
                                                {submission.status === 'submitted' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onGradeSubmission(submission)}
                                                        className="bg-violet-500 hover:bg-violet-600"
                                                    >
                                                        Grade
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
