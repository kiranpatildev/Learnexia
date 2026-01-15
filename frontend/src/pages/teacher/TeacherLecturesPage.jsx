import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
    BookOpen,
    Plus,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Edit,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TeacherLecturesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Lectures</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage your lecture recordings and transcripts</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Lecture
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search lectures..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Lectures</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Approved</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Pending</p>
                                <p className="text-2xl font-semibold text-slate-900">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State */}
            <Card>
                <CardContent className="py-16">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No lectures yet</h3>
                        <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                            Create your first lecture to get started with AI-powered features
                        </p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Lecture
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Create Lecture via API</p>
                            <p className="text-xs text-blue-700 mt-1">
                                Use Django admin or the API endpoint: POST /api/v1/lectures/ to create lectures.
                                Once created, they will appear here.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
