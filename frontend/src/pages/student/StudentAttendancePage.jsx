import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export function StudentAttendancePage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [stats, setStats] = useState({
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0
    });
    const [filter, setFilter] = useState('all'); // all, present, absent, late, excused

    useEffect(() => {
        fetchAttendance();
    }, [user]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);

            // Fetch attendance records for the logged-in student
            const response = await api.get('/attendance/records/', {
                params: { student: user?.id }
            });

            const records = response.data.results || response.data || [];
            console.log('Attendance records:', records);
            if (records.length > 0) {
                console.log('First record:', records[0]);
                console.log('Available fields:', Object.keys(records[0]));
            }
            setAttendanceRecords(records);

            // Calculate stats
            const present = records.filter(r => r.status === 'present').length;
            const absent = records.filter(r => r.status === 'absent').length;
            const late = records.filter(r => r.status === 'late').length;
            const excused = records.filter(r => r.status === 'excused').length;
            const total = records.length;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;

            setStats({
                totalDays: total,
                present,
                absent,
                late,
                excused,
                attendanceRate: rate
            });
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-emerald-600" />;
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'late':
                return <Clock className="w-5 h-5 text-amber-600" />;
            case 'excused':
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            absent: 'bg-red-100 text-red-700 border-red-200',
            late: 'bg-amber-100 text-amber-700 border-amber-200',
            excused: 'bg-blue-100 text-blue-700 border-blue-200'
        };

        return (
            <Badge className={`${variants[status] || 'bg-gray-100 text-gray-700'} border`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredRecords = attendanceRecords.filter(record => {
        if (filter === 'all') return true;
        return record.status === filter;
    });

    // Group records by month
    const groupedRecords = filteredRecords.reduce((acc, record) => {
        const date = new Date(record.session_date || record.date);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(record);
        return acc;
    }, {});

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">My Attendance</h1>
                <p className="text-sm text-slate-600 mt-1">Track your attendance record and statistics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Days</p>
                                <p className="text-2xl font-semibold text-slate-900">{stats.totalDays}</p>
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
                                <p className="text-sm text-slate-600">Present</p>
                                <p className="text-2xl font-semibold text-emerald-600">{stats.present}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Absent</p>
                                <p className="text-2xl font-semibold text-red-600">{stats.absent}</p>
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
                                <p className="text-sm text-slate-600">Late</p>
                                <p className="text-2xl font-semibold text-amber-600">{stats.late}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Attendance Rate</p>
                                <p className="text-3xl font-bold text-white">{stats.attendanceRate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    All ({attendanceRecords.length})
                </button>
                <button
                    onClick={() => setFilter('present')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'present'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Present ({stats.present})
                </button>
                <button
                    onClick={() => setFilter('absent')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Absent ({stats.absent})
                </button>
                <button
                    onClick={() => setFilter('late')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'late'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Late ({stats.late})
                </button>
                <button
                    onClick={() => setFilter('excused')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'excused'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Excused ({stats.excused})
                </button>
            </div>

            {/* Attendance Records */}
            {loading ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <p className="text-slate-500">Loading attendance records...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredRecords.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No attendance records found</h3>
                            <p className="text-sm text-slate-600">
                                {filter === 'all'
                                    ? 'Your attendance records will appear here once marked by your teacher'
                                    : `No ${filter} records found`
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedRecords).map(([monthYear, records]) => (
                        <Card key={monthYear}>
                            <CardHeader>
                                <CardTitle className="text-lg">{monthYear}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {records.map((record) => (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getStatusIcon(record.status)}
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {formatDate(record.session_date || record.date)}
                                                    </p>
                                                    {record.classroom_name && (
                                                        <p className="text-sm text-slate-500">
                                                            {record.classroom_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(record.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
