import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    MessageSquare,
    Send,
    Search,
    User,
    Clock
} from 'lucide-react';

export function ParentMessagesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageText, setMessageText] = useState('');

    const conversations = [
        {
            id: 1,
            teacher: 'Mrs. Sarah Johnson',
            subject: 'Mathematics',
            lastMessage: 'Emma is doing great in class!',
            time: '2 hours ago',
            unread: 2,
        },
        {
            id: 2,
            teacher: 'Mr. David Smith',
            subject: 'Science',
            lastMessage: 'Please review the assignment',
            time: '1 day ago',
            unread: 0,
        },
    ];

    const messages = [
        {
            id: 1,
            sender: 'teacher',
            text: 'Hello! Emma is doing great in class. She scored 95% on the recent quiz.',
            time: '2 hours ago',
        },
        {
            id: 2,
            sender: 'parent',
            text: 'Thank you for the update! That\'s wonderful to hear.',
            time: '1 hour ago',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
                <p className="text-sm text-slate-600 mt-1">Communicate with teachers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <Card className="lg:col-span-1">
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
                    <CardContent>
                        <div className="space-y-2">
                            {conversations.map((conv) => (
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
                                                    {conv.teacher.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{conv.teacher}</p>
                                                <p className="text-xs text-slate-600">{conv.subject}</p>
                                            </div>
                                        </div>
                                        {conv.unread > 0 && (
                                            <Badge variant="default" className="text-xs">{conv.unread}</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                                    <p className="text-xs text-slate-500 mt-1">{conv.time}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Message Thread */}
                <Card className="lg:col-span-2">
                    {selectedConversation ? (
                        <>
                            <CardHeader className="border-b">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {selectedConversation.teacher.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{selectedConversation.teacher}</CardTitle>
                                        <p className="text-sm text-slate-600">{selectedConversation.subject}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-md p-3 rounded-lg ${message.sender === 'parent'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-slate-100 text-slate-900'
                                                }`}>
                                                <p className="text-sm">{message.text}</p>
                                                <p className={`text-xs mt-1 ${message.sender === 'parent' ? 'text-blue-100' : 'text-slate-500'
                                                    }`}>
                                                    {message.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type your message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                    />
                                    <Button>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="py-20">
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
