import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    User,
    Calendar,
    FileText,
    Check,
    X,
    Loader2,
    Edit3,
    Save,
    Eye,
    DollarSign,
    Zap,
    MessageSquare,
    Award,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export function GradingInterface({ submission, assignment, onClose, onGraded }) {
    const [loading, setLoading] = useState(false);
    const [aiGrading, setAiGrading] = useState(false);
    const [grade, setGrade] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedScore, setEditedScore] = useState('');
    const [teacherComments, setTeacherComments] = useState('');

    useEffect(() => {
        if (submission.grade) {
            fetchGrade();
        }
    }, [submission]);

    const fetchGrade = async () => {
        try {
            const response = await api.get(`/assignments/grades/?submission__id=${submission.id}`);
            const grades = response.data.results || response.data || [];
            if (grades.length > 0) {
                setGrade(grades[0]);
                setEditedScore(grades[0].score);
                setTeacherComments(grades[0].teacher_comments || '');
            }
        } catch (error) {
            console.error('Error fetching grade:', error);
        }
    };

    const handleAIGrade = async () => {
        setAiGrading(true);
        try {
            const response = await api.post(`/assignments/submissions/${submission.id}/grade_with_ai/`);
            setGrade(response.data.grade);
            setEditedScore(response.data.grade.score);

            toast.success(
                `✨ AI graded! Score: ${response.data.grade.score}/${response.data.grade.max_score}`,
                { duration: 4000 }
            );

            onGraded?.();
        } catch (error) {
            console.error('Error AI grading:', error);
            toast.error(error.response?.data?.error || 'Failed to grade with AI');
        } finally {
            setAiGrading(false);
        }
    };

    const handleModifyScore = async () => {
        setLoading(true);
        try {
            await api.post(`/assignments/grades/${grade.id}/modify_score/`, {
                score: parseFloat(editedScore),
                teacher_comments: teacherComments
            });

            toast.success('Score updated successfully!');
            setIsEditing(false);
            fetchGrade();
            onGraded?.();
        } catch (error) {
            console.error('Error modifying score:', error);
            toast.error('Failed to update score');
        } finally {
            setLoading(false);
        }
    };

    const handlePublishGrade = async () => {
        setLoading(true);
        try {
            await api.post(`/assignments/grades/${grade.id}/publish/`);
            toast.success('Grade published to student!');
            onGraded?.();
            onClose();
        } catch (error) {
            console.error('Error publishing grade:', error);
            toast.error('Failed to publish grade');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not submitted';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const percentage = grade ? ((grade.score / grade.max_score) * 100).toFixed(1) : 0;
    const isPassing = percentage >= 60;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
                <Card className="glass-card border-0 shadow-2xl">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Grade Submission
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            {assignment.title}
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

                            {/* Student Info */}
                            <div className="mt-4 flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-white/60" />
                                    <span className="text-white/80">
                                        {submission.student?.first_name} {submission.student?.last_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-white/60" />
                                    <span className="text-white/80">
                                        {formatDate(submission.submitted_at)}
                                    </span>
                                </div>
                                {submission.is_late && (
                                    <Badge variant="destructive" className="text-xs">
                                        Late ({submission.days_late} days)
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                            {/* Student Content (Online vs Offline) */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Submission Content
                                </h3>

                                {submission.uploaded_file ? (
                                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                                        <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-white mb-2">
                                            PDF Submission Uploaded
                                        </p>
                                        <div className="flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                className="border-white/10 text-white hover:bg-white/10"
                                                onClick={() => window.open(submission.uploaded_file, '_blank')}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View PDF
                                            </Button>
                                            <a
                                                href={submission.uploaded_file}
                                                download
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-transparent hover:bg-white/10 text-white h-10 px-4 py-2"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Download
                                            </a>
                                        </div>
                                        <p className="text-sm text-white/40 mt-4">
                                            AI will extract text from this PDF for grading.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignment.questions?.map((question, index) => {
                                            const answer = submission.answers?.[question.id] || 'No answer provided';
                                            return (
                                                <div
                                                    key={question.id}
                                                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Badge variant="secondary">
                                                            Question {question.question_number}
                                                        </Badge>
                                                        <span className="text-sm text-white/60">
                                                            {question.marks} marks
                                                        </span>
                                                    </div>
                                                    <p className="text-white/80 mb-3">{question.question_text}</p>
                                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                        <p className="text-sm text-white/60 mb-1">Student's Answer:</p>
                                                        <p className="text-white">{answer}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* AI Grading Section */}
                            {!grade && (
                                <div className="p-6 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white mb-2">
                                                Grade with AI
                                            </h4>
                                            <p className="text-sm text-white/70 mb-4">
                                                Let AI analyze the submission with semantic understanding.
                                                You can review and modify the score afterward.
                                            </p>
                                            <Button
                                                onClick={handleAIGrade}
                                                disabled={aiGrading}
                                                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                                            >
                                                {aiGrading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        AI is grading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Grade with AI
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grade Display */}
                            {grade && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Rubric Breakdown (If available) */}
                                    {grade.rubric_scores && grade.rubric_scores.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award className="w-5 h-5 text-amber-400" />
                                                <h4 className="font-semibold text-white">Rubric Breakdown</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {grade.rubric_scores.map((rubricScore) => (
                                                    <div key={rubricScore.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-medium text-white text-sm">{rubricScore.criterion_name}</span>
                                                            <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                                                                {rubricScore.score} score
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between items-end text-xs text-white/40">
                                                            <span>Weight: {rubricScore.weight_percentage}%</span>
                                                            {rubricScore.ai_suggested_score && (
                                                                <span title="AI Suggestion">AI: {rubricScore.ai_suggested_score}</span>
                                                            )}
                                                        </div>
                                                        {rubricScore.feedback && (
                                                            <p className="mt-2 text-xs text-white/70 italic">"{rubricScore.feedback}"</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Score Card */}
                                    <div className={`p-6 rounded-xl border-2 ${isPassing
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-amber-500/10 border-amber-500/30'
                                        }`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm text-white/60 mb-1">Score</p>
                                                <div className="flex items-baseline gap-2">
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            value={editedScore}
                                                            onChange={(e) => setEditedScore(e.target.value)}
                                                            className="w-24 bg-white/5 border-white/10 text-white text-2xl font-bold"
                                                        />
                                                    ) : (
                                                        <span className="text-4xl font-bold text-white">
                                                            {grade.score}
                                                        </span>
                                                    )}
                                                    <span className="text-2xl text-white/60">
                                                        / {grade.max_score}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-white/60 mb-1">Percentage</p>
                                                <div className={`text-3xl font-bold ${isPassing ? 'text-emerald-400' : 'text-amber-400'
                                                    }`}>
                                                    {percentage}%
                                                </div>
                                            </div>
                                        </div>

                                        {grade.ai_suggested_score && grade.teacher_modified_ai_score && (
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-xs text-white/60">
                                                    AI Suggested: {grade.ai_suggested_score} / {grade.max_score}
                                                    <span className="ml-2 text-amber-400">(Modified by teacher)</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Feedback */}
                                    {grade.ai_feedback && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-4 h-4 text-violet-400" />
                                                <h4 className="font-semibold text-white">AI Feedback</h4>
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <pre className="whitespace-pre-wrap text-white/80 text-sm font-sans">
                                                    {grade.ai_feedback}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Teacher Comments */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquare className="w-4 h-4 text-blue-400" />
                                            <h4 className="font-semibold text-white">Teacher Comments</h4>
                                        </div>
                                        {isEditing ? (
                                            <textarea
                                                value={teacherComments}
                                                onChange={(e) => setTeacherComments(e.target.value)}
                                                placeholder="Add your personal comments..."
                                                rows={4}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-white/80 text-sm">
                                                {teacherComments || 'No teacher comments yet'}
                                            </p>
                                        )}
                                    </div>

                                    {/* AI Metadata */}
                                    {grade.ai_grading_cost && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap className="w-4 h-4 text-violet-400" />
                                                    <p className="text-xs text-white/60">Tokens Used</p>
                                                </div>
                                                <p className="text-lg font-semibold text-white">
                                                    {grade.ai_grading_tokens || 0}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                                    <p className="text-xs text-white/60">Cost</p>
                                                </div>
                                                <p className="text-lg font-semibold text-white">
                                                    ${grade.ai_grading_cost || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {grade && (
                            <div className="p-6 border-t border-white/10 bg-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {!isEditing ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditing(true)}
                                                className="border-white/10 text-white hover:bg-white/10"
                                            >
                                                <Edit3 className="w-4 h-4 mr-2" />
                                                Modify Score
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditedScore(grade.score);
                                                        setTeacherComments(grade.teacher_comments || '');
                                                    }}
                                                    className="border-white/10 text-white hover:bg-white/10"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleModifyScore}
                                                    disabled={loading}
                                                    className="bg-blue-500 hover:bg-blue-600"
                                                >
                                                    {loading ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4 mr-2" />
                                                    )}
                                                    Save Changes
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {!grade.is_published && !isEditing && (
                                        <Button
                                            onClick={handlePublishGrade}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            Publish Grade
                                        </Button>
                                    )}

                                    {grade.is_published && (
                                        <Badge variant="success" className="text-sm">
                                            <Check className="w-3 h-3 mr-1" />
                                            Published
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
