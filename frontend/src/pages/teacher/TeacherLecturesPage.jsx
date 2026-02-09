import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.openCreate) {
            setIsWizardOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

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
            const [lecturesRes, classroomsRes, subjectsRes] = await Promise.all([
                api.get('/lectures/lectures/', { params: { ordering: '-created_at' } }),
                api.get('/schools/classrooms/'),
                api.get('/schools/subjects/')
            ]);

            const lectureData = lecturesRes.data.results || lecturesRes.data || [];
            setLectures(lectureData);
            setClassrooms(classroomsRes.data.results || classroomsRes.data || []);

            const subjectsData = subjectsRes.data.results || subjectsRes.data || [];
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLecture = async (lectureData) => {
        try {
            const formData = new FormData();

            formData.append('title', lectureData.title);
            formData.append('classroom', lectureData.classroom);
            formData.append('chapter', lectureData.chapter || 'General');
            formData.append('topic', lectureData.topic || lectureData.title);
            formData.append('duration', lectureData.duration || 0);

            if (lectureData.description) {
                formData.append('description', lectureData.description);
            }

            if (lectureData.tags) {
                formData.append('tags', lectureData.tags);
            }

            if (lectureData.contentType === 'audio' && lectureData.audioFile) {
                formData.append('audio_file', lectureData.audioFile);
                formData.append('recording_type', 'audio');
            } else if (lectureData.contentType === 'video' && lectureData.videoFile) {
                formData.append('video_file', lectureData.videoFile);
                formData.append('recording_type', 'video');
            } else if (lectureData.contentType === 'text' && lectureData.textContent) {
                formData.append('transcript', lectureData.textContent);
            } else if (lectureData.contentType === 'link' && lectureData.linkUrl) {
                formData.append('description', lectureData.linkUrl);
            }

            formData.append('status', lectureData.isDraft ? 'draft' : 'completed');

            await api.post('/lectures/lectures/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2C3E50]">Lectures</h1>
                    <p className="text-sm text-[#6C757D] mt-1">Manage your lecture recordings and transcripts</p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="h-11 px-6 bg-[#2D7FF9] hover:bg-[#1E6FE8] text-white rounded-xl font-semibold text-[15px] flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} strokeWidth={2} />
                    Create Lecture
                </button>
            </div>

            {/* Total Lectures Card */}
            <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] flex items-center justify-center">
                        <BookOpen size={24} className="text-[#2D7FF9]" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-sm text-[#6C757D] font-medium">Total Lectures</p>
                        <p className="text-2xl font-bold text-[#2C3E50] mt-1">{lectures.length}</p>
                    </div>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="flex gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
                    <input
                        type="text"
                        placeholder="Search lectures..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 text-[#2C3E50] rounded-xl outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 transition-all"
                    />
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 h-11 bg-white border border-slate-200 text-[#2C3E50] rounded-xl outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 cursor-pointer transition-all"
                >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="subject">Sort by Subject</option>
                </select>

                {/* View Mode Toggles */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg border transition-all ${viewMode === 'grid'
                                ? 'bg-[#2D7FF9] text-white border-[#2D7FF9]'
                                : 'bg-white text-[#6C757D] border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <Grid3x3 size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg border transition-all ${viewMode === 'list'
                                ? 'bg-[#2D7FF9] text-white border-[#2D7FF9]'
                                : 'bg-white text-[#6C757D] border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <List size={18} />
                    </button>
                    <button className="p-2.5 bg-white text-[#6C757D] border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Lecture Cards Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-[#6C757D]">Loading lectures...</p>
                </div>
            ) : filteredLectures.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <BookOpen className="w-16 h-16 text-[#6C757D] mx-auto mb-4 opacity-50" />
                    <p className="text-[#2C3E50] text-lg font-semibold mb-2">No lectures yet</p>
                    <p className="text-[#6C757D] text-sm mb-4">Create your first lecture to get started</p>
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="px-6 py-2.5 bg-[#2D7FF9] hover:bg-[#1E6FE8] text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                        Create Lecture
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture) => (
                        <div
                            key={lecture.id}
                            className="bg-white border border-slate-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.03)] hover:border-[#2D7FF9] hover:shadow-[0_10px_20px_rgba(45,127,249,0.1),0_4px_8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-250 p-6"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#2D7FF9] to-[#1E6FE8] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <BookOpen size={20} className="text-white" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-[#2C3E50] truncate">{lecture.title}</h3>
                                        <p className="text-sm text-[#6C757D] truncate">{lecture.chapter || 'General'} • {lecture.topic || 'No topic'}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold bg-[#D1FAE5] text-[#065F46] flex-shrink-0 ml-2">
                                    Published
                                </span>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-[13px] text-[#9CA3AF] mb-4">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span>{formatDate(lecture.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>{lecture.duration || 2700} min</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => navigate(`/teacher/lectures/${lecture.id}`)}
                                    className="flex-1 h-10 bg-[#2D7FF9] hover:bg-[#1E6FE8] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                                <button className="h-10 w-10 bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-slate-200 text-[#6C757D] rounded-lg flex items-center justify-center transition-colors">
                                    <ExternalLink size={16} />
                                </button>
                                <button className="h-10 w-10 bg-[#F3F4F6] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] border border-slate-200 text-[#6C757D] hover:text-[#DC2626] rounded-lg flex items-center justify-center transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Generate Resources */}
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs text-[#6C757D] font-medium mb-3">Generate Resources:</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 h-9 bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-slate-200 text-[#374151] rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                        <FileText size={14} />
                                        Notes
                                    </button>
                                    <button className="flex-1 h-9 bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-slate-200 text-[#374151] rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                        <Layers size={14} />
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
