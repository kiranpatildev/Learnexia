import { useState, useEffect } from 'react';
import {
    X, CheckCircle, Clock, AlertCircle, Bot, Info,
    ChevronRight, Eye, Download, FileText, ClipboardCheck,
    Send, Search, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data (In a real app, pass assignmentId and fetch data)
import { mockSubmissions, mockAssignments } from '../../../services/mockDataTeacher';

export function GradingInterface({ assignmentId, onClose }) {
    // State
    const [submissions, setSubmissions] = useState(mockSubmissions); // Local copy
    const [currentSubmissionId, setCurrentSubmissionId] = useState(mockSubmissions[0].id);
    const [gradeForm, setGradeForm] = useState({ points: '', feedback: '' });
    const [filter, setFilter] = useState('all'); // all, pending, graded, late

    const assignment = mockAssignments.find(a => a.id === assignmentId) || mockAssignments[0];
    const currentSubmission = submissions.find(s => s.id === currentSubmissionId);

    // Derived Stats
    const total = submissions.length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;
    const pendingCount = total - gradedCount;
    const progress = (gradedCount / total) * 100;

    // Effects
    useEffect(() => {
        if (currentSubmission) {
            setGradeForm({
                points: currentSubmission.points_earned || '',
                feedback: currentSubmission.feedback || ''
            });
        }
    }, [currentSubmissionId]);

    // Handlers
    const handleSave = () => {
        // Update submission status
        setSubmissions(prev => prev.map(s =>
            s.id === currentSubmissionId
                ? { ...s, status: 'graded', points_earned: gradeForm.points, feedback: gradeForm.feedback }
                : s
        ));
    };

    const handleSaveAndNext = () => {
        handleSave();
        // Find next pending submission
        const next = submissions.find(s => s.id !== currentSubmissionId && s.status !== 'graded');
        if (next) {
            setCurrentSubmissionId(next.id);
        } else {
            // Find just next in list
            const currentIndex = submissions.findIndex(s => s.id === currentSubmissionId);
            if (currentIndex < submissions.length - 1) {
                setCurrentSubmissionId(submissions[currentIndex + 1].id);
            }
        }
    };

    // Filter Logic
    const filteredSubmissions = submissions.filter(s => {
        if (filter === 'pending') return s.status !== 'graded';
        if (filter === 'graded') return s.status === 'graded';
        if (filter === 'late') return s.is_late;
        return true;
    });

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col font-instrument">
            {/* Header */}
            <header className="h-20 border-b px-6 flex items-center justify-between bg-white shrink-0">
                <div>
                    <h2 className="text-xl font-poppins font-bold text-brand-navy">{assignment.title}</h2>
                    <p className="text-sm text-gray-500">{assignment.subject} • Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">Grading Progress:</span>
                        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-green transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-brand-navy">{gradedCount}/{total}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Queue Panel */}
                <aside className="w-80 border-r bg-gray-50/50 flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {['all', 'pending', 'graded', 'late'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                                        filter === f
                                            ? "bg-brand-navy text-white"
                                            : "bg-white border text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredSubmissions.map(sub => (
                            <div
                                key={sub.id}
                                onClick={() => setCurrentSubmissionId(sub.id)}
                                className={cn(
                                    "p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
                                    currentSubmissionId === sub.id
                                        ? "bg-white border-brand-blue ring-1 ring-brand-blue"
                                        : "bg-white border-transparent hover:border-gray-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={sub.student.avatar} className="w-10 h-10 rounded-full" />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-gray-900 truncate">{sub.student.name}</h4>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-500">{new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {sub.is_late && <span className="text-brand-orange font-bold">Late</span>}
                                        </div>
                                    </div>
                                    {sub.status === 'graded' && (
                                        <div className="flex flex-col items-end">
                                            <CheckCircle className="text-brand-green w-4 h-4 mb-1" />
                                            <span className="text-xs font-bold text-gray-900">{sub.points_earned} pts</span>
                                        </div>
                                    )}
                                </div>
                                {currentSubmissionId === sub.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Right Grading Panel */}
                <main className="flex-1 flex flex-col bg-brand-off-white/30">
                    {currentSubmission ? (
                        <>
                            {/* Student Header */}
                            <div className="px-8 py-6 bg-white border-b flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={currentSubmission.student.avatar} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                                    <div>
                                        <h2 className="text-2xl font-poppins font-bold text-gray-900">{currentSubmission.student.name}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                                                Submitted {new Date(currentSubmission.submitted_at).toLocaleString()}
                                            </span>
                                            {currentSubmission.is_late && (
                                                <span className="px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange text-xs font-bold flex items-center gap-1">
                                                    <Clock size={12} /> Late
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Submission Content */}
                                <div className="flex-1 overflow-y-auto p-8 border-r bg-gray-50/50">
                                    {/* Text Submission */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-brand-blue" />
                                            Written Response
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed font-instrument text-lg">
                                            {currentSubmission.submission_text}
                                        </p>
                                    </div>

                                    {/* Files */}
                                    {currentSubmission.files?.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="font-bold text-gray-900 mb-4 px-2">Attachments</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {currentSubmission.files.map((file, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border flex items-center justify-between group hover:border-brand-blue/30 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-900">{file.name}</p>
                                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Eye size={18} /></button>
                                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-brand-blue"><Download size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Analysis */}
                                    <div className="bg-gradient-to-br from-brand-purple/5 to-blue-50/50 rounded-2xl p-6 border border-brand-purple/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                                                    <Bot size={20} />
                                                </div>
                                                <h3 className="font-bold text-brand-navy">AI Grading Assistant</h3>
                                            </div>
                                            <span className="px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-bold rounded-full">
                                                {Math.round(currentSubmission.ai_confidence * 100)}% Confidence
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mb-4">{currentSubmission.ai_feedback}</p>

                                        <div className="flex items-center gap-4 bg-white/60 p-4 rounded-xl border border-brand-purple/10">
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Suggested Score</p>
                                                <p className="text-3xl font-bold text-brand-purple">{currentSubmission.ai_suggested_score}<span className="text-lg text-gray-400">/{assignment.total_points}</span></p>
                                            </div>
                                            <div className="h-8 w-px bg-gray-200" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Reasoning</p>
                                                <p className="text-sm font-medium text-gray-700">Strong analysis, covers all key points. Minor grammar issues.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grading Form Sidebar */}
                                <aside className="w-96 bg-white border-l flex flex-col p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <ClipboardCheck className="text-brand-navy" /> Grade Submission
                                    </h3>

                                    <div className="space-y-6 flex-1">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Points Earned</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    value={gradeForm.points}
                                                    onChange={e => setGradeForm({ ...gradeForm, points: e.target.value })}
                                                    className="w-24 text-center text-2xl font-bold border rounded-xl py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                                />
                                                <span className="text-gray-400 font-medium">/ {assignment.total_points}</span>
                                                {currentSubmission.ai_suggested_score && (
                                                    <button
                                                        onClick={() => setGradeForm({ ...gradeForm, points: currentSubmission.ai_suggested_score })}
                                                        className="ml-auto text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
                                                    >
                                                        <Bot size={12} /> Use AI Score
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Feedback</label>
                                            <textarea
                                                value={gradeForm.feedback}
                                                onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                                className="w-full flex-1 border rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                                                placeholder="Enter feedback for the student..."
                                            />
                                            {currentSubmission.ai_feedback && (
                                                <button
                                                    onClick={() => setGradeForm(prev => ({ ...prev, feedback: currentSubmission.ai_feedback }))}
                                                    className="mt-2 text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 self-start"
                                                >
                                                    <Bot size={12} /> Paste AI Feedback
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3">
                                        <button
                                            onClick={handleSaveAndNext}
                                            className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={20} /> Save & Next
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 py-3 bg-white border hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Logic to skip
                                                    handleSaveAndNext(); // Simplified for now
                                                }}
                                                className="flex-1 py-3 bg-white border hover:bg-gray-50 text-gray-500 rounded-xl font-bold transition-all"
                                            >
                                                Skip
                                            </button>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <ClipboardCheck size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a student from the list to start grading</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
