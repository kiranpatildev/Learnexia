import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export function AIBehaviorReportPage() {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLectures();
    }, []);

    const fetchLectures = async () => {
        try {
            setLoading(true);
            console.log('[AI Behavior] Fetching lectures...');

            const response = await api.get('/lectures/lectures/', {
                params: {
                    ordering: '-created_at'
                }
            });

            console.log('[AI Behavior] Response:', response.data);
            const lecturesList = response.data.results || response.data || [];
            console.log('[AI Behavior] Lectures:', lecturesList);

            setLectures(lecturesList);
            setError(null);
        } catch (err) {
            console.error('[AI Behavior] Error:', err);
            setError('Failed to load lectures: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!selectedLecture) {
            alert('Please select a lecture first');
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            console.log('[AI Behavior] Generating report for:', selectedLecture.id);

            const response = await api.post(`/lectures/lectures/${selectedLecture.id}/detect_behaviors/`, {
                sensitivity: 'MEDIUM'
            });

            console.log('[AI Behavior] Generation response:', response.data);

            if (response.data.success) {
                alert(`Generated ${response.data.detected_count} behavior detection(s)!`);
                navigate('/teacher/behavior');
            } else {
                setError(response.data.message || 'Failed to generate report');
            }
        } catch (err) {
            console.error('[AI Behavior] Generation error:', err);
            setError(err.response?.data?.message || 'Failed to generate behavior report');
        } finally {
            setGenerating(false);
        }
    };

    console.log('[AI Behavior] Render state:', { loading, lectures: lectures.length, error });

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(to bottom right, #faf5ff, #eff6ff, #eef2ff)',
                padding: '24px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #9333ea',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    <p style={{ color: '#4b5563' }}>Loading lectures...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #faf5ff, #eff6ff, #eef2ff)',
            padding: '24px'
        }}>
            <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <button
                        onClick={() => navigate('/teacher/behavior')}
                        style={{
                            padding: '8px 16px',
                            color: '#374151',
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ← Back to Behavior
                    </button>
                </div>

                {/* Main Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    marginBottom: '24px'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(to right, #9333ea, #2563eb)',
                        color: 'white',
                        padding: '32px'
                    }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                            AI Behavior Report Generator
                        </h1>
                        <p style={{ opacity: 0.9 }}>
                            Automatically detect behavioral mentions from lecture transcripts
                        </p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '32px' }}>
                        {/* Error */}
                        {error && (
                            <div style={{
                                background: '#fef2f2',
                                border: '2px solid #fecaca',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '24px'
                            }}>
                                <p style={{ color: '#991b1b', fontWeight: '500' }}>{error}</p>
                            </div>
                        )}

                        {/* Lecture Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#111827',
                                marginBottom: '12px'
                            }}>
                                Select Lecture
                            </label>

                            {lectures.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '64px 16px',
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    border: '2px dashed #d1d5db'
                                }}>
                                    <p style={{ color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                                        No lectures with transcripts found
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Create a lecture and add a transcript to get started
                                    </p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '384px', overflowY: 'auto' }}>
                                    {lectures.map((lecture) => (
                                        <button
                                            key={lecture.id}
                                            onClick={() => {
                                                console.log('[AI Behavior] Lecture clicked:', lecture.title, lecture.id);
                                                console.log('[AI Behavior] Current selected:', selectedLecture?.id);
                                                setSelectedLecture(lecture);
                                                console.log('[AI Behavior] New selected:', lecture.id);
                                            }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '20px',
                                                marginBottom: '12px',
                                                borderRadius: '12px',
                                                border: selectedLecture?.id === lecture.id
                                                    ? '2px solid #9333ea'
                                                    : '2px solid #e5e7eb',
                                                background: selectedLecture?.id === lecture.id
                                                    ? '#faf5ff'
                                                    : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontWeight: 'bold',
                                                        color: '#111827',
                                                        fontSize: '18px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {lecture.title}
                                                    </h3>
                                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                                        {lecture.classroom?.name || 'Unknown Class'}
                                                    </p>
                                                </div>
                                                {selectedLecture?.id === lecture.id && (
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        background: '#9333ea',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '20px',
                                                        fontWeight: 'bold',
                                                        flexShrink: 0,
                                                        marginLeft: '16px'
                                                    }}>
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            paddingTop: '24px',
                            borderTop: '2px solid #f3f4f6'
                        }}>
                            <button
                                onClick={() => navigate('/teacher/behavior')}
                                disabled={generating}
                                style={{
                                    padding: '12px 24px',
                                    border: '2px solid #d1d5db',
                                    background: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    opacity: generating ? 0.5 : 1
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                disabled={!selectedLecture || generating || lectures.length === 0}
                                style={{
                                    padding: '12px 32px',
                                    background: 'linear-gradient(to right, #9333ea, #2563eb)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    minWidth: '220px',
                                    opacity: (!selectedLecture || generating || lectures.length === 0) ? 0.5 : 1
                                }}
                            >
                                {generating ? 'Analyzing Transcript...' : 'Generate Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
}
