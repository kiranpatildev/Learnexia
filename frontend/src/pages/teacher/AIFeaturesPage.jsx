import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import {
    Sparkles,
    FileText,
    ClipboardList,
    Layers,
    Users,
    Loader2,
    CheckCircle,
    AlertCircle,
    BookOpen
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

            // Auto-select first lecture if none selected
            if (!selectedLecture && lectureData.length > 0) {
                setSelectedLecture(lectureData[0]);
            }
        } catch (error) {
            console.error('Error fetching lectures:', error);
        } finally {
            setFetchingLectures(false);
        }
    };

    const handleGenerateNotes = async (format) => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, notes: true });
        try {
            const result = await lectureService.generateNotes(selectedLecture.id, {
                note_format: format,
                force_regenerate: false,
                auto_publish: true, // Auto-publish for teachers
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

    const handleGenerateQuiz = async (difficulty, length) => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, quiz: true });
        try {
            const result = await lectureService.generateQuiz(selectedLecture.id, {
                difficulty_level: difficulty,
                question_count: length,
                auto_publish: true,
            });
            setResults({ ...results, quiz: result });
            alert(`✅ Quiz generated successfully!\n\nDifficulty: ${difficulty}\nQuestions: ${length}\nThe quiz has been published and is now available to students.`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert('❌ Failed to generate quiz:\n\n' + errorMsg);
        } finally {
            setLoading({ ...loading, quiz: false });
        }
    };

    const handleGenerateFlashcards = async (cardType, style) => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, flashcards: true });
        try {
            const result = await lectureService.generateFlashcards(selectedLecture.id, {
                card_type: cardType,
                style: style,
                count: 'auto',
            });
            setResults({ ...results, flashcards: result });
            alert(`✅ Flashcards generated successfully!\n\nType: ${cardType}\nStyle: ${style}\nCount: ${result.count || 'auto'}\nThe flashcards have been published and are now available to students.`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert('❌ Failed to generate flashcards:\n\n' + errorMsg);
        } finally {
            setLoading({ ...loading, flashcards: false });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    AI Features
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    Generate notes, quizzes, and flashcards using AI - automatically published to students
                </p>
            </div>

            {/* Lecture Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Select Lecture</CardTitle>
                    <CardDescription>Choose a lecture to generate AI resources</CardDescription>
                </CardHeader>
                <CardContent>
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
                            <Label htmlFor="lecture-select">Select a lecture:</Label>
                            <select
                                id="lecture-select"
                                value={selectedLecture?.id || ''}
                                onChange={(e) => {
                                    const lecture = lectures.find(l => l.id === e.target.value);
                                    setSelectedLecture(lecture);
                                }}
                                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md"
                            >
                                {lectures.map((lecture) => (
                                    <option key={lecture.id} value={lecture.id}>
                                        {lecture.title} - {lecture.subject || 'General'} ({new Date(lecture.created_at).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                            {selectedLecture && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm font-medium text-blue-900">Selected: {selectedLecture.title}</p>
                                    {selectedLecture.description && (
                                        <p className="text-xs text-blue-700 mt-1">{selectedLecture.description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notes Generation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Generate Notes
                        </CardTitle>
                        <CardDescription>Create study notes in different formats</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => handleGenerateNotes('DETAILED')}
                                disabled={!selectedLecture || loading.notes}
                                className="w-full"
                            >
                                {loading.notes ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Detailed
                            </Button>
                            <Button
                                onClick={() => handleGenerateNotes('CONCISE')}
                                disabled={!selectedLecture || loading.notes}
                                variant="outline"
                                className="w-full"
                            >
                                {loading.notes ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Concise
                            </Button>
                        </div>
                        {results.notes && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                <p className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Notes generated successfully!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Flashcards Generation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            Generate Flashcards
                        </CardTitle>
                        <CardDescription>Create flashcards for quick review</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => handleGenerateFlashcards('MIXED', 'CONCISE')}
                                disabled={!selectedLecture || loading.flashcards}
                                className="w-full"
                            >
                                {loading.flashcards ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Mixed
                            </Button>
                            <Button
                                onClick={() => handleGenerateFlashcards('DEFINITION', 'DETAILED')}
                                disabled={!selectedLecture || loading.flashcards}
                                variant="outline"
                                className="w-full"
                            >
                                {loading.flashcards ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Definitions
                            </Button>
                        </div>
                        {results.flashcards && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                <p className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Flashcards generated successfully!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quiz Generation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-emerald-600" />
                            Generate Quiz
                        </CardTitle>
                        <CardDescription>Create quizzes to test understanding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                onClick={() => handleGenerateQuiz('easy', 10)}
                                disabled={!selectedLecture || loading.quiz}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                {loading.quiz ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Easy'}
                            </Button>
                            <Button
                                onClick={() => handleGenerateQuiz('medium', 15)}
                                disabled={!selectedLecture || loading.quiz}
                                size="sm"
                                className="w-full"
                            >
                                {loading.quiz ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Medium'}
                            </Button>
                            <Button
                                onClick={() => handleGenerateQuiz('hard', 20)}
                                disabled={!selectedLecture || loading.quiz}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                {loading.quiz ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Hard'}
                            </Button>
                        </div>
                        {results.quiz && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                <p className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Quiz generated successfully!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Help Text */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">How it works</p>
                            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                <li>Select a lecture from the dropdown above</li>
                                <li>Click any generate button to create AI resources</li>
                                <li>Resources are automatically published to students</li>
                                <li>Students can view them in their Notes, Flashcards, and Quizzes pages</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
