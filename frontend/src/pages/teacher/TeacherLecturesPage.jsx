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
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lectureService } from '../../services/student.service';
import api from '../../services/api';

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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Lecture Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Create New Lecture</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <span className={modalStep >= 1 ? 'text-blue-600 font-medium' : ''}>Basic Info</span>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className={modalStep >= 2 ? 'text-blue-600 font-medium' : ''}>Content Type</span>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className={modalStep >= 3 ? 'text-blue-600 font-medium' : ''}>Content</span>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className={modalStep >= 4 ? 'text-blue-600 font-medium' : ''}>Review</span>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Step 1: Basic Information */}
                            {modalStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Lecture Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Introduction to Photosynthesis"
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="classroom">Classroom *</Label>
                                        <select
                                            id="classroom"
                                            value={formData.classroom}
                                            onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.classroom ? 'border-red-500' : 'border-slate-300'}`}
                                        >
                                            <option value="">Select a classroom</option>
                                            {classrooms.map((classroom) => (
                                                <option key={classroom.id} value={classroom.id}>
                                                    {classroom.grade} - {classroom.section} ({classroom.subject})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.classroom && <p className="text-sm text-red-600 mt-1">{errors.classroom}</p>}
                                        {classrooms.length === 0 && (
                                            <p className="text-sm text-amber-600 mt-1">
                                                ⚠️ No classrooms found. Please contact your administrator.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="subject">Subject *</Label>
                                        <select
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.subject ? 'border-red-500' : 'border-slate-300'}`}
                                        >
                                            <option value="">Select a subject</option>
                                            {subjects.map((subject) => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                        {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description of the lecture content..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="duration">Duration (minutes) *</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                placeholder="45"
                                                className={errors.duration ? 'border-red-500' : ''}
                                            />
                                            {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                                            <Input
                                                id="tags"
                                                value={formData.tags}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                placeholder="biology, plants, science"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Content Type Selection */}
                            {modalStep === 2 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 mb-4">Choose how you want to create your lecture content:</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setContentType('text')}
                                            className={`p-6 rounded-lg border-2 transition-all ${contentType === 'text'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <FileText className={`w-12 h-12 mx-auto mb-3 ${contentType === 'text' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <h3 className="font-semibold text-slate-900 mb-2">Text-based Lecture</h3>
                                            <p className="text-sm text-slate-600">Write or paste your lecture content</p>
                                        </button>

                                        <button
                                            onClick={() => setContentType('audio')}
                                            className={`p-6 rounded-lg border-2 transition-all ${contentType === 'audio'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <Mic className={`w-12 h-12 mx-auto mb-3 ${contentType === 'audio' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <h3 className="font-semibold text-slate-900 mb-2">Audio Recording</h3>
                                            <p className="text-sm text-slate-600">Upload audio (will be transcribed)</p>
                                        </button>

                                        <button
                                            onClick={() => setContentType('video')}
                                            className={`p-6 rounded-lg border-2 transition-all ${contentType === 'video'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <Video className={`w-12 h-12 mx-auto mb-3 ${contentType === 'video' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <h3 className="font-semibold text-slate-900 mb-2">Video Lecture</h3>
                                            <p className="text-sm text-slate-600">Upload video with transcript</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Content Input */}
                            {modalStep === 3 && (
                                <div className="space-y-4">
                                    {contentType === 'text' && (
                                        <div>
                                            <Label htmlFor="textContent">Lecture Content *</Label>
                                            <textarea
                                                id="textContent"
                                                value={formData.textContent}
                                                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                                                placeholder="Enter your lecture content here..."
                                                rows={12}
                                                className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${errors.textContent ? 'border-red-500' : 'border-slate-300'
                                                    }`}
                                            />
                                            <div className="flex justify-between mt-2">
                                                {errors.textContent && <p className="text-sm text-red-600">{errors.textContent}</p>}
                                                <p className="text-sm text-slate-500 ml-auto">
                                                    {formData.textContent.length} characters
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {contentType === 'audio' && (
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8">
                                                <div className="text-center">
                                                    <Mic className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                                    <h3 className="font-medium text-slate-900 mb-2">Upload Audio File</h3>
                                                    <p className="text-sm text-slate-600 mb-4">MP3, WAV, M4A (max 100MB)</p>

                                                    <Button variant="outline" onClick={() => document.getElementById('audio-upload').click()}>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload File
                                                    </Button>

                                                    <input
                                                        id="audio-upload"
                                                        type="file"
                                                        accept="audio/*"
                                                        onChange={(e) => handleFileUpload(e, 'audio')}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>

                                            {audioFile && (
                                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                    <p className="text-sm font-medium text-emerald-900">✓ Audio file uploaded: {audioFile.name}</p>
                                                </div>
                                            )}

                                            {errors.audio && <p className="text-sm text-red-600">{errors.audio}</p>}

                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900">Speech-to-text conversion</p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            Audio will be automatically transcribed to text. This feature is coming soon.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Transcript Preview (Auto-generated)</Label>
                                                <textarea
                                                    disabled
                                                    placeholder="Transcript will appear here after processing..."
                                                    rows={6}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {contentType === 'video' && (
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8">
                                                <div className="text-center">
                                                    <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                                    <h3 className="font-medium text-slate-900 mb-2">Upload Video File</h3>
                                                    <p className="text-sm text-slate-600 mb-4">MP4, MOV, AVI (max 500MB)</p>

                                                    <Button variant="outline" onClick={() => document.getElementById('video-upload').click()}>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Choose Video File
                                                    </Button>

                                                    <input
                                                        id="video-upload"
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => handleFileUpload(e, 'video')}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>

                                            {videoFile && (
                                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                    <p className="text-sm font-medium text-emerald-900">✓ Video file uploaded: {videoFile.name}</p>
                                                </div>
                                            )}

                                            {errors.video && <p className="text-sm text-red-600">{errors.video}</p>}

                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900">Speech-to-text conversion</p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            Video audio will be automatically transcribed to text. This feature is coming soon.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Transcript Preview (Auto-generated)</Label>
                                                <textarea
                                                    disabled
                                                    placeholder="Transcript will appear here after processing..."
                                                    rows={6}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {modalStep === 4 && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-900">Basic Information</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setModalStep(1)}>Edit</Button>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-slate-600">Title:</span> <span className="font-medium">{formData.title}</span></p>
                                            <p><span className="text-slate-600">Subject:</span> <span className="font-medium">{formData.subject}</span></p>
                                            <p><span className="text-slate-600">Duration:</span> <span className="font-medium">{formData.duration} minutes</span></p>
                                            {formData.description && <p><span className="text-slate-600">Description:</span> <span className="font-medium">{formData.description}</span></p>}
                                            {formData.tags && <p><span className="text-slate-600">Tags:</span> <span className="font-medium">{formData.tags}</span></p>}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-900">Content Type</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setModalStep(2)}>Edit</Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {contentType === 'text' && <FileText className="w-5 h-5 text-blue-600" />}
                                            {contentType === 'audio' && <Mic className="w-5 h-5 text-blue-600" />}
                                            {contentType === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                                            <span className="font-medium capitalize">{contentType}-based Lecture</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-900">Content Preview</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setModalStep(3)}>Edit</Button>
                                        </div>
                                        {contentType === 'text' && (
                                            <p className="text-sm text-slate-600 line-clamp-3">{formData.textContent}</p>
                                        )}
                                        {contentType === 'audio' && audioFile && (
                                            <p className="text-sm text-slate-600">Audio file: {audioFile.name}</p>
                                        )}
                                        {contentType === 'video' && videoFile && (
                                            <p className="text-sm text-slate-600">Video file: {videoFile.name}</p>
                                        )}
                                    </div>

                                    {errors.submit && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-900">{errors.submit}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t flex items-center justify-between sticky bottom-0 bg-white">
                            <div>
                                {modalStep > 1 && (
                                    <Button variant="outline" onClick={handleBack} disabled={submitting}>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={closeModal} disabled={submitting}>
                                    Cancel
                                </Button>

                                {modalStep < 4 ? (
                                    <Button onClick={handleNext} disabled={modalStep === 2 && !contentType}>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Create Lecture
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
