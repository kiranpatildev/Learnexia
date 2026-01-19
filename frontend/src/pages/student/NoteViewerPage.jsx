import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    ArrowLeft,
    Download,
    Bookmark,
    BookmarkCheck,
    Share2,
    Printer,
    FileText,
    Clock,
    User,
    Loader2,
    AlertCircle,
    Eye,
    Calendar
} from 'lucide-react';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';

export function NoteViewerPage() {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (noteId) {
            fetchNoteDetails();
            trackView();
        }
    }, [noteId]);

    const fetchNoteDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/notes/notes/${noteId}/`);
            setNote(response.data);

            // Check if bookmarked
            checkBookmarkStatus();
        } catch (error) {
            console.error('Error fetching note:', error);
            setError(error.response?.data?.message || 'Failed to load note');
        } finally {
            setLoading(false);
        }
    };

    const checkBookmarkStatus = async () => {
        try {
            const response = await api.get(`/notes/notes/${noteId}/is_bookmarked/`);
            setIsBookmarked(response.data.is_bookmarked);
        } catch (error) {
            console.error('Error checking bookmark status:', error);
        }
    };

    const trackView = async () => {
        try {
            await api.post(`/notes/notes/${noteId}/track_view/`);
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const handleBookmark = async () => {
        try {
            if (isBookmarked) {
                await api.post(`/notes/notes/${noteId}/unbookmark/`);
                setIsBookmarked(false);
            } else {
                await api.post(`/notes/notes/${noteId}/bookmark/`);
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert(error.response?.data?.message || 'Failed to bookmark note');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const response = await api.get(`/notes/notes/${noteId}/generate_pdf/`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${note?.title || 'note'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert(error.response?.data?.message || 'Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: note?.title,
                    text: note?.summary || 'Check out this lecture note',
                    url: window.location.href
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy link
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading note...</p>
                </div>
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Note Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The note you\'re looking for doesn\'t exist or has been removed.'}</p>
                    <button
                        onClick={() => navigate('/student/notes')}
                        className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Back to Notes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/student/notes')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Notes</span>
                        </button>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Bookmark */}
                            <button
                                onClick={handleBookmark}
                                className={`p-2 rounded-lg transition-colors ${isBookmarked
                                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this note'}
                            >
                                {isBookmarked ? (
                                    <BookmarkCheck className="w-5 h-5" />
                                ) : (
                                    <Bookmark className="w-5 h-5" />
                                )}
                            </button>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Share this note"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>

                            {/* Print */}
                            <button
                                onClick={handlePrint}
                                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Print this note"
                            >
                                <Printer className="w-5 h-5" />
                            </button>

                            {/* Download PDF */}
                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-8">
                        {/* Note Header */}
                        <div className="mb-8">
                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {note.title}
                            </h1>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                {/* Teacher */}
                                {note.teacher && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{note.teacher.first_name} {note.teacher.last_name}</span>
                                    </div>
                                )}

                                {/* Date */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(note.created_at)}</span>
                                </div>

                                {/* Views */}
                                {note.view_count !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{note.view_count} views</span>
                                    </div>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                {note.is_auto_generated && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        AI Generated
                                    </Badge>
                                )}
                                {note.classroom?.subject && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {note.classroom.subject.name}
                                    </Badge>
                                )}
                                {note.lecture && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                                        <FileText className="w-3 h-3 mr-1" />
                                        {note.lecture.title}
                                    </Badge>
                                )}
                            </div>

                            {/* Summary */}
                            {note.summary && (
                                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                                    <p className="text-gray-700">{note.summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Note Content */}
                        <div className="prose prose-lg max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                                    code: ({ node, inline, ...props }) =>
                                        inline
                                            ? <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-amber-600" {...props} />
                                            : <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-amber-500 pl-4 italic text-gray-700 my-4" {...props} />,
                                }}
                            >
                                {note.content}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
