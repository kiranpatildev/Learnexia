import { useState, useEffect } from 'react';
import { Calendar, Save, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import api from '../../services/api';

export function AttendancePage() {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents();
        }
    }, [selectedClass, selectedDate]);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/schools/classrooms/');
            const classData = response.data.results || response.data || [];
            setClasses(classData);
            if (classData.length > 0) {
                setSelectedClass(classData[0].id);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/schools/classrooms/${selectedClass}/students/`);
            const studentData = response.data.results || response.data || [];
            setStudents(studentData);

            // Fetch existing attendance for this date
            try {
                const attendanceResponse = await api.get('/attendance/records/', {
                    params: {
                        classroom: selectedClass,
                        date: selectedDate
                    }
                });
                const existingAttendance = {};
                (attendanceResponse.data.results || attendanceResponse.data || []).forEach(record => {
                    existingAttendance[record.student] = record.status;
                });
                setAttendance(existingAttendance);
            } catch (err) {
                // No existing attendance, start fresh
                setAttendance({});
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAllPresent = () => {
        const allPresent = {};
        students.forEach(student => {
            allPresent[student.id] = 'present';
        });
        setAttendance(allPresent);
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);
            const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
                student: studentId,
                classroom: selectedClass,
                date: selectedDate,
                status: status
            }));

            await api.post('/attendance/records/bulk_create/', {
                records: attendanceRecords
            });

            alert('Attendance saved successfully!');
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusButtonClass = (studentId, status) => {
        const isActive = attendance[studentId] === status;
        const baseClass = "px-4 py-2 rounded-lg font-medium transition-all";

        switch (status) {
            case 'present':
                return `${baseClass} ${isActive
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'}`;
            case 'absent':
                return `${baseClass} ${isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'}`;
            case 'late':
                return `${baseClass} ${isActive
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`;
            case 'excused':
                return `${baseClass} ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`;
            default:
                return baseClass;
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
                <p className="text-gray-600">Mark student attendance</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Class Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name || `Class ${cls.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="outline-none"
                        />
                    </div>

                    {/* Mark All Present Button */}
                    <Button
                        onClick={markAllPresent}
                        disabled={students.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                        Mark All Present
                    </Button>
                </div>
            </div>

            {/* Student List */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading students...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No students found</p>
                    <p className="text-gray-400 text-sm">
                        {selectedClass ? 'This class has no enrolled students' : 'Please select a class'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                        <div className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Student Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-700">
                                                {getInitials(student.user?.first_name && student.user?.last_name
                                                    ? `${student.user.first_name} ${student.user.last_name}`
                                                    : student.user?.email || 'Student'
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {student.user?.first_name && student.user?.last_name
                                                    ? `${student.user.first_name} ${student.user.last_name}`
                                                    : student.user?.email || 'Student'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => markAttendance(student.id, 'present')}
                                            className={getStatusButtonClass(student.id, 'present')}
                                        >
                                            Present
                                        </button>
                                        <button
                                            onClick={() => markAttendance(student.id, 'absent')}
                                            className={getStatusButtonClass(student.id, 'absent')}
                                        >
                                            Absent
                                        </button>
                                        <button
                                            onClick={() => markAttendance(student.id, 'late')}
                                            className={getStatusButtonClass(student.id, 'late')}
                                        >
                                            Late
                                        </button>
                                        <button
                                            onClick={() => markAttendance(student.id, 'excused')}
                                            className={getStatusButtonClass(student.id, 'excused')}
                                        >
                                            Excused
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={saveAttendance}
                            disabled={saving || Object.keys(attendance).length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
