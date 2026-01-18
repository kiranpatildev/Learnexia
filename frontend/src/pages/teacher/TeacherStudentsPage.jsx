import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    Users,
    Search,
    Trophy,
    TrendingUp,
    Mail,
    BookOpen
} from 'lucide-react';
import api from '../../services/api';

export function TeacherStudentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        avgPerformance: 0
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);

            // Get teacher's classrooms
            const classroomsRes = await api.get('/schools/classrooms/');
            const classrooms = classroomsRes.data.results || classroomsRes.data || [];

            // Get all students from all classrooms
            const allStudents = new Map(); // Use Map to avoid duplicates

            for (const classroom of classrooms) {
                try {
                    const studentsRes = await api.get(`/schools/classrooms/${classroom.id}/students/`);
                    const classroomStudents = studentsRes.data.results || studentsRes.data || [];

                    classroomStudents.forEach(enrollment => {
                        if (enrollment.user && enrollment.student) {
                            allStudents.set(enrollment.student, {
                                id: enrollment.student,
                                ...enrollment.user,
                                enrollment_id: enrollment.id,
                                classroom_name: classroom.subject_name || 'Unknown Class'
                            });
                        }
                    });
                } catch (err) {
                    console.error(`Error fetching students for classroom ${classroom.id}:`, err);
                }
            }

            const studentsList = Array.from(allStudents.values());
            setStudents(studentsList);

            // Calculate stats
            setStats({
                total: studentsList.length,
                active: studentsList.filter(s => s.is_active).length,
                avgPerformance: 0 // Would need performance API
            });

        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (firstName, lastName) => {
        if (!firstName && !lastName) return 'ST';
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'ST';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
                <p className="text-sm text-slate-600 mt-1">View and manage your students</p>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search students..."
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
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Students</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
                                <p className="text-xs text-slate-500">{stats.active} active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Active</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.active}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Avg Performance</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.avgPerformance}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Students List */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">Loading students...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {searchTerm ? 'No students found' : 'No students yet'}
                            </h3>
                            <p className="text-sm text-slate-600 max-w-md mx-auto">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Students will appear here once they register and join your classes'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                                {getInitials(student.first_name, student.last_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {student.first_name} {student.last_name}
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {student.email}
                                                </span>
                                                {student.classroom_name && (
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3" />
                                                        {student.classroom_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${student.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {student.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
