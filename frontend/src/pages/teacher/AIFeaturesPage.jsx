import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import {
    Sparkles,
    FileText,
    Layers,
    ClipboardList,
    Loader2,
    CheckCircle,
    BookOpen,
    Info
} from 'lucide-react';
import { lectureService } from '../../services/lecture.service';
import api from '../../services/api';

export function AIFeaturesPage() {
    const location = useLocation();
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(location.state?.selectedLecture || null);
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [fetchingLectures, setFetchingLectures] = useState(true);

    // Selection states for each card
    const [selectedNoteType, setSelectedNoteType] = useState('detailed');
    const [selectedFlashcardType, setSelectedFlashcardType] = useState('mixed');
    const [selectedQuizDifficulty, setSelectedQuizDifficulty] = useState('medium');

    useEffect(() => {
        fetchLectures();
    }, []);

    useEffect(() => {
        if (location.state?.selectedLecture) {
            setSelectedLecture(location.state.selectedLecture);
        }
    }, [location.state]);

    const fetchLectures = async () => {
        try {
            setFetchingLectures(true);
            const response = await api.get('/lectures/lectures/', {
                params: {
                    ordering: '-created_at'
                }
            });
            const lectureData = response.data.results || response.data || [];
            setLectures(lectureData);

            if (!selectedLecture && lectureData.length > 0) {
                setSelectedLecture(lectureData[0]);
            }
        } catch (error) {
            console.error('Error fetching lectures:', error);
        } finally {
            setFetchingLectures(false);
        }
    };

    const handleGenerateNotes = async () => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, notes: true });
        try {
            const format = selectedNoteType === 'detailed' ? 'DETAILED' : 'CONCISE';
            const result = await lectureService.generateNotes(selectedLecture.id, {
                note_format: format,
                force_regenerate: false,
                auto_publish: true,
            });
            setResults({ ...results, notes: result });
            alert(`✅ Notes generated successfully!\n\nFormat: ${format}\nThe notes have been published and are now visible to students.`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert('❌ Failed to generate notes:\n\n' + errorMsg);
        } finally {
            setLoading({ ...loading, notes: false });
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, flashcards: true });
        try {
            const cardType = selectedFlashcardType === 'mixed' ? 'MIXED' : 'DEFINITION';
            const style = selectedFlashcardType === 'mixed' ? 'CONCISE' : 'DETAILED';
            const result = await lectureService.generateFlashcards(selectedLecture.id, {
                card_type: cardType,
                style: style,
                count: 'auto',
            });
            setResults({ ...results, flashcards: result });
            alert(`✅ Flashcards generated successfully!\n\nType: ${cardType}\nThe flashcards have been published and are now available to students.`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert('❌ Failed to generate flashcards:\n\n' + errorMsg);
        } finally {
            setLoading({ ...loading, flashcards: false });
        }
    };

    const handleGenerateQuiz = async () => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, quiz: true });
        try {
            const questionCount = selectedQuizDifficulty === 'easy' ? 10 : selectedQuizDifficulty === 'medium' ? 15 : 20;
            const result = await lectureService.generateQuiz(selectedLecture.id, {
                difficulty_level: selectedQuizDifficulty,
                question_count: questionCount,
                auto_publish: true,
            });
            setResults({ ...results, quiz: result });
            alert(`✅ Quiz generated successfully!\n\nDifficulty: ${selectedQuizDifficulty}\nQuestions: ${questionCount}\nThe quiz has been published and is now available to students.`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert('❌ Failed to generate quiz:\n\n' + errorMsg);
        } finally {
            setLoading({ ...loading, quiz: false });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                    AI Features
                </h1>
                <p className="text-slate-600">
                    Generate notes, quizzes, and flashcards using AI - automatically published to students
                </p>
            </div>

            {/* Lecture Selector */}
            <Card className="mb-8 border-0 shadow-sm">
                <CardContent className="pt-6">
                    {fetchingLectures ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-sm text-slate-600">Loading lectures...</span>
                        </div>
                    ) : lectures.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-sm text-slate-600 mb-4">No lectures found</p>
                            <Button onClick={() => window.location.href = '/teacher/lectures'}>
                                Create Your First Lecture
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <Label htmlFor="lecture-select" className="text-base font-semibold text-slate-900">
                                Select a lecture
                            </Label>
                            <select
                                id="lecture-select"
                                value={selectedLecture?.id || ''}
                                onChange={(e) => {
                                    const lecture = lectures.find(l => l.id === e.target.value);
                                    setSelectedLecture(lecture);
                                }}
                                className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {lectures.map((lecture) => (
                                    <option key={lecture.id} value={lecture.id}>
                                        {lecture.title} - {lecture.subject || 'General'} ({new Date(lecture.created_at).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Generate Notes Card */}
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Generate Notes
                        </h3>

                        {/* Description */}
                        <p className="text-slate-600 text-sm mb-6">
                            Create structured study notes from lecture content
                        </p>

                        {/* Options */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setSelectedNoteType('detailed')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedNoteType === 'detailed'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Detailed
                            </button>
                            <button
                                onClick={() => setSelectedNoteType('concise')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedNoteType === 'concise'
                                        ? 'bg-amber-400 text-slate-900'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Concise
                            </button>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateNotes}
                            disabled={!selectedLecture || loading.notes}
                            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading.notes ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Notes
                                </>
                            )}
                        </button>
                    </CardContent>
                </Card>

                {/* Generate Flashcards Card */}
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                            <Layers className="w-8 h-8 text-purple-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Generate Flashcards
                        </h3>

                        {/* Description */}
                        <p className="text-slate-600 text-sm mb-6">
                            Create interactive flashcards for spaced repetition
                        </p>

                        {/* Options */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setSelectedFlashcardType('mixed')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedFlashcardType === 'mixed'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Mixed
                            </button>
                            <button
                                onClick={() => setSelectedFlashcardType('definitions')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedFlashcardType === 'definitions'
                                        ? 'bg-slate-100 text-slate-700'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Definitions
                            </button>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateFlashcards}
                            disabled={!selectedLecture || loading.flashcards}
                            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading.flashcards ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Flashcards
                                </>
                            )}
                        </button>
                    </CardContent>
                </Card>

                {/* Generate Quiz Card */}
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Generate Quiz
                        </h3>

                        {/* Description */}
                        <p className="text-slate-600 text-sm mb-6">
                            Create assessments to test student understanding
                        </p>

                        {/* Options */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setSelectedQuizDifficulty('easy')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedQuizDifficulty === 'easy'
                                        ? 'bg-slate-100 text-slate-700'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Easy
                            </button>
                            <button
                                onClick={() => setSelectedQuizDifficulty('medium')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedQuizDifficulty === 'medium'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Medium
                            </button>
                            <button
                                onClick={() => setSelectedQuizDifficulty('hard')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedQuizDifficulty === 'hard'
                                        ? 'bg-slate-100 text-slate-700'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Hard
                            </button>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateQuiz}
                            disabled={!selectedLecture || loading.quiz}
                            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading.quiz ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Quiz
                                </>
                            )}
                        </button>
                    </CardContent>
                </Card>
            </div>

            {/* How AI Generation Works */}
            <Card className="border-0 shadow-sm bg-amber-50">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <Info className="w-6 h-6 text-slate-900" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                How AI Generation Works
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-900">
                                        1
                                    </div>
                                    <p className="text-sm text-slate-700">
                                        Select a lecture with audio, video, or text content
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-900">
                                        2
                                    </div>
                                    <p className="text-sm text-slate-700">
                                        AI transcribes and analyzes the content
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-900">
                                        3
                                    </div>
                                    <p className="text-sm text-slate-700">
                                        Generated resources are published to students
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
