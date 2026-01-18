import { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export function MessagesPage() {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await api.get('/communication/conversations/');
            setConversations(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            // Mock data for demo
            setConversations([
                {
                    id: 1,
                    participant: {
                        name: 'Alex Thompson',
                        role: 'Student - Mathematics 101',
                        avatar: null
                    },
                    last_message: 'Thank you for the help!',
                    last_message_time: '2 hours ago',
                    unread: true
                },
                {
                    id: 2,
                    participant: {
                        name: 'Michael Thompson',
                        role: 'Parent of Alex Thompson',
                        avatar: null
                    },
                    last_message: 'How is Alex doing?',
                    last_message_time: 'Yesterday',
                    unread: false
                },
                {
                    id: 3,
                    participant: {
                        name: 'Emma Wilson',
                        role: 'Student - Mathematics 101',
                        avatar: null
                    },
                    last_message: 'Question about homework',
                    last_message_time: '2 days ago',
                    unread: false
                }
            ]);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            setLoading(true);
            const response = await api.get(`/communication/conversations/${conversationId}/messages/`);
            setMessages(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Mock data for demo
            if (conversationId === 1) {
                setMessages([
                    {
                        id: 1,
                        sender: 'student',
                        content: 'Hi Mrs. Johnson, I had a question about the homework.',
                        timestamp: '2:20 PM',
                        is_mine: false
                    },
                    {
                        id: 2,
                        sender: 'teacher',
                        content: 'Of course Alex, what do you need help with?',
                        timestamp: '2:22 PM',
                        is_mine: true
                    },
                    {
                        id: 3,
                        sender: 'student',
                        content: "I'm stuck on problem 5 about quadratic equations.",
                        timestamp: '2:25 PM',
                        is_mine: false
                    },
                    {
                        id: 4,
                        sender: 'teacher',
                        content: 'Let me explain. First, you need to identify the coefficients a, b, and c...',
                        timestamp: '2:40 PM',
                        is_mine: true
                    },
                    {
                        id: 5,
                        sender: 'student',
                        content: 'Thank you for the help!',
                        timestamp: '2:45 PM',
                        is_mine: false
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setSending(true);
            const messageData = {
                conversation: selectedConversation.id,
                content: newMessage,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })
            };

            await api.post(`/communication/conversations/${selectedConversation.id}/messages/`, messageData);

            // Add message to UI immediately
            setMessages(prev => [...prev, {
                ...messageData,
                id: Date.now(),
                is_mine: true
            }]);

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            // Still add to UI for demo
            setMessages(prev => [...prev, {
                id: Date.now(),
                content: newMessage,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                is_mine: true
            }]);
            setNewMessage('');
        } finally {
            setSending(false);
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

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* Left Panel - Conversations List */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
                    <p className="text-sm text-gray-600">Communicate with students and parents</p>
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
                    {filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedConversation?.id === conversation.id
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-blue-700">
                                        {getInitials(conversation.participant?.name)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {conversation.participant?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {conversation.participant?.role}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {conversation.last_message_time}
                                            </span>
                                            {conversation.unread && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                        {conversation.last_message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Chat View */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
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
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Loading messages...</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-md px-4 py-2 rounded-2xl ${message.is_mine
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.is_mine ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                {message.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ maxHeight: '120px' }}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg mb-2">Select a conversation</p>
                            <p className="text-gray-400 text-sm">
                                Choose a conversation from the list to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
