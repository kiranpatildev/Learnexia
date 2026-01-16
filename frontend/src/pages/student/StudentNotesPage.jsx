import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BookOpen, Search, Calendar, User, FileText, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export function StudentNotesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/notes/lecture-notes/', {
                params: {
                    is_published: true,
                    ordering: '-published_at'
                }
            });
            setNotes(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setError('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Lecture Notes</h1>
                <p className="text-sm text-slate-600 mt-1">Access your study materials created by your teachers</p>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notes List */}
            {loading ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-sm text-slate-600">Loading notes...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Error loading notes</h3>
                            <p className="text-sm text-slate-600 mb-4">{error}</p>
                            <Button onClick={fetchNotes} size="sm">Try Again</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredNotes.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {searchTerm ? 'No notes found' : 'No notes available'}
                            </h3>
                            <p className="text-sm text-slate-600 max-w-md mx-auto">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Notes will appear here once your teacher generates them from lectures'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                        <Card
                            key={note.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/student/notes/${note.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <CardTitle className="text-lg">{note.title}</CardTitle>
                                    {note.is_auto_generated && (
                                        <Badge variant="outline" className="ml-2">
                                            AI Generated
                                        </Badge>
                                    )}
                                </div>
                                {note.summary && (
                                    <p className="text-sm text-slate-600 line-clamp-2">{note.summary}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{note.lecture?.title || 'Lecture'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{note.teacher?.first_name} {note.teacher?.last_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{formatDate(note.published_at || note.created_at)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>👁️ {note.view_count || 0} views</span>
                                        <span>🔖 {note.bookmark_count || 0} bookmarks</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
