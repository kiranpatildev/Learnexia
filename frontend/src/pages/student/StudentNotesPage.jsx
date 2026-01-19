import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    Search,
    Filter,
    Mic,
    Video,
    FileText,
    Clock,
    Calendar,
    ChevronRight,
    Loader2,
    Flame,
    Award,
    Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function StudentNotesPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notes/notes/', {
                params: { ordering: '-created_at' }
            });
            const notesData = response.data.results || response.data || [];
            setNotes(notesData);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getContentTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'audio':
                return <Mic className="w-5 h-5" />;
            case 'video':
                return <Video className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getContentTypeBgColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'audio':
                return 'bg-gray-100';
            case 'video':
                return 'bg-amber-100';
            default:
                return 'bg-blue-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.lecture?.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubject === 'all' ||
            note.subject === selectedSubject ||
            note.lecture?.subject === selectedSubject;
        return matchesSearch && matchesSubject;
    });

    const subjects = ['all', ...new Set(notes.map(n => n.subject || n.lecture?.subject).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left: Title */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lecture Notes</h1>
                        <p className="text-sm text-gray-600">Access your study materials</p>
                    </div>

                    {/* Right: Search, Streak, XP, Buttons, Notification */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Day Streak */}
                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg">
                            <Flame className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-gray-900">
                                {user?.streak || 8} day streak
                            </span>
                        </div>

                        {/* Total XP */}
                        <div className="flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-lg">
                            <Award className="w-4 h-4 text-amber-700" />
                            <span className="text-sm font-semibold text-gray-900">
                                {user?.xp || 2450} XP
                            </span>
                        </div>

                        {/* Teacher/Student Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                Teacher
                            </button>
                            <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg">
                                Student
                            </button>
                        </div>

                        {/* Notification Bell */}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search and Filter Bar */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Search Lectures */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search lectures..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>

                    {/* Subject Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                        >
                            <option value="all">All Subjects</option>
                            {subjects.filter(s => s !== 'all').map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Notes List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No lecture notes found</h3>
                        <p className="text-gray-600">
                            {searchQuery || selectedSubject !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Your teacher will create lecture notes for you'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotes.map((note) => (
                            <Card
                                key={note.id}
                                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => navigate(`/student/notes/${note.id}`)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Content Type Icon */}
                                        <div className={`w-12 h-12 ${getContentTypeBgColor(note.content_type || note.lecture?.content_type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            {getContentTypeIcon(note.content_type || note.lecture?.content_type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                                                {note.title || note.lecture?.title || 'Untitled Note'}
                                            </h3>

                                            {/* Meta Info */}
                                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                                <span>{note.subject || note.lecture?.subject || 'General'}</span>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    {getContentTypeIcon(note.content_type || note.lecture?.content_type)}
                                                    <span className="capitalize">{note.content_type || note.lecture?.content_type || 'Text'}</span>
                                                </div>
                                                <span>•</span>
                                                <span>{note.duration || note.lecture?.duration || 45} min</span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                                {note.description || note.content?.substring(0, 150) || 'No description available'}
                                            </p>

                                            {/* Resources and Date */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Resources Available:</span>
                                                    {note.has_notes !== false && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            1 Notes
                                                        </Badge>
                                                    )}
                                                    {note.has_flashcards && (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                                            1 Flashcard
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatDate(note.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
