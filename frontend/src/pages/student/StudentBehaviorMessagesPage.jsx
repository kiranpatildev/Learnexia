import { useState, useEffect, useRef } from 'react';
import {
    AlertCircle, CheckCircle, Clock, Send, Search,
    TrendingUp, Filter, MessageCircle, User, Flame
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';
import communicationService from '../../services/communication.service';
import { useAuthStore } from '../../store/authStore';

export default function StudentBehaviorMessagesPage() {
    const { user } = useAuthStore();
    const messagesEndRef = useRef(null);

    // Behavior state
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        thisMonth: 0
    });
    const [selectedSeverity, setSelectedSeverity] = useState('All');
    const [loadingIncidents, setLoadingIncidents] = useState(true);

    // Messages state
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch behavior incidents
    useEffect(() => {
        fetchIncidents();
    }, []);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    // Auto-scroll messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchIncidents = async () => {
        try {
            setLoadingIncidents(true);
            const response = await api.get('/behavior/incidents/');
            const data = response.data.results || response.data || [];
            setIncidents(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoadingIncidents(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const resolved = data.filter(i => i.status === 'resolved').length;
        const pending = data.filter(i => i.status === 'pending').length;

        const now = new Date();
        const thisMonth = data.filter(i => {
            const incidentDate = new Date(i.created_at);
            return incidentDate.getMonth() === now.getMonth() &&
                incidentDate.getFullYear() === now.getFullYear();
        }).length;

        setStats({ total, resolved, pending, thisMonth });
    };

    const fetchConversations = async () => {
        try {
            const response = await communicationService.getConversations();
            const convos = response.results || response || [];

            // Transform conversations to add other_user_name
            const transformedConvos = convos.map(convo => {
                // Find the other user (not current user)
                const otherUser = convo.participants_info?.find(p => p.id !== user?.id);
                return {
                    ...convo,
                    other_user_name: otherUser?.name || 'Unknown User'
                };
            });

            setConversations(transformedConvos);

            // Auto-select first conversation if available
            if (transformedConvos.length > 0 && !selectedConversation) {
                handleSelectConversation(transformedConvos[0]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        await fetchMessages(conversation.id);
        await markAsRead(conversation.id);
    };

    const fetchMessages = async (conversationId) => {
        try {
            setLoadingMessages(true);
            const response = await communicationService.getMessages(conversationId);
            const msgs = response.results || response || [];

            // Transform messages to add content field from message_text
            const transformedMsgs = msgs.map(msg => ({
                ...msg,
                content: msg.message_text || msg.content || ''
            }));

            setMessages(transformedMsgs);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await communicationService.markConversationRead(conversationId);
            // Update conversation list
            setConversations(prev =>
                prev.map(c =>
                    c.id === conversationId ? { ...c, unread_count: 0 } : c
                )
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const response = await communicationService.sendMessage(
                selectedConversation.id,
                newMessage
            );

            // Transform response to add content field
            const transformedMsg = {
                ...response,
                content: response.message_text || response.content || ''
            };

            setMessages(prev => [...prev, transformedMsg]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            minor: 'bg-blue-100 text-blue-700 border-blue-200',
            moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            serious: 'bg-orange-100 text-orange-700 border-orange-200',
            critical: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[severity?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const filteredIncidents = selectedSeverity === 'All'
        ? incidents
        : incidents.filter(i => i.severity?.toLowerCase() === selectedSeverity.toLowerCase());

    const severityFilters = ['All', 'Minor', 'Moderate', 'Serious', 'Critical'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Behavior Records</h1>
                        <p className="text-sm text-gray-600">Hello {user?.first_name || 'Student'}!</p>
                        <p className="text-xs text-gray-500">Track your conduct and records</p>
                    </div>

                    {/* Character Avatars & Streak */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-16 bg-indigo-500 rounded-t-full rounded-b-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <div className="w-2 h-2 bg-white rounded-full ml-1"></div>
                            </div>
                            <div className="w-12 h-16 bg-orange-400 rounded-t-full rounded-b-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-900 rounded-full ml-1"></div>
                            </div>
                            <div className="w-12 h-16 bg-yellow-400 rounded-t-full rounded-b-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-900 rounded-full ml-1"></div>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="font-bold">{user?.day_streak || 0}</span>
                            <span className="text-xs text-gray-300">Streak</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Behavior Records (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-gray-600 font-medium">Total Incident</p>
                                        <TrendingUp className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Taberna complaints</p>
                                    <div className="inline-flex items-center justify-center bg-yellow-400 text-gray-900 font-bold text-2xl px-4 py-2 rounded-full">
                                        {stats.total.toString().padStart(2, '0')}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-gray-600 font-medium">Resolved</p>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Incidents</p>
                                    <div className="inline-flex items-center justify-center bg-blue-500 text-white font-bold text-2xl px-4 py-2 rounded-full">
                                        {stats.resolved.toString().padStart(2, '0')}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-gray-600 font-medium">Pending</p>
                                        <Clock className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Incidents</p>
                                    <div className="inline-flex items-center justify-center bg-orange-500 text-white font-bold text-2xl px-4 py-2 rounded-full">
                                        {stats.pending.toString().padStart(2, '0')}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-gray-600 font-medium">This Month</p>
                                        <TrendingUp className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Incidents</p>
                                    <div className="inline-flex items-center justify-center text-green-500 font-bold text-2xl px-4 py-2">
                                        {stats.thisMonth.toString().padStart(2, '0')}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Incidents List */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                {/* Filter Tabs */}
                                <div className="flex items-center gap-2 mb-6 flex-wrap">
                                    <span className="text-sm text-gray-600 mr-2">sorted by:</span>
                                    {severityFilters.map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setSelectedSeverity(filter)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSeverity === filter
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                {/* Incidents */}
                                <div className="space-y-3">
                                    {loadingIncidents ? (
                                        <div className="text-center py-8 text-gray-500">Loading incidents...</div>
                                    ) : filteredIncidents.length === 0 ? (
                                        <div className="text-center py-8">
                                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                            <p className="text-gray-600">No incidents found</p>
                                            <p className="text-sm text-gray-500">Keep up the good behavior!</p>
                                        </div>
                                    ) : (
                                        filteredIncidents.map((incident) => (
                                            <div
                                                key={incident.id}
                                                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                                                            <Badge className={`text-xs ${getSeverityColor(incident.severity)}`}>
                                                                {incident.severity}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{incident.description}</p>
                                                    </div>
                                                    <button className="px-4 py-1.5 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-800 transition-colors">
                                                        Understand more
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                    <span>Reported by: {incident.reported_by_name || 'Teacher'}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(incident.created_at)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Messages (1/3) */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-sm h-[600px] flex flex-col">
                            <CardContent className="p-0 flex flex-col h-full">
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200">
                                    {selectedConversation ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedConversation(null)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-900" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {selectedConversation.other_user_name || 'Teacher'}
                                                </h3>
                                                <p className="text-xs text-gray-500">Teacher</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5 text-gray-400" />
                                            <h3 className="font-semibold text-gray-900">Messages</h3>
                                        </div>
                                    )}
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {!selectedConversation ? (
                                        <div className="space-y-2">
                                            {conversations.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500">No conversations yet</p>
                                                    <p className="text-sm text-gray-400">Your teachers will message you here</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-gray-500 mb-3">Select a conversation</p>
                                                    {conversations.map((convo) => (
                                                        <div
                                                            key={convo.id}
                                                            onClick={() => handleSelectConversation(convo)}
                                                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all border border-gray-200"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <User className="w-5 h-5 text-gray-900" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                                            {convo.other_user_name}
                                                                        </h4>
                                                                        {convo.unread_count > 0 && (
                                                                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                                                {convo.unread_count}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {convo.last_message_preview && (
                                                                        <p className="text-xs text-gray-500 truncate">
                                                                            {convo.last_message_preview.text}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    ) : loadingMessages ? (
                                        <div className="text-center py-12 text-gray-500">Loading messages...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No messages yet</p>
                                            <p className="text-sm text-gray-400">Start the conversation!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[80%] ${message.sender === user?.id ? 'order-2' : 'order-1'}`}>
                                                        <div
                                                            className={`px-4 py-2 rounded-2xl ${message.sender === user?.id
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                                }`}
                                                        >
                                                            <p className="text-sm">{message.content}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1 px-2">
                                                            {formatMessageTime(message.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Message Input */}
                                {selectedConversation && (
                                    <div className="p-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={!newMessage.trim()}
                                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
