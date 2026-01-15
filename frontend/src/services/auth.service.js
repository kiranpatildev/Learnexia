import api from './api';

export const authService = {
    async login(email, password) {
        // Get tokens
        const response = await api.post('/accounts/login/', { email, password });
        const { access, refresh } = response.data;

        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Fetch user data
        const userResponse = await api.get('/accounts/users/me/');
        const user = userResponse.data;

        // Store user data
        localStorage.setItem('user', JSON.stringify(user));

        return { access, refresh, user };
    },

    async register(userData) {
        const response = await api.post('/accounts/register/', userData);
        return response.data;
    },

    async logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    async getCurrentUser() {
        const response = await api.get('/accounts/users/me/');
        return response.data;
    },

    getStoredUser() {
        try {
            const user = localStorage.getItem('user');
            if (!user || user === 'undefined' || user === 'null') {
                return null;
            }
            return JSON.parse(user);
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('user');
            return null;
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },
};
