import { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle,
    Edit3,
    XCircle,
    AlertCircle,
    Clock,
    BookOpen
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';

export function BehaviorManagementPage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        fetchIncidents();
    }, [activeTab]);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/behavior/incidents/', {
                params: { status: activeTab === 'pending' ? 'pending' : 'approved' }
            });
            setIncidents(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (incidentId, action) => {
        try {
            await api.patch(`/behavior/incidents/${incidentId}/`, { status: action });
            fetchIncidents();
        } catch (error) {
            console.error('Error updating incident:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'low':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const pendingCount = incidents.filter(i => i.status === 'pending').length;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Behavior Management</h1>
                    <p className="text-gray-600">Review and manage student behavior incidents</p>
                </div>
                <Button
                    onClick={() => setShowReportModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Report Incident
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'pending'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Pending Review
                    {pendingCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'approved'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Approved
                </button>
            </div>

            {/* Incidents List */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading incidents...</p>
                </div>
            ) : incidents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No incidents found</p>
                    <p className="text-gray-400 text-sm">
                        {activeTab === 'pending'
                            ? 'All incidents have been reviewed'
                            : 'No approved incidents yet'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {incidents.map((incident) => (
                        <div
                            key={incident.id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                {/* Left Side - Incident Info */}
                                <div className="flex-1">
                                    {/* Student Name and Severity */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {incident.student_name || 'Unknown Student'}
                                        </h3>
                                        <Badge
                                            className={`${getSeverityColor(incident.severity)} border px-3 py-1 text-xs font-semibold`}
                                        >
                                            {incident.severity || 'medium'}
                                        </Badge>
                                    </div>

                                    {/* Incident Type */}
                                    <p className="text-gray-700 font-medium mb-1">
                                        {incident.incident_type || 'Behavior Incident'}
                                    </p>

                                    {/* Course and Date */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{incident.course || 'General'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatDate(incident.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* AI Confidence */}
                                    {incident.ai_confidence && (
                                        <p className="text-sm text-gray-600">
                                            AI Confidence: <span className="font-semibold">{incident.ai_confidence}%</span>
                                        </p>
                                    )}

                                    {/* Description */}
                                    {incident.description && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {incident.description}
                                        </p>
                                    )}
                                </div>

                                {/* Right Side - Action Buttons */}
                                {activeTab === 'pending' && (
                                    <div className="flex items-center gap-2 ml-6">
                                        <Button
                                            onClick={() => handleAction(incident.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(incident.id, 'modified')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Modify
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(incident.id, 'rejected')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report Incident Modal - Placeholder */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Report Incident</h2>
                        <p className="text-gray-600 mb-6">Report incident form will be implemented here</p>
                        <Button
                            onClick={() => setShowReportModal(false)}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
