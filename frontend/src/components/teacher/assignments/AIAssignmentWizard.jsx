import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    BookOpen,
    Settings,
    Eye,
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Zap,
    Clock,
    FileText,
    Edit3
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

const STEPS = [
    { id: 1, name: 'Select Lecture', icon: BookOpen },
    { id: 2, name: 'Configure', icon: Settings },
    { id: 3, name: 'Preview & Edit', icon: Eye },
    { id: 4, name: 'Publish', icon: Check }
];

export function AIAssignmentWizard({ onClose, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [lectures, setLectures] = useState([]);
    const [classrooms, setClassrooms] = useState([]);

    // Form data
    const [formData, setFormData] = useState({
        lecture_id: '',
        title: '',
        description: '',
        classroom: '',
        difficulty: 'medium',
        num_questions: 5,
        assignment_format: 'short_answer',
        submission_type: 'online',
        grading_method: 'ai_assisted',
        total_marks: 10,
        due_date: ''
    });

    // Generated data
    const [generatedAssignment, setGeneratedAssignment] = useState(null);
    const [aiMetadata, setAiMetadata] = useState(null);
    const [editedQuestions, setEditedQuestions] = useState([]);

    useEffect(() => {
        fetchLectures();
        fetchClassrooms();
    }, []);

    const fetchLectures = async () => {
        try {
            const response = await api.get('/lectures/lectures/?page_size=100');
            const lecturesData = response.data.results || response.data || [];
            if (lecturesData.length > 0) {
                setLectures(lecturesData);
            }
        } catch (error) {
            console.error('Error fetching lectures:', error);
            toast.error('Failed to load lectures');
        }
    };
    // ... existing ...



    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/schools/classrooms/');
            setClassrooms(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        }
    };

    const handleGenerateWithAI = async () => {
        if (!formData.lecture_id) {
            toast.error('Please select a lecture');
            return;
        }

        setGenerating(true);
        try {
            const response = await api.post('/assignments/assignments/generate_with_ai/', formData);

            setGeneratedAssignment(response.data.assignment);
            setAiMetadata(response.data.ai_metadata);
            setEditedQuestions(response.data.assignment.questions || []);

            toast.success(
                `✨ Assignment generated! Cost: $${response.data.ai_metadata.cost}`,
                { duration: 4000 }
            );

            setCurrentStep(3);
        } catch (error) {
            console.error('Error generating assignment:', error);
            toast.error(error.response?.data?.error || 'Failed to generate assignment');
        } finally {
            setGenerating(false);
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            await api.post(`/assignments/assignments/${generatedAssignment.id}/publish/`);
            toast.success('🎉 Assignment published successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error publishing:', error);
            toast.error('Failed to publish assignment');
        } finally {
            setLoading(false);
        }
    };

    const selectedLecture = lectures.find(l => l.id === formData.lecture_id);

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
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            AI Assignment Generator
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            Create assignments from lectures in seconds
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

                            {/* Steps */}
                            <div className="mt-6 flex items-center justify-between">
                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;

                                    return (
                                        <div key={step.id} className="flex items-center flex-1">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    animate={{
                                                        scale: isActive ? 1.1 : 1,
                                                        backgroundColor: isCompleted
                                                            ? 'rgb(34, 197, 94)'
                                                            : isActive
                                                                ? 'rgb(139, 92, 246)'
                                                                : 'rgba(255, 255, 255, 0.1)'
                                                    }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                                >
                                                    {isCompleted ? (
                                                        <Check className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                                                    )}
                                                </motion.div>
                                                <div className="hidden md:block">
                                                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>
                                                        {step.name}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < STEPS.length - 1 && (
                                                <div className="flex-1 h-0.5 mx-4 bg-white/10">
                                                    <motion.div
                                                        className="h-full bg-violet-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: isCompleted ? '100%' : '0%' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {currentStep === 1 && (
                                    <StepSelectLecture
                                        lectures={lectures}
                                        formData={formData}
                                        setFormData={setFormData}
                                        onNext={() => setCurrentStep(2)}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <StepConfigure
                                        formData={formData}
                                        setFormData={setFormData}
                                        classrooms={classrooms}
                                        selectedLecture={selectedLecture}
                                        generating={generating}
                                        onBack={() => setCurrentStep(1)}
                                        onGenerate={handleGenerateWithAI}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <StepPreview
                                        assignment={generatedAssignment}
                                        aiMetadata={aiMetadata}
                                        questions={editedQuestions}
                                        setQuestions={setEditedQuestions}
                                        onBack={() => setCurrentStep(2)}
                                        onNext={() => setCurrentStep(4)}
                                    />
                                )}

                                {currentStep === 4 && (
                                    <StepPublish
                                        assignment={generatedAssignment}
                                        loading={loading}
                                        onBack={() => setCurrentStep(3)}
                                        onPublish={handlePublish}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// Step 1: Select Lecture
function StepSelectLecture({ lectures, formData, setFormData, onNext }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Select a Lecture with Transcript
                </h3>
                <p className="text-sm text-white/60">
                    Choose the lecture you want to generate an assignment from
                </p>
            </div>

            {lectures.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No lectures found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {lectures.map((lecture) => {
                        const hasTranscript = !!lecture.transcript;
                        return (
                            <motion.div
                                key={lecture.id}
                                whileHover={hasTranscript ? { scale: 1.02 } : {}}
                                whileTap={hasTranscript ? { scale: 0.98 } : {}}
                                onClick={() => {
                                    if (hasTranscript) {
                                        setFormData({ ...formData, lecture_id: lecture.id });
                                        setTimeout(onNext, 300);
                                    }
                                }}
                                className={`p-4 rounded-xl transition-all ${!hasTranscript
                                    ? 'opacity-50 cursor-not-allowed bg-white/5 border border-dashed border-white/10'
                                    : formData.lecture_id === lecture.id
                                        ? 'cursor-pointer bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-2 border-violet-500'
                                        : 'cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white">
                                            {lecture.title}
                                            {!hasTranscript && <span className="ml-2 text-xs text-red-400 font-normal">(No transcript)</span>}
                                        </h4>
                                        <p className="text-sm text-white/60 mt-1 line-clamp-2">
                                            {lecture.description || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {lecture.subject?.name || 'General'}
                                            </Badge>
                                            <span className="text-xs text-white/40">
                                                {lecture.transcript?.length || 0} chars
                                            </span>
                                        </div>
                                    </div>
                                    {formData.lecture_id === lecture.id && (
                                        <Check className="w-5 h-5 text-violet-500" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// Step 2: Configure
function StepConfigure({ formData, setFormData, classrooms, selectedLecture, generating, onBack, onGenerate }) {
    const estimatedTime = formData.num_questions * 3; // ~3 seconds per question
    const estimatedCost = (formData.num_questions * 0.00004).toFixed(5);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Configure Assignment
                </h3>
                <p className="text-sm text-white/60">
                    Customize the assignment settings
                </p>
            </div>

            {/* Selected Lecture Info */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                    <div>
                        <p className="text-sm text-white/60">Selected Lecture</p>
                        <p className="font-medium text-white">{selectedLecture?.title}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Assignment Title *
                    </label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., IoT Fundamentals Assignment"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the assignment..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>

                {/* Classroom */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Classroom *
                    </label>
                    <select
                        value={formData.classroom}
                        onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">Select classroom</option>
                        {classrooms.map((classroom) => (
                            <option key={classroom.id} value={classroom.id}>
                                {classroom.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                    </label>
                    <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                {/* Number of Questions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                    </label>
                    <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.num_questions}
                        onChange={(e) => setFormData({ ...formData, num_questions: parseInt(e.target.value) })}
                        className="bg-white border-gray-300 text-gray-900"
                    />
                </div>

                {/* Format */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Format
                    </label>
                    <select
                        value={formData.assignment_format}
                        onChange={(e) => setFormData({ ...formData, assignment_format: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay</option>
                        <option value="case_study">Case Study</option>
                    </select>
                </div>

                {/* Total Marks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Marks
                    </label>
                    <Input
                        type="number"
                        min="1"
                        value={formData.total_marks}
                        onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                        className="bg-white border-gray-300 text-gray-900"
                    />
                </div>

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                    </label>
                    <Input
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                    />
                </div>

                {/* Submission Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Submission Type
                    </label>
                    <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${formData.submission_type === 'online' ? 'bg-violet-500/20 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="submission_type"
                                value="online"
                                checked={formData.submission_type === 'online'}
                                onChange={(e) => setFormData({ ...formData, submission_type: e.target.value })}
                                className="hidden"
                            />
                            <FileText className="w-4 h-4 mr-2" />
                            Online
                        </label>
                        <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${formData.submission_type === 'offline' ? 'bg-violet-500/20 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="submission_type"
                                value="offline"
                                checked={formData.submission_type === 'offline'}
                                onChange={(e) => setFormData({ ...formData, submission_type: e.target.value })}
                                className="hidden"
                            />
                            <BookOpen className="w-4 h-4 mr-2" />
                            Offline
                        </label>
                    </div>
                </div>

                {/* Grading Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grading Method
                    </label>
                    <select
                        value={formData.grading_method}
                        onChange={(e) => setFormData({ ...formData, grading_method: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="manual">Manual Grading</option>
                        <option value="ai_assisted">AI-Assisted</option>
                        <option value="automated">Fully Automated</option>
                    </select>
                </div>
            </div>

            {/* AI Estimation */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-4">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">AI Generation Estimate</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{estimatedTime}s
                            </span>

                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onGenerate}
                    disabled={generating || !formData.title || !formData.classroom || !formData.due_date}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate with AI
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}

// Step 3: Preview & Edit
function StepPreview({ assignment, aiMetadata, questions, setQuestions, onBack, onNext }) {
    const [editingIndex, setEditingIndex] = useState(null);

    const handleEditQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Preview & Edit Questions
                </h3>
                <p className="text-sm text-white/60">
                    Review AI-generated questions and make any adjustments
                </p>
            </div>

            {/* AI Metadata */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <p className="text-xs text-white/60">Questions</p>
                    <p className="text-lg font-semibold text-white">{questions.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-white/60">Tokens Used</p>
                    <p className="text-lg font-semibold text-white">{aiMetadata?.tokens_used || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-white/60">Cost</p>
                    <p className="text-lg font-semibold text-white">${aiMetadata?.cost || '0.00'}</p>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-3">
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <Badge variant="secondary">Question {question.question_number}</Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                className="text-white/70 hover:text-white"
                            >
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </div>

                        {editingIndex === index ? (
                            <div className="space-y-3">
                                <textarea
                                    value={question.question_text}
                                    onChange={(e) => handleEditQuestion(index, 'question_text', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                                <Input
                                    type="number"
                                    value={question.marks}
                                    onChange={(e) => handleEditQuestion(index, 'marks', parseFloat(e.target.value))}
                                    className="bg-white/5 border-white/10 text-white"
                                    placeholder="Marks"
                                />
                            </div>
                        ) : (
                            <>
                                <p className="text-white mb-3">{question.question_text}</p>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-white/60">Marks: {question.marks}</span>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/60">
                                        {question.expected_answer_keywords?.length || 0} keywords
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
}

// Step 4: Publish
function StepPublish({ assignment, loading, onBack, onPublish }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                    Ready to Publish!
                </h3>
                <p className="text-white/60">
                    Your AI-generated assignment is ready to be published to students
                </p>
            </div>

            {/* Assignment Summary */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div>
                    <p className="text-sm text-white/60">Assignment Title</p>
                    <p className="text-lg font-semibold text-white">{assignment?.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-white/60">Questions</p>
                        <p className="font-medium text-white">{assignment?.questions?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white/60">Total Marks</p>
                        <p className="font-medium text-white">{assignment?.total_marks}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white/60">Difficulty</p>
                        <p className="font-medium text-white capitalize">{assignment?.difficulty}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white/60">Format</p>
                        <p className="font-medium text-white capitalize">
                            {assignment?.assignment_format?.replace('_', ' ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    disabled={loading}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onPublish}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Publish Assignment
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
