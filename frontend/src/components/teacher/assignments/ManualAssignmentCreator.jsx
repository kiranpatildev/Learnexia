import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Save,
    Plus,
    Trash2,
    FileText,
    Check,
    AlertCircle,
    Loader2,
    BookOpen
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export function ManualAssignmentCreator({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [classrooms, setClassrooms] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructions: '',
        classroom: '',
        submission_type: 'offline', // Default to Offline (PDF) for better UX
        grading_method: 'ai_assisted',
        grading_type: 'basic',
        total_marks: 10,
        due_date: '',
        questions: [],
        rubric_criteria: []
    });

    // Helper to update form fields
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Load classrooms
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await api.get('/schools/classrooms/');
                setClassrooms(response.data.results || response.data || []);
            } catch (error) {
                console.error('Error fetching classrooms:', error);
            }
        };
        fetchClassrooms();
    }, []);

    // Question Management
    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question_number: prev.questions.length + 1,
                    question_text: '',
                    marks: 5,
                    expected_answer_keywords: [] // Required by backend even if manual
                }
            ]
        }));
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        // Re-number questions
        const reordered = newQuestions.map((q, i) => ({ ...q, question_number: i + 1 }));
        setFormData(prev => ({ ...prev, questions: reordered }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    // Rubric Management
    const addRubricCriterion = () => {
        setFormData(prev => ({
            ...prev,
            rubric_criteria: [
                ...prev.rubric_criteria,
                {
                    criterion_name: '',
                    description: '',
                    weight_percentage: 20,
                    order: prev.rubric_criteria.length + 1
                }
            ]
        }));
    };

    const removeCriterion = (index) => {
        const newCriteria = formData.rubric_criteria.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, rubric_criteria: newCriteria }));
    };

    const updateCriterion = (index, field, value) => {
        const newCriteria = [...formData.rubric_criteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setFormData(prev => ({ ...prev, rubric_criteria: newCriteria }));
    };

    // Validation
    const validateForm = () => {
        if (!formData.title) return "Title is required";
        if (!formData.classroom) return "Classroom is required";
        if (!formData.due_date) return "Due date is required";
        if (formData.submission_type === 'online' && formData.questions.length === 0) {
            return "Online assignments must have at least one question";
        }

        if (formData.grading_type === 'rubric') {
            const totalWeight = formData.rubric_criteria.reduce((sum, c) => sum + parseInt(c.weight_percentage || 0), 0);
            if (Math.abs(totalWeight - 100) > 1) {
                return `Rubric weights must sum to 100% (Current: ${totalWeight}%)`;
            }
        }

        return null;
    };

    // Submit
    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        setLoading(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                is_published: true // Auto publish for now, or add Draft option
            };

            await api.post('/assignments/assignments/', payload);
            toast.success('Assignment created successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error creating assignment:', error);
            toast.error('Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl h-[85vh] flex flex-col bg-slate-900 overflow-hidden rounded-xl"
            >
                <Card className="glass-card border-0 shadow-2xl flex flex-col h-full bg-slate-900/90 text-white p-0">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold">Create Assignment Correctly</h2>
                            <p className="text-white/60 text-sm">Manually configure all settings</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-0">

                        {/* Basic Info */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-white/80">Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => updateField('title', e.target.value)}
                                        className="bg-white/5 border-white/10 text-white mt-1"
                                        placeholder="Assignment Title"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-white/80">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => updateField('description', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white mt-1 focus:ring-2 focus:ring-primary"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/80">Classroom</label>
                                    <select
                                        value={formData.classroom}
                                        onChange={e => updateField('classroom', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white mt-1"
                                    >
                                        <option value="" className="bg-slate-800">Select Classroom</option>
                                        {classrooms.map(c => (
                                            <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/80">Due Date</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.due_date}
                                        onChange={e => updateField('due_date', e.target.value)}
                                        className="bg-white/5 border-white/10 text-white mt-1"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Submission & Grading Configuration */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Submission & Grading</h3>

                            {/* CRITICAL: Submission Type */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="text-sm font-medium text-violet-300 block mb-3">Submission Type (Critical)</label>
                                <div className="flex gap-4">
                                    <div
                                        onClick={() => updateField('submission_type', 'online')}
                                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.submission_type === 'online' ? 'bg-violet-500/20 border-violet-500' : 'border-white/10 hover:bg-white/5'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="submission_type"
                                            value="online"
                                            checked={formData.submission_type === 'online'}
                                            onChange={() => { }}
                                            className="hidden"
                                        />
                                        <FileText className="w-5 h-5 text-violet-400" />
                                        <div>
                                            <p className="font-medium text-white">Online (Type Answer)</p>
                                            <p className="text-xs text-white/60">Students type answers in browser</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => updateField('submission_type', 'offline')}
                                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.submission_type === 'offline' ? 'bg-violet-500/20 border-violet-500' : 'border-white/10 hover:bg-white/5'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="submission_type"
                                            value="offline"
                                            checked={formData.submission_type === 'offline'}
                                            onChange={() => { }}
                                            className="hidden"
                                        />
                                        <BookOpen className="w-5 h-5 text-violet-400" />
                                        <div>
                                            <p className="font-medium text-white">Offline (Upload PDF)</p>
                                            <p className="text-xs text-white/60">Students upload a PDF file</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white/80 block mb-2">Grading Method</label>
                                    <select
                                        value={formData.grading_method}
                                        onChange={e => updateField('grading_method', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    >
                                        <option value="manual" className="bg-slate-800">Manual Grading</option>
                                        <option value="ai_assisted" className="bg-slate-800">AI-Assisted (Recommended)</option>
                                        <option value="automated" className="bg-slate-800">Fully Automated</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/80 block mb-2">Grading Type</label>
                                    <div className="flex bg-white/5 rounded-lg p-1">
                                        <button
                                            onClick={() => updateField('grading_type', 'basic')}
                                            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${formData.grading_type === 'basic' ? 'bg-violet-600 text-white shadow' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Basic Score
                                        </button>
                                        <button
                                            onClick={() => updateField('grading_type', 'rubric')}
                                            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${formData.grading_type === 'rubric' ? 'bg-violet-600 text-white shadow' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Rubric Based
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rubric Creator - Only if Rubric Selected */}
                            {formData.grading_type === 'rubric' && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-white">Rubric Criteria</h4>
                                        <Button size="sm" onClick={addRubricCriterion} variant="outline" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
                                            <Plus className="w-4 h-4 mr-2" /> Add Criterion
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.rubric_criteria.map((criterion, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-black/20 p-3 rounded-lg">
                                                <div className="col-span-5">
                                                    <Input
                                                        placeholder="Criterion Name"
                                                        value={criterion.criterion_name}
                                                        onChange={e => updateCriterion(idx, 'criterion_name', e.target.value)}
                                                        className="bg-transparent border-white/10"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder="Weight"
                                                            value={criterion.weight_percentage}
                                                            onChange={e => updateCriterion(idx, 'weight_percentage', parseInt(e.target.value))}
                                                            className="bg-transparent border-white/10 pr-6"
                                                        />
                                                        <span className="absolute right-2 top-2 text-gray-400">%</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <Input
                                                        placeholder="Description (Optional)"
                                                        value={criterion.description}
                                                        onChange={e => updateCriterion(idx, 'description', e.target.value)}
                                                        className="bg-transparent border-white/10"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <Button size="icon" variant="ghost" onClick={() => removeCriterion(idx)} className="text-red-400 hover:bg-red-400/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-right text-sm text-white/60 mt-2">
                                        Total Weight: {formData.rubric_criteria.reduce((sum, c) => sum + (parseInt(c.weight_percentage) || 0), 0)}%
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Questions - Conditional Display if Online */}
                        {formData.submission_type === 'online' && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h3 className="font-semibold text-lg">Questions</h3>
                                    <Button onClick={addQuestion} className="bg-violet-600 hover:bg-violet-700">
                                        <Plus className="w-4 h-4 mr-2" /> Add Question
                                    </Button>
                                </div>

                                {formData.questions.length === 0 ? (
                                    <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border-dashed border border-white/10">
                                        No questions added yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.questions.map((q, idx) => (
                                            <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="ghost" onClick={() => removeQuestion(idx)} className="text-red-400 hover:bg-red-400/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-12 gap-4">
                                                    <div className="col-span-1 flex items-center justify-center">
                                                        <Badge variant="secondary" className="h-8 w-8 flex items-center justify-center rounded-full">
                                                            {idx + 1}
                                                        </Badge>
                                                    </div>
                                                    <div className="col-span-11 space-y-3">
                                                        <textarea
                                                            placeholder="Enter question text..."
                                                            value={q.question_text}
                                                            onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500"
                                                            rows={2}
                                                        />
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-32">
                                                                <label className="text-xs text-white/60 mb-1 block">Marks</label>
                                                                <Input
                                                                    type="number"
                                                                    value={q.marks}
                                                                    onChange={e => updateQuestion(idx, 'marks', parseInt(e.target.value))}
                                                                    className="bg-black/20 border-white/10"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Offline Instruction - Conditional */}
                        {formData.submission_type === 'offline' && (
                            <section className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-white">Offline Assignment Mode</h4>
                                        <p className="text-sm text-white/70 mt-1">
                                            Students will be asked to upload a PDF file. Use the "Description" or "Instructions" field above to tell them what they need to do.
                                            AI will attempt to read the uploaded PDF for grading.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3 shrink-0">
                        <Button variant="outline" onClick={onClose} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Create Assignment
                        </Button>
                    </div>

                </Card>
            </motion.div>
        </div>
    );
}
