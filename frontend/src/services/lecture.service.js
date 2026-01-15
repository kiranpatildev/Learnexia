import api from './api';

export const lectureService = {
    async getLectures(params = {}) {
        const response = await api.get('/lectures/', { params });
        return response.data;
    },

    async getLecture(id) {
        const response = await api.get(`/lectures/${id}/`);
        return response.data;
    },

    async createLecture(data) {
        const response = await api.post('/lectures/', data);
        return response.data;
    },

    async updateLecture(id, data) {
        const response = await api.patch(`/lectures/${id}/`, data);
        return response.data;
    },

    async approveTranscript(id) {
        const response = await api.post(`/lectures/${id}/approve_transcript/`);
        return response.data;
    },

    async generateNotes(id, data) {
        const response = await api.post(`/lectures/${id}/generate_notes/`, data);
        return response.data;
    },

    async generateQuiz(id, data) {
        const response = await api.post(`/lectures/${id}/generate_quiz/`, data);
        return response.data;
    },

    async generateFlashcards(id, data) {
        const response = await api.post(`/lectures/${id}/generate_flashcards/`, data);
        return response.data;
    },

    async detectBehaviors(id, data) {
        const response = await api.post(`/lectures/${id}/detect_behaviors/`, data);
        return response.data;
    },
};
