import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import gamesService from '../../services/games.service';
import api from '../../services/api'; // Direct API for lectures if service not handy
// Assuming lectureService exists, but api is safer if unsure of method names
// Actually I'll use api directly for lectures just to be safe and quick

export function TeacherGameGeneratorPage() {
    const navigate = useNavigate();

    // Data State
    const [lectures, setLectures] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form State
    const [selectedLecture, setSelectedLecture] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [questionCount, setQuestionCount] = useState(5);
    const [lives, setLives] = useState(3);

    // Submission State
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [lecturesRes, templatesRes] = await Promise.all([
                    api.get('/lectures/lectures/?limit=50'),
                    gamesService.getGameTemplates()
                ]);

                setLectures(lecturesRes.data.results || lecturesRes.data || []);
                setTemplates(templatesRes.results || templatesRes || []);

                // Pre-select if available
                if (templatesRes.length > 0) {
                    // Prefer 'quick_drop'
                    const quickDrop = templatesRes.find(t => t.code === 'quick_drop');
                    setSelectedTemplate(quickDrop ? quickDrop.code : templatesRes[0].code);
                }
            } catch (err) {
                console.error("Failed to load resources:", err);
                setError("Failed to load required data");
            } finally {
                setLoadingData(false);
            }
        };
        fetchResources();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLecture || !selectedTemplate) {
            setError("Please select a lecture and game type");
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            const payload = {
                lecture_id: selectedLecture,
                game_type: selectedTemplate,
                difficulty,
                question_count: parseInt(questionCount),
                game_config: {
                    lives: parseInt(lives)
                }
            };

            await gamesService.generateGame(payload);

            // Redirect to games list on success
            navigate('/teacher/games');
        } catch (err) {
            console.error("Generation failed:", err);
            setError(err.response?.data?.detail || "Failed to generate game. Please try again.");
            setGenerating(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/teacher/games')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Generate New Game</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <Card>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Lecture Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Source Lecture</label>
                                <select
                                    value={selectedLecture}
                                    onChange={(e) => setSelectedLecture(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select a lecture...</option>
                                    {lectures.map(lecture => (
                                        <option key={lecture.id} value={lecture.id}>
                                            {lecture.title}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500">
                                    The AI will generate questions based on this lecture's content.
                                </p>
                            </div>

                            {/* Template Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Game Type</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {templates.map(template => {
                                        const isComingSoon = ['word_scramble'].includes(template.code);
                                        return (
                                            <div
                                                key={template.code}
                                                onClick={() => !isComingSoon && setSelectedTemplate(template.code)}
                                                className={`p-4 border rounded-xl transition-all relative ${isComingSoon
                                                    ? 'opacity-60 cursor-not-allowed bg-gray-50 border-dashed border-gray-300'
                                                    : selectedTemplate === template.code
                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 cursor-pointer'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="font-bold text-gray-900">{template.name}</div>
                                                    {isComingSoon && (
                                                        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Coming Soon
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">{template.game_type?.toLowerCase()}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Configuration Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Difficulty</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>

                                {/* Questions */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Questions</label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="20"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                {/* Lives */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Player Lives</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={lives}
                                        onChange={(e) => setLives(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={generating || !selectedLecture}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-lg"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Generating Content...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate Game
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
