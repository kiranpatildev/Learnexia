import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Users,
    Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { BehaviorReviewModal } from '../../components/behavior/BehaviorReviewModal';

export function BehaviorManagementPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ai-pending'); // ai-pending | manual-pending | approved
    const [aiDetections, setAiDetections] = useState([]);
    const [manualIncidents, setManualIncidents] = useState([]);
    const [selectedDetection, setSelectedDetection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        aiPending: 0,
        manualPending: 0,
        approved: 0,
        total: 0
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch AI pending detections
            const aiResponse = await api.get('/behavior/pending-detections/', {
                params: { status: 'pending' }
            });
            const aiData = aiResponse.data.results || aiResponse.data || [];
            setAiDetections(aiData);

            // Fetch manual incidents
            const manualResponse = await api.get('/behavior/incidents/');
            const manualData = manualResponse.data.results || manualResponse.data || [];
            setManualIncidents(manualData);

            // Calculate stats
            setStats({
                aiPending: aiData.length,
                manualPending: manualData.filter(i => i.status === 'pending').length,
                approved: manualData.filter(i => i.status === 'approved').length,
                total: manualData.length
            });

        } catch (error) {
            console.error('[Behavior] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Behavior Management</h1>
                        <p className="text-gray-600 mt-1">AI-powered behavior tracking and reporting</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/teacher/behavior/generate')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Brain className="w-5 h-5" />
                            AI Behavior Report
                        </button>

                        <button
                            onClick={() => {/* TODO: Open manual report modal */ }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Report Incident
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">AI Pending Review</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.aiPending}</p>
                            </div>
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Brain className="w-7 h-7 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Manual Pending</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.manualPending}</p>
                            </div>
                            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-7 h-7 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Approved</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
                            </div>
                            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Incidents</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-1 flex gap-2">
                    <button
                        onClick={() => setActiveTab('ai-pending')}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'ai-pending'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI Pending ({stats.aiPending})
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('manual-pending')}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'manual-pending'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            Manual Pending ({stats.manualPending})
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'approved'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approved ({stats.approved})
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading...</p>
                        </div>
                    ) : activeTab === 'ai-pending' ? (
                        aiDetections.length === 0 ? (
                            <EmptyState
                                icon={<Sparkles className="w-16 h-16 text-gray-300" />}
                                title="No AI Detections"
                                description="Generate an AI behavior report from a lecture to see detections here"
                                actionLabel="Generate AI Report"
                                onAction={() => navigate('/teacher/behavior/generate')}
                            />
                        ) : (
                            aiDetections.map(detection => (
                                <AIDetectionCard
                                    key={detection.id}
                                    detection={detection}
                                    onReview={() => setSelectedDetection(detection)}
                                />
                            ))
                        )
                    ) : activeTab === 'manual-pending' ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Manual incidents coming soon</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Approved incidents coming soon</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {selectedDetection && (
                <BehaviorReviewModal
                    detection={selectedDetection}
                    onClose={() => setSelectedDetection(null)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}

// Empty State Component
function EmptyState({ icon, title, description, actionLabel, onAction }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2"
                >
                    <Brain className="w-4 h-4" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// AI Detection Card Component
function AIDetectionCard({ detection, onReview }) {
    const getSeverityColor = (severity) => {
        const colors = {
            minor: 'bg-blue-100 text-blue-800 border-blue-300',
            moderate: 'bg-amber-100 text-amber-800 border-amber-300',
            serious: 'bg-orange-100 text-orange-800 border-orange-300',
            critical: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[severity] || colors.minor;
    };

    const getConfidenceColor = (confidence) => {
        const colors = {
            HIGH: 'bg-emerald-100 text-emerald-800',
            MEDIUM: 'bg-amber-100 text-amber-800',
            LOW: 'bg-gray-100 text-gray-800'
        };
        return colors[confidence] || colors.MEDIUM;
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{detection.student_name}</h3>
                            <p className="text-sm text-gray-600">{detection.behavior_type?.replace('_', ' ')}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-3">{detection.description}</p>

                    {/* Original Quote */}
                    <div className="bg-white/70 border-l-4 border-purple-400 p-3 mb-3 rounded">
                        <p className="text-sm text-gray-700 italic">"{detection.original_statement}"</p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(detection.severity)}`}>
                            {detection.severity}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(detection.ai_confidence)}`}>
                            {detection.ai_confidence} Confidence
                        </span>
                        {detection.is_positive && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Positive Behavior
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="ml-6">
                    <button
                        onClick={onReview}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Review & Approve
                    </button>
                </div>
            </div>
        </div>
    );
}
