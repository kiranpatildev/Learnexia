import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { BookOpen, Search } from 'lucide-react';

export function StudentNotesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Lecture Notes</h1>
                <p className="text-sm text-slate-600 mt-1">Access your study materials</p>
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

            {/* Empty State */}
            <Card>
                <CardContent className="py-16">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No notes available</h3>
                        <p className="text-sm text-slate-600 max-w-md mx-auto">
                            Notes will appear here once your teacher generates them from lectures
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
