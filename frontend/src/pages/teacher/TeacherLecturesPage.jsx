import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    BookOpen,
    Plus,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    Grid3x3,
    List,
    FileText,
    Mic,
    Video,
    Edit,
    Trash2,
    Copy,
    Eye,
    ChevronRight,
    ChevronLeft,
    X,
    Upload,
    Loader2,
    Layers,
    ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lectureService } from '../../services/student.service';
import api from '../../services/api';
import CreateLectureWizard from '../../components/teacher/CreateLectureWizard';

export function TeacherLecturesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('date');
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [contentType, setContentType] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        classroom: '',
        subject: '',
        description: '',
        duration: '',
        tags: '',
        textContent: '',
    });

    const [errors, setErrors] = useState({});

    const [stats, setStats] = useState({
        total: 0
    });

    const [classrooms, setClassrooms] = useState([]);

    const subjects = [
        'Mathematics',
        'Science',
        'English',
        'History',
        'Geography',
        'Physics',
        'Chemistry',
        'Biology',
        'Computer Science',
        'Other'
    ];

    useEffect(() => {
        fetchLectures();
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/schools/classrooms/');
            setClassrooms(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
            setClassrooms([]);
        }
    };

    const fetchLectures = async () => {
        try {
            setLoading(true);
            const response = await lectureService.getLectures({ ordering: '-date' });
            // Ensure lecturesList is always an array
            let lecturesList = [];
            if (Array.isArray(response)) {
                lecturesList = response;
            } else if (response && Array.isArray(response.results)) {
                lecturesList = response.results;
            } else if (response && typeof response === 'object') {
                // If response is an object but not an array, wrap it
                lecturesList = [response];
            }

            setLectures(lecturesList);

            setStats({
                total: lecturesList.length
            });
        } catch (error) {
            console.error('Error fetching lectures:', error);
            // Set empty array on error
            setLectures([]);
            setStats({ total: 0 });
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        setModalStep(1);
        setContentType(null);
        setFormData({
            title: '',
            classroom: '',
            subject: '',
            description: '',
            duration: '',
            tags: '',
            textContent: '',
        });
        setErrors({});
        setAudioFile(null);
        setVideoFile(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalStep(1);
        setContentType(null);
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.classroom) newErrors.classroom = 'Classroom is required';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        if (!formData.duration) newErrors.duration = 'Duration is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (contentType === 'text' && !formData.textContent.trim()) {
            newErrors.textContent = 'Lecture content is required';
        }
        if (contentType === 'audio' && !audioFile) {
            newErrors.audio = 'Please upload an audio file';
        }
        if (contentType === 'video' && !videoFile) {
            newErrors.video = 'Please upload a video file';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (modalStep === 1 && !validateStep1()) return;
        if (modalStep === 3 && !validateStep3()) return;
        setModalStep(modalStep + 1);
    };

    const handleBack = () => {
        setModalStep(modalStep - 1);
        setErrors({});
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Validate classroom exists
            if (!classrooms || classrooms.length === 0) {
                setErrors({ submit: 'You must be assigned to a classroom to create lectures. Please contact your administrator.' });
                setSubmitting(false);
                return;
            }

            let transcript = '';
            if (contentType === 'text') {
                transcript = formData.textContent;
            } else {
                transcript = '[Transcription pending - Speech-to-text feature coming soon]';
            }

            // Classroom ID is a UUID string, not an integer - don't parse it!
            const classroomId = formData.classroom;

            // Log for debugging
            console.log('Classroom value:', formData.classroom);
            console.log('Classroom ID (UUID):', classroomId);

            // Validate classroom ID exists
            if (!classroomId || classroomId === '') {
                setErrors({ submit: 'Please select a classroom from the dropdown' });
                setSubmitting(false);
                return;
            }

            // Map frontend fields to backend model fields
            const lectureData = {
                classroom: classroomId,  // Send UUID as string
                title: formData.title,
                chapter: formData.subject || 'General',  // Using subject as chapter
                topic: formData.title,  // Using title as topic for now
                description: formData.description,
                duration: parseInt(formData.duration, 10) * 60,  // Convert minutes to seconds
                transcript: transcript,
                recording_type: contentType === 'video' ? 'video' : 'audio',  // Map content_type to recording_type
                transcript_approved_by_teacher: true,
                status: 'completed',  // Use 'completed' instead of 'published'
                is_shared_with_students: true,  // Auto-share with students
            };

            console.log('Creating lecture:', lectureData);

            // Actually create the lecture via API
            await lectureService.createLecture(lectureData);

            closeModal();
            fetchLectures();
        } catch (error) {
            console.error('Error creating lecture:', error);

            // Log detailed error information
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Validation errors:', JSON.stringify(error.response.data, null, 2));

                // Show specific validation errors
                if (error.response.data) {
                    const errorMessages = Object.entries(error.response.data)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('\n');
                    setErrors({ submit: `Validation errors:\n${errorMessages}` });
                } else {
                    setErrors({ submit: 'Failed to create lecture. Please try again.' });
                }
            } else {
                setErrors({ submit: 'Failed to create lecture. Please try again.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'audio') {
                setAudioFile(file);
            } else if (type === 'video') {
                setVideoFile(file);
            }
            setErrors({});
        }
    };

    const filteredLectures = lectures.filter(lecture => {
        return lecture.title?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const sortedLectures = [...filteredLectures].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.date || b.created_at) - new Date(a.date || a.created_at);
        }
        if (sortBy === 'title') {
            return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
    });

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'audio':
                return <Mic className="w-4 h-4" />;
            case 'video':
                return <Video className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (lecture) => {
        return <Badge variant="success">Published</Badge>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Lectures</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage your lecture recordings and transcripts</p>
                </div>
                <Button onClick={openModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Lecture
                </Button>
            </div>

            {/* Stats */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total Lectures</p>
                            <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and Controls */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search lectures..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="title">Sort by Title</option>
                        </select>

                        <div className="flex gap-1 border border-slate-300 rounded-md p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lectures Display */}
            {sortedLectures.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {lectures.length === 0 ? 'No lectures yet' : 'No lectures found'}
                            </h3>
                            <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                                {lectures.length === 0
                                    ? 'Create your first lecture to get started with AI-powered features'
                                    : 'Try adjusting your search or filters'}
                            </p>
                            {lectures.length === 0 ? (
                                <Button onClick={openModal}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Lecture
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilter('all'); }}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                    {sortedLectures.map((lecture) => (
                        <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            {getContentTypeIcon(lecture.content_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">{lecture.title}</h3>
                                            <p className="text-xs text-slate-600">{lecture.subject || 'General'}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(lecture)}
                                </div>

                                {lecture.description && (
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{lecture.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
                                    <span>{formatDate(lecture.date || lecture.created_at)}</span>
                                    {lecture.duration && <span>•</span>}
                                    {lecture.duration && <span>{lecture.duration} min</span>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>

                                {/* AI Resources Generation */}
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <p className="text-xs text-slate-600 mb-2 font-medium">Generate Resources:</p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => navigate('/teacher/ai-features', { state: { selectedLecture: lecture } })}
                                        >
                                            <FileText className="w-3 h-3 mr-1" />
                                            Notes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => navigate('/teacher/ai-features', { state: { selectedLecture: lecture } })}
                                        >
                                            <Layers className="w-3 h-3 mr-1" />
                                            Flashcards
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => navigate('/teacher/ai-features', { state: { selectedLecture: lecture } })}
                                        >
                                            <ClipboardList className="w-3 h-3 mr-1" />
                                            Quiz
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}


            {/* Create Lecture Wizard */}
            <CreateLectureWizard
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                classrooms={classrooms}
                subjects={subjects}
            />
        </div>
    );
}
