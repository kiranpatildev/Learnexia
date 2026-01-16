import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Calendar,
    User,
    FileText,
    Download,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { lectureService } from '../../services/student.service';

export function StudentLectureDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markingWatched, setMarkingWatched] = useState(false);

    useEffect(() => {
        fetchLectureDetail();
    }, [id]);

    const fetchLectureDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await lectureService.getLectureById(id);
            setLecture(response);
        } catch (error) {
            console.error('Error fetching lecture:', error);
            setError('Failed to load lecture details');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsWatched = async () => {
        try {
            setMarkingWatched(true);
            // TODO: Implement mark as watched API call
            // await lectureService.markAsWatched(id);
            console.log('Marked as watched:', id);
        } catch (error) {
            console.error('Error marking as watched:', error);
        } finally {
            setMarkingWatched(false);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRecordingTypeDisplay = (lecture) => {
        // If there's a transcript and no audio/video file, it's a text lecture
        if (lecture.transcript && !lecture.audio_file && !lecture.video_file) {
            return { icon: '📝', label: 'Text Lecture' };
        }
        if (lecture.recording_type === 'video') {
            return { icon: '🎥', label: 'Video Lecture' };
        }
        return { icon: '🎙️', label: 'Audio Lecture' };
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600">Loading lecture...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !lecture) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {error || 'Lecture not found'}
                            </h3>
                            <Button onClick={() => navigate('/student/dashboard')} className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const recordingType = getRecordingTypeDisplay(lecture);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/student/dashboard')}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
                <Button
                    onClick={handleMarkAsWatched}
                    disabled={markingWatched}
                    className="gap-2"
                >
                    {markingWatched ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    Mark as Watched
                </Button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lecture Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl mb-2">{lecture.title}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{lecture.classroom_detail?.subject?.name || lecture.chapter}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>
                                                {lecture.teacher_detail?.first_name} {lecture.teacher_detail?.last_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-base px-3 py-1">
                                    {recordingType.icon} {recordingType.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Description */}
                            {lecture.description && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                    <p className="text-slate-600">{lecture.description}</p>
                                </div>
                            )}

                            {/* Transcript */}
                            {lecture.transcript && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-900">Lecture Content</h3>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="w-4 h-4" />
                                            Download
                                        </Button>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                                        <div className="prose prose-slate max-w-none">
                                            <p className="whitespace-pre-wrap text-slate-700">
                                                {lecture.transcript}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Audio/Video Player */}
                            {lecture.audio_file && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">Audio Recording</h3>
                                    <audio controls className="w-full">
                                        <source src={lecture.audio_file} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}

                            {lecture.video_file && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">Video Recording</h3>
                                    <video controls className="w-full rounded-lg">
                                        <source src={lecture.video_file} type="video/mp4" />
                                        Your browser does not support the video element.
                                    </video>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Lecture Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lecture Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Duration</p>
                                    <p className="text-sm text-slate-600">{formatDuration(lecture.duration)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Created</p>
                                    <p className="text-sm text-slate-600">{formatDate(lecture.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Topic</p>
                                    <p className="text-sm text-slate-600">{lecture.topic}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Chapter</p>
                                    <p className="text-sm text-slate-600">{lecture.chapter}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
