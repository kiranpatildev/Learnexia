import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layers,
    ClipboardList,
    BookOpen,
    Clock,
    CheckCircle2,
    Play,
    Filter,
    Search,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function StudyToolsPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'flashcards'
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [quizzes, setQuizzes] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [flashcards, setFlashcards] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [quizzesRes, attemptsRes, flashcardsRes] = await Promise.all([
                api.get('/assessments/quizzes/', { params: { is_published: true } }),
                api.get('/assessments/attempts/', { params: { student: user.id } }),
                api.get('/flashcards/flashcard-sets/', { params: { is_published: true } })
            ]);

            setQuizzes(quizzesRes.data.results || quizzesRes.data || []);
            setQuizAttempts(attemptsRes.data.results || attemptsRes.data || []);
            setFlashcards(flashcardsRes.data.results || flashcardsRes.data || []);
        } catch (error) {
            console.error('Error fetching study tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const getQuizStatus = (quiz) => {
        const attempts = quizAttempts.filter(a => a.quiz === quiz.id);
        if (attempts.length === 0) return 'available';
        const latestAttempt = attempts[0];
        if (latestAttempt.status === 'graded' || latestAttempt.status === 'submitted') {
            return 'completed';
        }
        return 'in-progress';
    };

    const getQuizScore = (quiz) => {
        const attempts = quizAttempts.filter(a => a.quiz === quiz.id && a.status === 'graded');
        if (attempts.length === 0) return null;
        return Math.round(attempts[0].percentage || 0);
    };

    const filteredQuizzes = quizzes
        .filter(quiz => {
            const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (filterStatus === 'all') return true;
            const status = getQuizStatus(quiz);
            return status === filterStatus;
        });

    const filteredFlashcards = flashcards
        .filter(set => set.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleStartQuiz = (quizId) => {
        navigate(`/student/quizzes/${quizId}/take`);
    };

    const handleStartFlashcards = (setId) => {
        navigate(`/student/flashcards/${setId}/study`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Study Tools</h1>
                            <p className="text-slate-600">Master your subjects with quizzes and flashcards</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Available Quizzes</p>
                                <p className="text-2xl font-bold text-slate-900">{quizzes.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Layers className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Flashcard Sets</p>
                                <p className="text-2xl font-bold text-slate-900">{flashcards.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Completed</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {quizAttempts.filter(a => a.status === 'graded').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('quizzes')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'quizzes'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ClipboardList className="w-5 h-5" />
                                Quizzes
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('flashcards')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'flashcards'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Layers className="w-5 h-5" />
                                Flashcards
                            </div>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filters (only for quizzes) */}
                            {activeTab === 'quizzes' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === 'all'
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('available')}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === 'available'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        Available
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('completed')}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === 'completed'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        Completed
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : activeTab === 'quizzes' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredQuizzes.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-600">No quizzes found</p>
                                    </div>
                                ) : (
                                    filteredQuizzes.map(quiz => {
                                        const status = getQuizStatus(quiz);
                                        const score = getQuizScore(quiz);

                                        return (
                                            <div
                                                key={quiz.id}
                                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                                        <ClipboardList className="w-5 h-5 text-white" />
                                                    </div>
                                                    {status === 'completed' && score !== null && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                            {score}%
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-slate-900 mb-2">{quiz.title}</h3>
                                                <p className="text-sm text-slate-600 mb-4">
                                                    {quiz.total_points || 100} points • {quiz.time_limit || 'No'} time limit
                                                </p>
                                                <button
                                                    onClick={() => handleStartQuiz(quiz.id)}
                                                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Play className="w-4 h-4" />
                                                    {status === 'completed' ? 'Retake Quiz' : 'Start Quiz'}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFlashcards.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-600">No flashcard sets found</p>
                                    </div>
                                ) : (
                                    filteredFlashcards.map(set => (
                                        <div
                                            key={set.id}
                                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                                    <Layers className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                                    {set.card_count || 0} cards
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 mb-2">{set.title}</h3>
                                            <p className="text-sm text-slate-600 mb-4">
                                                {set.lecture_title || 'Lecture'} {set.subject && `• ${set.subject}`}
                                            </p>
                                            <button
                                                onClick={() => handleStartFlashcards(set.id)}
                                                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Play className="w-4 h-4" />
                                                Start Practice
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
