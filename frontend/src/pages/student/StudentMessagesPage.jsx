import { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import communicationService from '../../services/communication.service';
import { useAuthStore } from '../../store/authStore';

export function StudentMessagesPage() {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // State for New Chat Modal
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [startingChat, setStartingChat] = useState(false);

    // Poll for new messages every 30 seconds
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            // Mark as read when opening
            if (selectedConversation.unread_count > 0) {
                markAsRead(selectedConversation.id);
            }
        }
    }, [selectedConversation]);

    // Fetch teachers when modal opens
    useEffect(() => {
        if (isNewChatOpen && availableTeachers.length === 0) {
            fetchTeachers();
        }
    }, [isNewChatOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const data = await communicationService.getConversations();
            const results = data.results || data || [];

            // Transform data for UI
            const formatted = results.map(conv => {
                let displayName = conv.title;
                if (conv.participants_info) {
                    const other = conv.participants_info.find(p => p.id !== user?.id);
                    if (other) {
                        if (!displayName) displayName = other.name;
                        // Display role? Teachers are always teachers in student view context usually
                        // But we can show subject if available? Not available in user object easily.
                    }
                } else if (!displayName && conv.participant_names) {
                    const otherNames = conv.participant_names.filter(name => name !== user?.first_name + ' ' + user?.last_name && name !== user?.username);
                    displayName = otherNames.length > 0 ? otherNames.join(', ') : conv.participant_names.join(', ');
                }

                return {
                    id: conv.id,
                    participant: {
                        name: displayName || 'Unknown',
                        role: conv.conversation_type === 'group' ? 'Group' : 'Direct Message',
                        avatar: null
                    },
                    last_message: conv.last_message_preview?.text || 'No messages yet',
                    last_message_time: conv.last_message_preview ? new Date(conv.last_message_preview.timestamp).toLocaleDateString() : '',
                    unread: conv.unread_count > 0,
                    unread_count: conv.unread_count,
                    raw: conv
                };
            });
            setConversations(formatted);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            setLoading(true);
            const data = await communicationService.getMessages(conversationId);
            const results = data.results || data || [];

            const formatted = results.map(msg => ({
                id: msg.id,
                sender: msg.sender_name,
                sender_id: msg.sender,
                content: msg.message_text,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                is_mine: msg.sender === user?.id
            }));

            setMessages(formatted);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const data = await communicationService.getAvailableTeachers();
            setAvailableTeachers(data.results || data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const tempId = Date.now();
        const msgContent = newMessage;
        setNewMessage(''); // optimistic clear

        try {
            setSending(true);

            // Optimistic Update
            setMessages(prev => [...prev, {
                id: tempId,
                sender: 'Me',
                content: msgContent,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                is_mine: true,
                sending: true
            }]);

            const response = await communicationService.sendMessage(selectedConversation.id, msgContent);

            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? {
                    id: response.id,
                    sender: response.sender_name,
                    content: response.message_text,
                    timestamp: new Date(response.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    is_mine: true
                } : msg
            ));

            fetchConversations();

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            alert("Failed to send message. Please try again.");
            setNewMessage(msgContent);
        } finally {
            setSending(false);
        }
    };

    const handleStartChat = async (userId) => {
        try {
            setStartingChat(true);
            const data = await communicationService.startConversation([userId]);
            fetchConversations();
            setIsNewChatOpen(false);
        } catch (error) {
            console.error('Error starting chat:', error);
            alert("Failed to start conversation.");
        } finally {
            setStartingChat(false);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await communicationService.markConversationRead(conversationId);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread: false, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
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

    const filteredConversations = conversations.filter(conv =>
        conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTeachers = availableTeachers.filter(t =>
        t.user?.full_name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    return (
        <div className="h-screen bg-gray-50 flex relative">
            {/* Left Panel - Conversations List */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
                        <p className="text-sm text-gray-600">Your conversations</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => setIsNewChatOpen(true)}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {initialLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading chats...</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No conversations found.
                            <br />
                            <button
                                onClick={() => setIsNewChatOpen(true)}
                                className="text-blue-600 font-semibold mt-2 hover:underline"
                            >
                                Message a Teacher
                            </button>
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => setSelectedConversation(conversation)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedConversation?.id === conversation.id
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-blue-700">
                                            {getInitials(conversation.participant?.name)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {conversation.participant?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {conversation.participant?.role}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {conversation.last_message_time}
                                                </span>
                                                {conversation.unread && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-sm truncate ${conversation.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {conversation.last_message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Chat View */}
            <div className="flex-1 flex flex-col h-full bg-white">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-700">
                                        {getInitials(selectedConversation.participant?.name)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {selectedConversation.participant?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedConversation.participant?.role}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {loading && messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${message.is_mine
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                            <p className={`text-[10px] mt-1.5 text-right ${message.is_mine ? 'text-blue-100' : 'text-gray-400'
                                                }`}>
                                                {message.timestamp}
                                                {message.sending && ' • Sending...'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] max-h-32"
                                    style={{ maxHeight: '120px' }}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0 shadow-lg"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                <div className="bg-blue-50 p-4 rounded-full">
                                    <Search className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-4">
                                Choose a conversation from the list or start a new one to ask your teachers for help.
                            </p>
                            <Button
                                onClick={() => setIsNewChatOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Start New Conversation
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {isNewChatOpen && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold">New Message to Teacher</h3>
                            <button
                                onClick={() => setIsNewChatOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search teachers..."
                                value={teacherSearch}
                                onChange={(e) => setTeacherSearch(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {filteredTeachers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No teachers found
                                </div>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <div
                                        key={teacher.id}
                                        onClick={() => handleStartChat(teacher.user.id)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                            {getInitials(teacher.user?.full_name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{teacher.user?.full_name}</p>
                                            <p className="text-xs text-gray-500">{teacher.user?.email}</p>
                                        </div>
                                        {startingChat && <div className="ml-auto animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
