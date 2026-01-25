import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    ClipboardCheck,
    AlertCircle,
    Calendar,
    CheckCircle,
    Sparkles,
    Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { LeafTopRight, FlowerAccent, WatercolorBlob } from '../../components/nature/BotanicalElements';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import '../../styles/nature-theme.css';

export function TeacherDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        todayAttendance: 0,
        pendingGrading: 0,
        lecturesThisWeek: 0,
        studentAlerts: 0,
    });
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const lecturesRes = await api.get('/lectures/lectures/', {
                params: { ordering: '-created_at', page_size: 5 }
            });
            const lectureData = lecturesRes.data.results || lecturesRes.data || [];
            setLectures(lectureData);

            const assignmentsRes = await api.get('/assignments/assignments/');
            const assignments = assignmentsRes.data.results || assignmentsRes.data || [];

            const incidentsRes = await api.get('/behavior/incidents/', {
                params: { status: 'pending' }
            });
            const incidents = incidentsRes.data.results || incidentsRes.data || [];

            setStats({
                todayAttendance: 0,
                pendingGrading: assignments.length,
                lecturesThisWeek: lectureData.length,
                studentAlerts: incidents.length,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen nature-bg relative overflow-hidden">

            {/* Watercolor Blob Decorations */}
            <WatercolorBlob
                color="#D4896B"
                size={300}
                opacity={0.08}
                className="watercolor-blob-1"
            />
            <WatercolorBlob
                color="#A8B89F"
                size={250}
                opacity={0.06}
                className="watercolor-blob-2"
            />

            {/* Main Content */}
            <div className="relative z-10 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-[#4A4A4A] mb-1">Lectures</h1>
                        <p className="text-[#7A7A7A]">Manage your lecture recordings and transcripts</p>
                    </div>
                    <Button
                        className="nature-btn flex items-center gap-2"
                        onClick={() => navigate('/teacher/lectures', { state: { openCreate: true } })}
                    >
                        <span className="text-xl">+</span>
                        Create Lecture
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="nature-card p-6 relative">
                    <div className="absolute top-0 right-0 opacity-30">
                        <LeafTopRight />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4896B] to-[#E8B4A0] flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-[#7A7A7A]">Total Lectures</p>
                            <h3 className="text-3xl font-bold text-[#4A4A4A]">{stats.lecturesThisWeek}</h3>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search lectures..."
                            className="nature-search pl-10"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select className="nature-search w-48">
                        <option>Sort by Date</option>
                        <option>Sort by Name</option>
                    </select>
                    <button className="p-3 nature-card hover:shadow-lg transition-all">
                        <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button className="p-3 nature-card hover:shadow-lg transition-all">
                        <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                </div>

                {/* Lectures Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-[#7A7A7A]">Loading...</div>
                    ) : lectures.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="w-16 h-16 text-[#D4896B] mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-[#4A4A4A] mb-2">No lectures yet</h3>
                            <p className="text-sm text-[#7A7A7A] mb-4">
                                Create your first lecture to get started
                            </p>
                            <Button
                                className="nature-btn"
                                onClick={() => navigate('/teacher/lectures', { state: { openCreate: true } })}
                            >
                                Create Lecture
                            </Button>
                        </div>
                    ) : (
                        lectures.map((lecture) => (
                            <div
                                key={lecture.id}
                                className="nature-card p-6 cursor-pointer group relative overflow-visible"
                                onClick={() => navigate(`/teacher/lectures/${lecture.id}`)}
                            >
                                {/* Flower Decoration */}
                                <div className="absolute -bottom-3 -right-3 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                                    <FlowerAccent />
                                </div>

                                {/* Card Content */}
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8FB569] to-[#A8B89F] flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`nature-badge ${lecture.status === 'published' ? 'nature-badge-success' : 'nature-badge-primary'}`}>
                                            {lecture.status}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-[#4A4A4A] mb-2 group-hover:text-[#D4896B] transition-colors">
                                        {lecture.title}
                                    </h3>
                                    <p className="text-sm text-[#7A7A7A] mb-4">
                                        {lecture.chapter || 'General'} • {lecture.topic || 'No topic'}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-[#7A7A7A]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(lecture.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <span>2700 min</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-4 border-t border-[#D4896B]/10">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-[#7A7A7A]">Generate Resources:</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#D4896B]/20 text-[#4A4A4A] hover:bg-[#F9F5F0] transition-colors text-xs font-medium flex items-center justify-center gap-1">
                                                <BookOpen className="w-3 h-3" />
                                                Notes
                                            </button>
                                            <button className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#D4896B]/20 text-[#4A4A4A] hover:bg-[#F9F5F0] transition-colors text-xs font-medium flex items-center justify-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                Flashcards
                                            </button>
                                            <button className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#D4896B]/20 text-[#4A4A4A] hover:bg-[#F9F5F0] transition-colors text-xs font-medium flex items-center justify-center gap-1">
                                                <ClipboardCheck className="w-3 h-3" />
                                                Quiz
                                            </button>
                                        </div>
                                    </div>

                                    {/* View Button */}
                                    <button className="w-full mt-4 py-2 rounded-lg bg-[#D4896B] text-white hover:bg-[#B86F54] transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
