import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp
} from 'lucide-react';

export function ParentAttendancePage() {
    const [selectedMonth, setSelectedMonth] = useState('January 2026');

    const attendanceData = {
        overall: 95,
        present: 38,
        absent: 2,
        late: 0,
        total: 40,
        recentRecords: [
            { id: 1, date: 'Jan 15, 2026', status: 'present', subject: 'All Classes' },
            { id: 2, date: 'Jan 14, 2026', status: 'present', subject: 'All Classes' },
            { id: 3, date: 'Jan 13, 2026', status: 'absent', subject: 'Sick Leave', reason: 'Medical' },
            { id: 4, date: 'Jan 12, 2026', status: 'present', subject: 'All Classes' },
            { id: 5, date: 'Jan 11, 2026', status: 'present', subject: 'All Classes' },
        ],
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-emerald-600" />;
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'late':
                return <Clock className="w-5 h-5 text-amber-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present':
                return <Badge variant="success">Present</Badge>;
            case 'absent':
                return <Badge variant="destructive">Absent</Badge>;
            case 'late':
                return <Badge variant="warning">Late</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
                    <p className="text-sm text-slate-600 mt-1">Track attendance and punctuality</p>
                </div>
                <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedMonth}
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Overall</p>
                                <p className="text-3xl font-bold text-blue-600">{attendanceData.overall}%</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
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
                                <p className="text-2xl font-semibold text-slate-900">{attendanceData.present}</p>
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
                                <p className="text-2xl font-semibold text-slate-900">{attendanceData.absent}</p>
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
                                <p className="text-2xl font-semibold text-slate-900">{attendanceData.late}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">
                                {attendanceData.present} of {attendanceData.total} days
                            </span>
                            <span className="font-medium text-slate-900">{attendanceData.overall}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${attendanceData.overall}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-500">
                            Excellent attendance! Keep it up!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Attendance Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {attendanceData.recentRecords.map((record) => (
                            <div
                                key={record.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                        {getStatusIcon(record.status)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900">{record.date}</h3>
                                        <p className="text-sm text-slate-600">{record.subject}</p>
                                        {record.reason && (
                                            <p className="text-xs text-slate-500 mt-1">Reason: {record.reason}</p>
                                        )}
                                    </div>
                                </div>
                                {getStatusBadge(record.status)}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-900">Perfect Attendance Weeks</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">3</p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    Great consistency this month!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Next School Day</p>
                                <p className="text-lg font-semibold text-blue-700 mt-1">Tomorrow, Jan 16</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    All classes scheduled
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
