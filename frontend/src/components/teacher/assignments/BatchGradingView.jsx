import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Users,
    Check,
    X,
    Loader2,
    Zap,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock,
    Eye
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export function BatchGradingView({ submissions, assignment, onClose, onGraded }) {
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);
    const [grading, setGrading] = useState(false);
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const ungradedSubmissions = submissions.filter(s => s.status === 'submitted');

    const toggleSubmission = (submissionId) => {
        setSelectedSubmissions(prev =>
            prev.includes(submissionId)
                ? prev.filter(id => id !== submissionId)
                : [...prev, submissionId]
        );
    };

    const selectAll = () => {
        setSelectedSubmissions(ungradedSubmissions.map(s => s.id));
    };

    const deselectAll = () => {
        setSelectedSubmissions([]);
    };

    const handleBatchGrade = async () => {
        if (selectedSubmissions.length === 0) {
            toast.error('Please select at least one submission');
            return;
        }

        setGrading(true);
        try {
            const response = await api.post('/assignments/submissions/batch_grade_with_ai/', {
                submission_ids: selectedSubmissions
            });

            setResults(response.data);
            setShowResults(true);

            toast.success(
                `✨ Batch grading complete! ${response.data.success_count} graded successfully`,
                { duration: 5000 }
            );

            onGraded?.();
        } catch (error) {
            console.error('Error batch grading:', error);
            toast.error(error.response?.data?.error || 'Failed to batch grade');
        } finally {
            setGrading(false);
        }
    };

    const estimatedCost = (selectedSubmissions.length * 0.0001).toFixed(4);
    const estimatedTime = selectedSubmissions.length * 8; // ~8 seconds per submission

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
                <Card className="glass-card border-0 shadow-2xl">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Batch AI Grading
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            Grade multiple submissions at once
                                        </p>
                                    </div>
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

                            {/* Stats */}
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-xs text-white/60">Total Submissions</p>
                                    <p className="text-lg font-semibold text-white">{ungradedSubmissions.length}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                    <p className="text-xs text-white/60">Selected</p>
                                    <p className="text-lg font-semibold text-white">{selectedSubmissions.length}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs text-white/60">Est. Cost</p>
                                    <p className="text-lg font-semibold text-white">${estimatedCost}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-xs text-white/60">Est. Time</p>
                                    <p className="text-lg font-semibold text-white">~{estimatedTime}s</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!showResults ? (
                                <>
                                    {/* Selection Controls */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={selectAll}
                                                className="border-white/10 text-white hover:bg-white/10"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Select All
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={deselectAll}
                                                className="border-white/10 text-white hover:bg-white/10"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Deselect All
                                            </Button>
                                        </div>
                                        <p className="text-sm text-white/60">
                                            {selectedSubmissions.length} selected
                                        </p>
                                    </div>

                                    {/* Submissions List */}
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                                        {ungradedSubmissions.length === 0 ? (
                                            <div className="text-center py-12">
                                                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                                <p className="text-white/60">All submissions are graded!</p>
                                            </div>
                                        ) : (
                                            ungradedSubmissions.map((submission) => (
                                                <motion.div
                                                    key={submission.id}
                                                    whileHover={{ scale: 1.01 }}
                                                    onClick={() => toggleSubmission(submission.id)}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedSubmissions.includes(submission.id)
                                                        ? 'bg-violet-500/20 border-2 border-violet-500'
                                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedSubmissions.includes(submission.id)
                                                                ? 'bg-violet-500 border-violet-500'
                                                                : 'border-white/30'
                                                                }`}>
                                                                {selectedSubmissions.includes(submission.id) && (
                                                                    <Check className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white">
                                                                    {submission.student?.first_name} {submission.student?.last_name}
                                                                </p>
                                                                <p className="text-sm text-white/60">
                                                                    {submission.student?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {submission.is_late && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Late ({submission.days_late}d)
                                                                </Badge>
                                                            )}
                                                            <Badge variant="secondary" className="text-xs">
                                                                {submission.submitted_at
                                                                    ? new Date(submission.submitted_at).toLocaleDateString()
                                                                    : 'Not submitted'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    {/* AI Info */}
                                    {selectedSubmissions.length > 0 && (
                                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white mb-2">
                                                        AI Batch Grading
                                                    </h4>
                                                    <p className="text-sm text-white/70 mb-3">
                                                        AI will grade {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} with semantic understanding.
                                                        You can review and modify scores afterward.
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-white/60">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            ~{estimatedTime} seconds
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            ~${estimatedCost}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-6 flex items-center justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={onClose}
                                            className="border-white/10 text-white hover:bg-white/10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleBatchGrade}
                                            disabled={grading || selectedSubmissions.length === 0}
                                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                                        >
                                            {grading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Grading {selectedSubmissions.length} submissions...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Grade {selectedSubmissions.length} with AI
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                /* Results View */
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                <p className="text-sm text-white/60">Success</p>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{results.success_count}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                                <p className="text-sm text-white/60">Failed</p>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{results.failed_count}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DollarSign className="w-5 h-5 text-violet-400" />
                                                <p className="text-sm text-white/60">Total Cost</p>
                                            </div>
                                            <p className="text-2xl font-bold text-white">${results.total_cost}</p>
                                        </div>
                                    </div>

                                    {/* Results List */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">
                                            Grading Results
                                        </h3>
                                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                                            {results.results?.map((result, index) => {
                                                const submission = submissions.find(s => s.id === result.submission_id);
                                                return (
                                                    <div
                                                        key={result.submission_id}
                                                        className={`p-4 rounded-xl border ${result.success
                                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                                            : 'bg-red-500/5 border-red-500/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {result.success ? (
                                                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                                ) : (
                                                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-white">
                                                                        {submission?.student?.first_name} {submission?.student?.last_name}
                                                                    </p>
                                                                    {result.success ? (
                                                                        <p className="text-sm text-white/60">
                                                                            Score: {result.result?.suggested_score} / {assignment.total_marks}
                                                                            <span className="ml-2 text-white/40">
                                                                                (Cost: ${result.result?.cost})
                                                                            </span>
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-sm text-red-400">
                                                                            {result.error}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {result.success && (
                                                                <Badge variant="success">
                                                                    {((result.result?.suggested_score / assignment.total_marks) * 100).toFixed(0)}%
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end">
                                        <Button
                                            onClick={() => {
                                                onClose();
                                                onGraded?.();
                                            }}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Done
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
