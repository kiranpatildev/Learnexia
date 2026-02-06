import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
    FileText,
    Search,
    Calendar,
    Clock,
    CheckCircle,
    Upload,
    AlertCircle,
    Eye,
    Award,
    TrendingUp,
    X,
    Loader2,
    Send,
    File,
    BookOpen
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export function StudentAssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showSubmission, setShowSubmission] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        submitted: 0,
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

            // Fetch submissions for each assignment
            const submissionsMap = {};
            for (const assignment of assignmentData) {
                try {
                    const subRes = await api.get(`/assignments/submissions/?assignment=${assignment.id}`);
                    const subs = subRes.data.results || subRes.data || [];
                    if (subs.length > 0) {
                        submissionsMap[assignment.id] = subs[0];
                    }
                } catch (err) {
                    console.error('Error fetching submission:', err);
                }
            }

            setAssignments(assignmentData);
            setSubmissions(submissionsMap);

            // Calculate stats
            const total = assignmentData.length;
            const submitted = Object.values(submissionsMap).filter(s => s.status === 'submitted' || s.status === 'graded').length;
            const graded = Object.values(submissionsMap).filter(s => s.status === 'graded').length;
            const pending = total - submitted;

            // Calculate average score
            const gradedSubmissions = Object.values(submissionsMap).filter(s => s.grade);
            const avgScore = gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((sum, s) => sum + ((s.grade.score / s.grade.max_score) * 100), 0) / gradedSubmissions.length
                : 0;

            setStats({
                total,
                pending,
                submitted,
                graded,
                avgScore: avgScore.toFixed(1)
            });
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAssignment = async (assignment) => {
        try {
            // Fetch full assignment details with questions
            const response = await api.get(`/assignments/assignments/${assignment.id}/`);
            const fullAssignment = response.data;

            setSelectedAssignment(fullAssignment);
            const submission = submissions[assignment.id];

            if (submission?.status === 'graded' && submission.grade) {
                setSelectedGrade(submission.grade);
                setShowResults(true);
            } else {
                setShowSubmission(true);
            }
        } catch (error) {
            console.error('Error fetching assignment details:', error);
            toast.error('Failed to load assignment details');
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const submission = submissions[assignment.id];

        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && !submission) ||
            (filter === 'submitted' && submission?.status === 'submitted') ||
            (filter === 'graded' && submission?.status === 'graded');

        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysUntilDue = (dueDate) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getStatusBadge = (assignment) => {
        const submission = submissions[assignment.id];
        const daysUntil = getDaysUntilDue(assignment.due_date);

        if (!submission) {
            if (daysUntil !== null && daysUntil < 0) {
                return <Badge variant="destructive">Overdue</Badge>;
            }
            if (daysUntil !== null && daysUntil <= 2) {
                return <Badge variant="warning">Due Soon</Badge>;
            }
            return <Badge variant="secondary">Not Started</Badge>;
        }

        if (submission.status === 'graded') {
            return <Badge variant="success">Graded</Badge>;
        }

        if (submission.status === 'submitted') {
            return <Badge variant="default">Submitted</Badge>;
        }

        return <Badge variant="secondary">Draft</Badge>;
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        My Assignments
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        View and submit your assignments
                    </p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
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
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Graded</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.graded}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg Score</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/10 text-white hover:bg-white/10'}
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                        className={filter === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : 'border-white/10 text-white hover:bg-white/10'}
                    >
                        Pending ({stats.pending})
                    </Button>
                    <Button
                        variant={filter === 'graded' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('graded')}
                        className={filter === 'graded' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-white/10 text-white hover:bg-white/10'}
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
                <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-700">Loading assignments...</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? 'No assignments found' : 'No assignments yet'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new assignments'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filteredAssignments.map((assignment, index) => {
                                        const submission = submissions[assignment.id];
                                        const daysUntil = getDaysUntilDue(assignment.due_date);

                                        return (
                                            <motion.div
                                                key={assignment.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() => handleViewAssignment(assignment)}
                                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${submission?.status === 'graded'
                                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                                            : submission
                                                                ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                                : 'bg-gradient-to-br from-amber-500 to-orange-500'
                                                            }`}>
                                                            {submission?.status === 'graded' ? (
                                                                <CheckCircle className="w-6 h-6 text-white" />
                                                            ) : submission ? (
                                                                <Upload className="w-6 h-6 text-white" />
                                                            ) : (
                                                                <FileText className="w-6 h-6 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 mb-1">{assignment.title}</p>
                                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Due: {formatDate(assignment.due_date)}
                                                                </span>
                                                                {daysUntil !== null && daysUntil >= 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className={daysUntil <= 2 ? 'text-amber-600 font-medium' : ''}>
                                                                            {daysUntil} days left
                                                                        </span>
                                                                    </>
                                                                )}
                                                                <span>•</span>
                                                                <span>{assignment.total_marks} marks</span>
                                                                {submission?.grade && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                                            <Award className="w-3 h-3" />
                                                                            {submission.grade.score}/{submission.grade.max_score}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(assignment)}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

            {/* Modals */}
            <AnimatePresence>
                {showSubmission && selectedAssignment && (
                    <SubmissionForm
                        assignment={selectedAssignment}
                        existingSubmission={submissions[selectedAssignment.id]}
                        onClose={() => {
                            setShowSubmission(false);
                            setSelectedAssignment(null);
                        }}
                        onSubmitted={fetchAssignments}
                    />
                )}

                {showResults && selectedGrade && selectedAssignment && (
                    <ResultsView
                        assignment={selectedAssignment}
                        grade={selectedGrade}
                        onClose={() => {
                            setShowResults(false);
                            setSelectedGrade(null);
                            setSelectedAssignment(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Submission Form Component
function SubmissionForm({ assignment, existingSubmission, onClose, onSubmitted }) {
    const [answers, setAnswers] = useState(existingSubmission?.answers || {});
    const [pdfFile, setPdfFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submissionMethod, setSubmissionMethod] = useState('text'); // 'text' | 'pdf'

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please upload a PDF file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit? You cannot edit your submission after this.')) {
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            // Only send assignment ID for new submissions to avoid unique validation error during update
            if (!existingSubmission?.id) {
                formData.append('assignment', assignment.id);
            }

            if (assignment.submission_type === 'online' && submissionMethod === 'text') {
                formData.append('answers', JSON.stringify(answers));
                formData.append('submission_method', 'text');
            } else {
                // Online PDF or Offline
                if (!pdfFile) {
                    toast.error('Please upload a PDF file');
                    setSubmitting(false);
                    return;
                }
                formData.append('uploaded_file', pdfFile);
                if (assignment.submission_type === 'online') {
                    formData.append('submission_method', 'pdf');
                }
            }

            let submissionId = existingSubmission?.id;

            if (submissionId) {
                // Update existing submission with new data/file
                await api.patch(`/assignments/submissions/${submissionId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create new submission
                const response = await api.post('/assignments/submissions/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                submissionId = response.data.id;
            }

            // Submit
            await api.post(`/assignments/submissions/${submissionId}/submit/`);

            toast.success('Assignment submitted successfully!');
            onSubmitted?.();
            onClose();
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error(error.response?.data?.error || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
                <Card className="glass-card border-0 shadow-2xl">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
                                        <Badge variant={assignment.submission_type === 'online' ? 'secondary' : 'default'} className={assignment.submission_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}>
                                            {assignment.submission_type === 'online' ? 'Online Submission' : 'Offline Submission'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Due: {new Date(assignment.due_date).toLocaleString()}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                            {assignment.submission_type === 'online' ? (
                                <>
                                    {/* Submission Method Toggle */}
                                    <div className="mb-8">
                                        <p className="text-sm font-medium text-gray-700 mb-3">How do you want to submit?</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setSubmissionMethod('text')}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${submissionMethod === 'text' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                            >
                                                <div className={`p-2 rounded-full ${submissionMethod === 'text' ? 'bg-blue-200' : 'bg-gray-100'}`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium">Type Answers</span>
                                            </button>

                                            <button
                                                onClick={() => setSubmissionMethod('pdf')}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${submissionMethod === 'pdf' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                            >
                                                <div className={`p-2 rounded-full ${submissionMethod === 'pdf' ? 'bg-blue-200' : 'bg-gray-100'}`}>
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium">Upload PDF</span>
                                            </button>
                                        </div>
                                    </div>

                                    {submissionMethod === 'text' ? (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
                                            <div className="space-y-4">
                                                {assignment.questions?.map((question) => (
                                                    <div key={question.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <Badge variant="secondary">Q{question.question_number}</Badge>
                                                            <span className="text-sm text-gray-600">{question.marks} marks</span>
                                                        </div>
                                                        <p className="text-gray-900 mb-3 font-medium">{question.question_text}</p>
                                                        <textarea
                                                            value={answers[question.id] || ''}
                                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                            placeholder="Type your answer here..."
                                                            rows={4}
                                                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Reuse PDF Upload UI Logic */}
                                            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="pdf-upload-online"
                                                />
                                                <label htmlFor="pdf-upload-online" className="cursor-pointer w-full flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                                        <Upload className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Assignment PDF</h3>
                                                    <p className="text-gray-500 mb-6 max-w-sm">
                                                        Drag and drop your PDF file here, or click to browse.
                                                        <br />
                                                        <span className="text-xs">Max size: 5MB</span>
                                                    </p>
                                                    <Button variant="outline" className="gap-2">
                                                        Select PDF File
                                                    </Button>
                                                </label>
                                            </div>

                                            {pdfFile && (
                                                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg border border-blue-100">
                                                            <FileText className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{pdfFile.name}</p>
                                                            <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setPdfFile(null)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Show Questions Reference for PDF Uploaders */}
                                            <div className="mt-8">
                                                <h3 className="text-sm font-medium text-gray-700 mb-4">Reference Questions</h3>
                                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {assignment.questions?.map((question) => (
                                                        <div key={question.id} className="p-3 rounded-lg bg-white border border-gray-200 text-sm">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">Q{question.question_number}</Badge>
                                                                <span className="text-gray-500 text-xs">{question.marks} marks</span>
                                                            </div>
                                                            <p className="text-gray-800">{question.question_text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    {/* Instructions & Questions (Read Only) */}
                                    <div className="p-6 rounded-xl bg-violet-50 border border-violet-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <BookOpen className="w-5 h-5 text-violet-600" />
                                            <h3 className="text-lg font-semibold text-violet-900">Assignment Questions</h3>
                                        </div>
                                        <p className="text-gray-700 mb-6">{assignment.instructions || "Please answer the following questions in a PDF file and upload it below."}</p>

                                        <div className="space-y-4">
                                            {assignment.questions?.map((question) => (
                                                <div key={question.id} className="p-4 rounded-lg bg-white border border-violet-100">
                                                    <div className="flex items-start gap-3">
                                                        <Badge variant="outline" className="text-violet-600 border-violet-200 shrink-0">
                                                            Q{question.question_number}
                                                        </Badge>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{question.question_text}</p>
                                                            <p className="text-sm text-gray-500 mt-1">{question.marks} marks</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Submission</h3>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white hover:bg-gray-50 transition-colors">
                                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-700 mb-4 font-medium">
                                                {pdfFile ? (
                                                    <span className="text-emerald-600 flex items-center justify-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        {pdfFile.name}
                                                    </span>
                                                ) : 'Click to upload or drag and drop'}
                                            </p>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="pdf-upload"
                                            />
                                            <label htmlFor="pdf-upload">
                                                <Button variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-100" asChild>
                                                    <span className="cursor-pointer">
                                                        {pdfFile ? 'Change File' : 'Choose PDF File'}
                                                    </span>
                                                </Button>
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">
                                                PDF format only • Max size 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="border-gray-300 text-gray-900 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Assignment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// Results View Component - Continued in next file
function ResultsView({ assignment, grade, onClose }) {
    const percentage = ((grade.score / grade.max_score) * 100).toFixed(1);
    const isPassing = percentage >= 60;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
                <Card className="glass-card border-0 shadow-2xl">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className={`p-6 border-b border-white/10 ${isPassing
                            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10'
                            : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{assignment.title}</h2>
                                    <p className="text-sm text-white/70 mt-1">Your Results</p>
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
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                            {/* Score Card */}
                            <div className={`p-6 rounded-xl border-2 ${isPassing
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-amber-500/10 border-amber-500/30'
                                }`}>
                                <div className="text-center">
                                    <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${isPassing
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                        : 'bg-gradient-to-br from-amber-500 to-orange-500'
                                        }`}>
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-white">{percentage}%</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-white mb-2">
                                        {grade.score} / {grade.max_score}
                                    </p>
                                    <p className="text-white/60">
                                        {isPassing ? 'Great job!' : 'Keep practicing!'}
                                    </p>
                                </div>
                            </div>

                            {/* AI Feedback */}
                            {grade.ai_feedback && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        AI Feedback
                                    </h3>
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-white/80 text-sm font-sans">
                                            {grade.ai_feedback}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Teacher Comments */}
                            {grade.teacher_comments && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h3 className="font-semibold text-white mb-3">Teacher's Comments</h3>
                                    <p className="text-white/80 text-sm">{grade.teacher_comments}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-white/5">
                            <Button
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            >
                                Close
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
