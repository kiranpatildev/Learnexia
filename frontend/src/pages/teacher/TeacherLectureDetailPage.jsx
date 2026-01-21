import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    FileText,
    Video,
    BookOpen,
    Download,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';

export function TeacherLectureDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchLectureDetails();
    }, [id]);

    const fetchLectureDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lectures/lectures/${id}/`);
            setLecture(response.data);
            setError(null);
        } catch (err) {
            console.error('[Lecture Detail] Error:', err);
            setError('Failed to load lecture details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading lecture details...</p>
                </div>
            </div>
        );
    }

    if (error || !lecture) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Lecture Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'This lecture does not exist'}</p>
                    <button
                        onClick={() => navigate('/teacher/lectures')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                        Back to Lectures
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/lectures')}
                            className="p-2 hover:bg-white rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
                            <p className="text-gray-600 mt-1">{lecture.classroom?.name || 'Unknown Class'}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-bold text-gray-900">{formatDate(lecture.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-bold text-gray-900">{lecture.duration || 0} min</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Students</p>
                                <p className="font-bold text-gray-900">{lecture.classroom?.student_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <Badge className={lecture.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                    {lecture.status || 'Draft'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md">
                    <div className="border-b border-gray-200">
                        <div className="flex gap-4 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-4 font-medium transition-all border-b-2 ${activeTab === 'overview'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('transcript')}
                                className={`px-4 py-4 font-medium transition-all border-b-2 ${activeTab === 'transcript'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Transcript
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`px-4 py-4 font-medium transition-all border-b-2 ${activeTab === 'resources'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Resources
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700">{lecture.description || 'No description provided'}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Subject</p>
                                            <p className="font-medium text-gray-900">{lecture.subject || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Topic</p>
                                            <p className="font-medium text-gray-900">{lecture.topic || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Created</p>
                                            <p className="font-medium text-gray-900">{formatDate(lecture.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Last Updated</p>
                                            <p className="font-medium text-gray-900">{formatDate(lecture.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transcript' && (
                            <div className="space-y-4">
                                {lecture.transcript ? (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">Lecture Transcript</h3>
                                            {lecture.transcript_approved_by_teacher && (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Approved
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700 whitespace-pre-wrap">{lecture.transcript}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">No transcript available</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No resources yet</p>
                                <p className="text-sm text-gray-500 mt-2">Generate notes, flashcards, or quizzes from this lecture</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
