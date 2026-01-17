import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Eye,
    FileText,
    Layers,
    BookOpen,
    Calendar,
    Clock,
    Plus,
    Grid3x3,
    List,
    MoreVertical,
    ExternalLink,
    Trash2
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import CreateLectureWizard from '../../components/teacher/CreateLectureWizard';
import api from '../../services/api';

export function TeacherLecturesPage() {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [viewMode, setViewMode] = useState('grid');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [lecturesRes, classroomsRes] = await Promise.all([
                api.get('/lectures/lectures/', { params: { ordering: '-created_at' } }),
                api.get('/classrooms/classrooms/')
            ]);

            const lectureData = lecturesRes.data.results || lecturesRes.data || [];
            setLectures(lectureData);
            setClassrooms(classroomsRes.data.results || classroomsRes.data || []);

            const uniqueSubjects = [...new Set(lectureData.map(l => l.subject).filter(Boolean))];
            setSubjects(uniqueSubjects.map(s => ({ id: s, name: s })));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLecture = async (lectureData) => {
        try {
            await api.post('/lectures/lectures/', lectureData);
            await fetchData();
            setIsWizardOpen(false);
        } catch (error) {
            console.error('Error creating lecture:', error);
            throw error;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredLectures = lectures.filter(lecture =>
        lecture.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Lectures</h1>
                    <p className="text-gray-500">Manage your lecture recordings and transcripts</p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105"
                    style={{
                        boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff'
                    }}
                >
                    <Plus className="w-5 h-5" />
                    Create Lecture
                </button>
            </div>

            {/* Total Lectures Card */}
            <div className="mb-8 p-6 bg-gray-100 rounded-2xl"
                style={{
                    boxShadow: '12px 12px 24px #d1d1d1, -12px -12px 24px #ffffff'
                }}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center"
                        style={{
                            boxShadow: 'inset 6px 6px 12px #d1d1d1, inset -6px -6px 12px #ffffff'
                        }}>
                        <BookOpen className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Lectures</p>
                        <p className="text-3xl font-bold text-gray-800">{lectures.length}</p>
                    </div>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="flex gap-4 mb-8">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search lectures..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 text-gray-800 rounded-xl outline-none transition-all"
                        style={{
                            boxShadow: 'inset 6px 6px 12px #d1d1d1, inset -6px -6px 12px #ffffff'
                        }}
                    />
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl outline-none appearance-none cursor-pointer"
                    style={{
                        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                    }}
                >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="subject">Sort by Subject</option>
                </select>

                {/* View Mode Toggles */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 bg-gray-100 rounded-xl transition-all ${viewMode === 'grid' ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        style={{
                            boxShadow: viewMode === 'grid'
                                ? 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff'
                                : '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                        }}
                    >
                        <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 bg-gray-100 rounded-xl transition-all ${viewMode === 'list' ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        style={{
                            boxShadow: viewMode === 'list'
                                ? 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff'
                                : '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                        }}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        className="p-3 bg-gray-100 text-gray-400 rounded-xl"
                        style={{
                            boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                        }}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Lecture Cards Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading lectures...</p>
                </div>
            ) : filteredLectures.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No lectures yet</p>
                    <p className="text-gray-400 text-sm">Create your first lecture to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture) => (
                        <div
                            key={lecture.id}
                            className="p-6 bg-gray-100 rounded-2xl transition-all hover:scale-[1.02]"
                            style={{
                                boxShadow: '12px 12px 24px #d1d1d1, -12px -12px 24px #ffffff'
                            }}
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
                                        style={{
                                            boxShadow: 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff'
                                        }}>
                                        <BookOpen className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{lecture.title}</h3>
                                        <p className="text-sm text-gray-500">{lecture.subject || 'General'}</p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1">
                                    Published
                                </Badge>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(lecture.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{lecture.duration || 2700} min</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => navigate(`/teacher/lectures/${lecture.id}`)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-105"
                                    style={{
                                        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                                    }}
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    className="p-2 bg-gray-100 text-gray-400 rounded-xl transition-all"
                                    style={{
                                        boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 bg-gray-100 text-gray-400 rounded-xl transition-all"
                                    style={{
                                        boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Generate Resources */}
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Generate Resources:</p>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-105"
                                        style={{
                                            boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                                        }}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Notes
                                    </button>
                                    <button
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-105"
                                        style={{
                                            boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                                        }}
                                    >
                                        <Layers className="w-4 h-4" />
                                        Flashcards
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Lecture Wizard */}
            <CreateLectureWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSubmit={handleCreateLecture}
                classrooms={classrooms}
                subjects={subjects}
            />
        </div>
    );
}
