import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set) => ({
    user: authService.getStoredUser(),
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { user } = await authService.login(email, password);
            set({ user, isAuthenticated: true, loading: false });
            return user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Login failed';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    logout: async () => {
        await authService.logout();
        set({ user: null, isAuthenticated: false });
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const data = await authService.register(userData);
            set({ loading: false });
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
