import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Edit3, AlertTriangle, Users } from 'lucide-react';
import api from '../../services/api';

export function BehaviorReviewModal({ detection, onClose, onSuccess }) {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [matchingStudents, setMatchingStudents] = useState(false);
    const [modifiedDescription, setModifiedDescription] = useState(detection?.description || '');
    const [modifiedSeverity, setModifiedSeverity] = useState(detection?.severity || 'minor');
    const [teacherNotes, setTeacherNotes] = useState('');
    const [sendToStudent, setSendToStudent] = useState(true);
    const [sendToParent, setSendToParent] = useState(false);

    useEffect(() => {
        if (detection) {
            matchStudents();
        }
    }, [detection]);

    const matchStudents = async () => {
        try {
            setMatchingStudents(true);
            const response = await api.get(`/behavior/pending-detections/${detection.id}/match_students/`);
            setStudents(response.data.possible_students || []);

            // Auto-select if only one match
            if (response.data.possible_students?.length === 1) {
                setSelectedStudent(response.data.possible_students[0]);
            }
        } catch (error) {
            console.error('[Review Modal] Error matching students:', error);
        } finally {
            setMatchingStudents(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedStudent) {
            alert('Please scroll up and select a student from the matching list first!');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                action: 'APPROVE',
                student_id: selectedStudent.student_id,
                modified_description: modifiedDescription !== detection.description ? modifiedDescription : null,
                modified_severity: modifiedSeverity !== detection.severity ? modifiedSeverity : null,
                teacher_notes: teacherNotes || null,
                send_to_student: sendToStudent,
                send_to_parent: sendToParent
            };

            console.log('[Review Modal] Sending payload:', payload);
            console.log('[Review Modal] Detection:', detection);
            console.log('[Review Modal] Selected student:', selectedStudent);

            await api.post(`/behavior/pending-detections/${detection.id}/review/`, payload);

            alert('Behavior detection approved successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('[Review Modal] Error approving:', error);
            console.error('[Review Modal] Error response:', error.response?.data);
            alert('Failed to approve detection: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this detection?')) return;

        try {
            setLoading(true);
            await api.post(`/behavior/pending-detections/${detection.id}/review/`, {
                action: 'REJECT',
                teacher_notes: teacherNotes || 'Rejected by teacher'
            });

            alert('Detection rejected');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('[Review Modal] Error rejecting:', error);
            alert('Failed to reject detection');
        } finally {
            setLoading(false);
        }
    };

    if (!detection) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold">Review AI Detection</h2>
                        <p className="text-white/90 text-sm mt-1">Match student and approve or reject</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all flex-shrink-0"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Detection Info */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-2">AI Detected Behavior</h3>
                        <p className="text-gray-700 mb-3">{detection.description}</p>
                        <div className="bg-white border-l-4 border-purple-400 p-3 rounded">
                            <p className="text-sm text-gray-700 italic">"{detection.original_statement}"</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                                {detection.severity}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                {detection.ai_confidence} Confidence
                            </span>
                        </div>
                    </div>

                    {/* Student Matching */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                            <Users className="w-4 h-4 inline mr-2" />
                            Match to Student
                        </label>

                        {matchingStudents ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">Matching students...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                                <p className="text-gray-700 font-medium">No matching students found</p>
                                <p className="text-sm text-gray-500">Name: "{detection.student_name}"</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {students.map((student) => (
                                    <button
                                        key={student.student_id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedStudent?.student_id === student.student_id
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{student.student_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Match: {Math.round(student.similarity * 100)}% ({student.match_type})
                                                </p>
                                            </div>
                                            {selectedStudent?.student_id === student.student_id && (
                                                <CheckCircle className="w-6 h-6 text-purple-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            <Edit3 className="w-4 h-4 inline mr-2" />
                            Description (Optional Edit)
                        </label>
                        <textarea
                            value={modifiedDescription}
                            onChange={(e) => setModifiedDescription(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none"
                            rows={3}
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Severity</label>
                        <select
                            value={modifiedSeverity}
                            onChange={(e) => setModifiedSeverity(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none"
                        >
                            <option value="minor">Minor</option>
                            <option value="moderate">Moderate</option>
                            <option value="serious">Serious</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    {/* Teacher Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Teacher Notes (Optional)</label>
                        <textarea
                            value={teacherNotes}
                            onChange={(e) => setTeacherNotes(e.target.value)}
                            placeholder="Add any additional notes..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none"
                            rows={2}
                        />
                    </div>

                    {/* Notification Options */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sendToStudent}
                                onChange={(e) => setSendToStudent(e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded"
                            />
                            <span className="text-gray-700">Send notification to student</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sendToParent}
                                onChange={(e) => setSendToParent(e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded"
                            />
                            <span className="text-gray-700">Send notification to parent</span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t">
                    {!selectedStudent && (
                        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-amber-900">Student Not Selected</p>
                                <p className="text-sm text-amber-700">Please scroll to the top and select a student from the matching list to approve this detection.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleReject}
                            disabled={loading}
                            className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={loading || !selectedStudent}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Approve & Create Incident
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
