import api from './api';

const communicationService = {
    // Conversations
    getConversations: async () => {
        const response = await api.get('/communication/conversations/');
        return response.data;
    },

    startConversation: async (participantIds, type = 'direct', title = '') => {
        const response = await api.post('/communication/conversations/start/', {
            participant_ids: participantIds,
            conversation_type: type,
            title
        });
        return response.data;
    },

    markConversationRead: async (id) => {
        const response = await api.post(`/communication/conversations/${id}/mark_read/`);
        return response.data;
    },

    // Messages
    getMessages: async (conversationId) => {
        const response = await api.get(`/communication/messages/?conversation=${conversationId}`);
        return response.data;
    },

    sendMessage: async (conversationId, content) => {
        const response = await api.post('/communication/messages/', {
            conversation: conversationId,
            message_text: content
        });
        return response.data;
    },

    markMessageRead: async (id) => {
        const response = await api.post(`/communication/messages/${id}/mark_read/`);
        return response.data;
    },

    getUnreadMessages: async () => {
        const response = await api.get('/communication/messages/unread/');
        return response.data;
    },

    // Users (for new chat)
    getAvailableStudents: async () => {
        const response = await api.get('/accounts/students/');
        return response.data;
    },

    getAvailableTeachers: async () => {
        const response = await api.get('/accounts/teachers/');
        return response.data;
    },

    getAvailableParents: async () => {
        const response = await api.get('/accounts/parents/');
        return response.data;
    },

    // Announcements
    getAnnouncements: async () => {
        const response = await api.get('/communication/announcements/');
        return response.data;
    },

    createAnnouncement: async (data) => {
        const response = await api.post('/communication/announcements/', data);
        return response.data;
    }
};

export default communicationService;
