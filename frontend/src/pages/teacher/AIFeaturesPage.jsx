import { useState } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { lectureService } from '../../services/lecture.service';

export function AIFeaturesPage() {
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});

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
                auto_publish: false,
            });
            setResults({ ...results, notes: result });
            alert(`Notes generated successfully! Format: ${format}`);
        } catch (error) {
            alert('Failed to generate notes: ' + (error.response?.data?.message || error.message));
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
                difficulty,
                length,
                force_regenerate: false,
                auto_publish: false,
            });
            setResults({ ...results, quiz: result });
            alert(`Quiz generated successfully! Difficulty: ${difficulty}, Questions: ${length}`);
        } catch (error) {
            alert('Failed to generate quiz: ' + (error.response?.data?.message || error.message));
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
                style,
                count: 'auto',
            });
            setResults({ ...results, flashcards: result });
            alert(`Flashcards generated successfully! Type: ${cardType}, Style: ${style}`);
        } catch (error) {
            alert('Failed to generate flashcards: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading({ ...loading, flashcards: false });
        }
    };

    const handleDetectBehaviors = async (sensitivity) => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        setLoading({ ...loading, behaviors: true });
        try {
            const result = await lectureService.detectBehaviors(selectedLecture.id, {
                sensitivity,
            });
            setResults({ ...results, behaviors: result });
            alert(`Behavior detection complete! Found ${result.detected_count} behaviors`);
        } catch (error) {
            alert('Failed to detect behaviors: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading({ ...loading, behaviors: false });
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
                    Generate notes, quizzes, flashcards, and detect behaviors using AI
                </p>
            </div>

            {/* Info Message */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Create a lecture first</p>
                            <p className="text-xs text-blue-700 mt-1">
                                You need to create a lecture with an approved transcript to use AI features.
                                Create one in Django admin or using the API.
                            </p>
                        </div>
                    </div>
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
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Select Format:</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateNotes('comprehensive')}
                                    disabled={!selectedLecture || loading.notes}
                                    className="justify-start"
                                >
                                    {loading.notes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Comprehensive
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateNotes('bullet_point')}
                                    disabled={!selectedLecture || loading.notes}
                                    className="justify-start"
                                >
                                    Bullet Point
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateNotes('cornell')}
                                    disabled={!selectedLecture || loading.notes}
                                    className="justify-start"
                                >
                                    Cornell Notes
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateNotes('study_guide')}
                                    disabled={!selectedLecture || loading.notes}
                                    className="justify-start"
                                >
                                    Study Guide
                                </Button>
                            </div>
                        </div>
                        {results.notes && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-sm text-emerald-900 font-medium">✓ Notes generated successfully!</p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    {results.notes.word_count} words • {results.notes.format}
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
                        <CardDescription>Create quizzes with different difficulty levels</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Select Difficulty & Length:</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateQuiz('EASY', 10)}
                                    disabled={!selectedLecture || loading.quiz}
                                    className="justify-start"
                                >
                                    {loading.quiz ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Easy (10Q)
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateQuiz('MEDIUM', 10)}
                                    disabled={!selectedLecture || loading.quiz}
                                    className="justify-start"
                                >
                                    Medium (10Q)
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateQuiz('HARD', 10)}
                                    disabled={!selectedLecture || loading.quiz}
                                    className="justify-start"
                                >
                                    Hard (10Q)
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateQuiz('MEDIUM', 15)}
                                    disabled={!selectedLecture || loading.quiz}
                                    className="justify-start"
                                >
                                    Medium (15Q)
                                </Button>
                            </div>
                        </div>
                        {results.quiz && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-sm text-emerald-900 font-medium">✓ Quiz generated successfully!</p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    {results.quiz.question_count} questions • {results.quiz.difficulty}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Flashcard Generation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            Generate Flashcards
                        </CardTitle>
                        <CardDescription>Create flashcards for spaced repetition</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Select Type & Style:</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateFlashcards('MIXED', 'CONCISE')}
                                    disabled={!selectedLecture || loading.flashcards}
                                    className="justify-start"
                                >
                                    {loading.flashcards ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Mixed (Concise)
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateFlashcards('DEFINITION', 'CONCISE')}
                                    disabled={!selectedLecture || loading.flashcards}
                                    className="justify-start"
                                >
                                    Definitions
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateFlashcards('CONCEPT', 'DETAILED')}
                                    disabled={!selectedLecture || loading.flashcards}
                                    className="justify-start"
                                >
                                    Concepts
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleGenerateFlashcards('APPLICATION', 'DETAILED')}
                                    disabled={!selectedLecture || loading.flashcards}
                                    className="justify-start"
                                >
                                    Applications
                                </Button>
                            </div>
                        </div>
                        {results.flashcards && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-sm text-emerald-900 font-medium">✓ Flashcards generated!</p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    {results.flashcards.count} cards • {results.flashcards.type}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Behavior Detection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-600" />
                            Detect Behaviors
                        </CardTitle>
                        <CardDescription>Analyze transcript for behavior events</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Select Sensitivity:</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleDetectBehaviors('LOW')}
                                    disabled={!selectedLecture || loading.behaviors}
                                    className="justify-start"
                                >
                                    {loading.behaviors ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Low
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDetectBehaviors('MEDIUM')}
                                    disabled={!selectedLecture || loading.behaviors}
                                    className="justify-start"
                                >
                                    Medium
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDetectBehaviors('HIGH')}
                                    disabled={!selectedLecture || loading.behaviors}
                                    className="justify-start"
                                >
                                    High
                                </Button>
                            </div>
                        </div>
                        {results.behaviors && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-900 font-medium">
                                    ✓ Detected {results.behaviors.detected_count} behaviors
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Pending teacher review
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
