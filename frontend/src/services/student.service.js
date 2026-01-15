import api from './api';

export const notesService = {
    async getNotes(params = {}) {
        const response = await api.get('/notes/', { params });
        return response.data;
    },

    async getNote(id) {
        const response = await api.get(`/notes/${id}/`);
        return response.data;
    },
};

export const quizService = {
    async getQuizzes(params = {}) {
        const response = await api.get('/quizzes/', { params });
        return response.data;
    },

    async getQuiz(id) {
        const response = await api.get(`/quizzes/${id}/`);
        return response.data;
    },

    async submitQuiz(id, answers) {
        const response = await api.post(`/quizzes/${id}/submit/`, { answers });
        return response.data;
    },
};

export const assignmentService = {
    async getAssignments(params = {}) {
        const response = await api.get('/assessments/assignments/', { params });
        return response.data;
    },

    async getAssignment(id) {
        const response = await api.get(`/assessments/assignments/${id}/`);
        return response.data;
    },

    async submitAssignment(id, formData) {
        const response = await api.post(`/assessments/assignments/${id}/submit/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export const dashboardService = {
    async getStats() {
        const response = await api.get('/gamification/student-stats/');
        return response.data;
    },

    async getRecentActivity() {
        const response = await api.get('/performance/recent-activity/');
        return response.data;
    },
};

export const leaderboardService = {
    async getLeaderboard(params = {}) {
        const response = await api.get('/gamification/leaderboard/', { params });
        return response.data;
    },
};
