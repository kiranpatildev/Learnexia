import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    MessageSquare,
    Send,
    Search,
    Loader2
} from 'lucide-react';
import communicationService from '../../services/communication.service';
import { useAuthStore } from '../../store/authStore';

export function ParentMessagesPage() {
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Poll for new messages
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            if (selectedConversation.unread_count > 0) {
                markAsRead(selectedConversation.id);
            }
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
            const data = await communicationService.getConversations();
            const results = data.results || data || [];

            const formatted = results.map(conv => {
                let displayName = conv.title;
                let displayRole = 'Teacher'; // Default assumption for parent view

                if (conv.participants_info) {
                    const other = conv.participants_info.find(p => p.id !== user?.id);
                    if (other) {
                        if (!displayName) displayName = other.name;
                        if (other.role) displayRole = other.role.charAt(0).toUpperCase() + other.role.slice(1);
                    }
                } else if (!displayName && conv.participant_names) {
                    const otherNames = conv.participant_names.filter(name => name !== user?.first_name + ' ' + user?.last_name && name !== user?.username);
                    displayName = otherNames.length > 0 ? otherNames.join(', ') : conv.participant_names.join(', ');
                }

                return {
                    id: conv.id,
                    name: displayName || 'Unknown',
                    role: displayRole,
                    lastMessage: conv.last_message_preview?.text || 'No messages yet',
                    time: conv.last_message_preview ? new Date(conv.last_message_preview.timestamp).toLocaleString() : '',
                    unread: conv.unread_count,
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
                sender: msg.sender === user?.id ? 'me' : 'other',
                text: msg.message_text,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            setMessages(formatted);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        const tempId = Date.now();
        const msgContent = messageText;
        setMessageText('');

        try {
            setSending(true);
            setMessages(prev => [...prev, {
                id: tempId,
                sender: 'me',
                text: msgContent,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sending: true
            }]);

            const response = await communicationService.sendMessage(selectedConversation.id, msgContent);

            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? {
                    id: response.id,
                    sender: 'me',
                    text: response.message_text,
                    time: new Date(response.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                } : msg
            ));

            fetchConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            alert("Failed to send message");
            setMessageText(msgContent);
        } finally {
            setSending(false);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await communicationService.markConversationRead(conversationId);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread: 0 } : c
            ));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
                <p className="text-sm text-slate-600 mt-1">Communicate with teachers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Conversations List */}
                <Card className="lg:col-span-1 flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            {initialLoading ? (
                                <div className="text-center py-4 text-slate-500">Loading...</div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No conversations found</div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id
                                            ? 'bg-blue-50 border-2 border-blue-200'
                                            : 'border border-slate-200 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                                        {getInitials(conv.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{conv.name}</p>
                                                    <p className="text-xs text-slate-600">{conv.role}</p>
                                                </div>
                                            </div>
                                            {conv.unread > 0 && (
                                                <Badge variant="default" className="text-xs">{conv.unread}</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                                        <p className="text-xs text-slate-500 mt-1">{conv.time}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Message Thread */}
                <Card className="lg:col-span-2 flex flex-col h-full">
                    {selectedConversation ? (
                        <>
                            <CardHeader className="border-b shrink-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {getInitials(selectedConversation.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                                        <p className="text-sm text-slate-600">{selectedConversation.role}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {loading && messages.length === 0 ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="animate-spin text-blue-600" />
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-md p-3 rounded-lg ${message.sender === 'me'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-900'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.text}</p>
                                                    <div className={`flex items-center justify-end gap-1 mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-slate-500'}`}>
                                                        <p className="text-[10px]">{message.time}</p>
                                                        {message.sending && <Loader2 className="w-3 h-3 animate-spin" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 border-t shrink-0 bg-white">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type your message..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                        />
                                        <Button onClick={sendMessage} disabled={!messageText.trim() || sending}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="py-20 flex-1 flex flex-col items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No conversation selected</h3>
                                <p className="text-sm text-slate-600">
                                    Select a conversation to start messaging
                                </p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
