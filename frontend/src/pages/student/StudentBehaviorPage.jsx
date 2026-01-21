import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileText, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export function StudentBehaviorPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, minor, moderate, serious, critical
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        thisMonth: 0
    });

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/behavior/incidents/my_incidents/');
            setIncidents(response.data);
            calculateStats(response.data);
        } catch (error) {
            console.error('[Student Behavior] Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const now = new Date();
        const thisMonth = data.filter(inc => {
            const incidentDate = new Date(inc.incident_date);
            return incidentDate.getMonth() === now.getMonth() &&
                incidentDate.getFullYear() === now.getFullYear();
        });

        setStats({
            total: data.length,
            resolved: data.filter(inc => inc.status === 'resolved').length,
            pending: data.filter(inc => inc.status === 'pending').length,
            thisMonth: thisMonth.length
        });
    };

    const filteredIncidents = filter === 'all'
        ? incidents
        : incidents.filter(inc => inc.severity === filter);

    const getSeverityColor = (severity) => {
        const colors = {
            minor: 'bg-blue-100 text-blue-800 border-blue-200',
            moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            serious: 'bg-orange-100 text-orange-800 border-orange-200',
            critical: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[severity] || colors.minor;
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'critical' || severity === 'serious') {
            return <AlertCircle className="w-5 h-5" />;
        }
        return <FileText className="w-5 h-5" />;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your behavior records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Behavior Records</h1>
                        <p className="text-gray-600 mt-1">Track your conduct and progress</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<FileText className="w-6 h-6 text-blue-600" />}
                        label="Total Incidents"
                        value={stats.total}
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                        label="Resolved"
                        value={stats.resolved}
                        bgColor="bg-green-50"
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6 text-amber-600" />}
                        label="Pending"
                        value={stats.pending}
                        bgColor="bg-amber-50"
                    />
                    <StatCard
                        icon={<TrendingDown className="w-6 h-6 text-purple-600" />}
                        label="This Month"
                        value={stats.thisMonth}
                        bgColor="bg-purple-50"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-700">Filter:</span>
                        {['all', 'minor', 'moderate', 'serious', 'critical'].map((severity) => (
                            <button
                                key={severity}
                                onClick={() => setFilter(severity)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === severity
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Incidents Timeline */}
                {filteredIncidents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filter === 'all' ? 'No Incidents Recorded' : `No ${filter} incidents`}
                        </h3>
                        <p className="text-gray-600">
                            {filter === 'all'
                                ? 'Great job! Keep up the excellent behavior!'
                                : 'No incidents of this severity level.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredIncidents.map((incident) => (
                            <IncidentCard key={incident.id} incident={incident} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, bgColor }) {
    return (
        <div className={`${bgColor} rounded-xl p-6 border-2 border-opacity-20`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className="opacity-80">{icon}</div>
            </div>
        </div>
    );
}

// Incident Card Component
function IncidentCard({ incident }) {
    const getSeverityColor = (severity) => {
        const colors = {
            minor: 'bg-blue-100 text-blue-800 border-blue-300',
            moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            serious: 'bg-orange-100 text-orange-800 border-orange-300',
            critical: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[severity] || colors.minor;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            {incident.incident_type?.replace('_', ' ')}
                        </span>
                        {incident.is_ai_generated && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                AI Detected
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{incident.title}</h3>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(incident.incident_date)}</p>
                    {incident.status === 'resolved' && (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                            <CheckCircle className="w-4 h-4" />
                            Resolved
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Description:</p>
                    <p className="text-gray-700">{incident.description}</p>
                </div>

                {incident.teacher_notes && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Teacher Notes:</p>
                        <p className="text-sm text-blue-800">{incident.teacher_notes}</p>
                    </div>
                )}

                {incident.resolution_notes && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <p className="text-sm font-semibold text-green-900 mb-1">Resolution:</p>
                        <p className="text-sm text-green-800">{incident.resolution_notes}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                    <span>Reported by: {incident.reported_by_name || 'Teacher'}</span>
                    {incident.classroom_name && <span>• Class: {incident.classroom_name}</span>}
                </div>
            </div>
        </div>
    );
}
