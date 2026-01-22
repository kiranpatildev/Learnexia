/**
 * Games API Service
 * Handles all game-related API calls
 */

import api from './api';

const gamesService = {
    /**
     * Get all available game templates
     */
    getGameTemplates: async () => {
        const response = await api.get('/games/templates/');
        return response.data;
    },

    /**
     * Get all games (filtered by role)
     * @param {Object} params - Query parameters
     */
    getGames: async (params = {}) => {
        const response = await api.get('/games/games/', { params });
        return response.data;
    },

    /**
     * Get game details
     * @param {number} gameId - Game ID
     */
    getGameDetail: async (gameId) => {
        const response = await api.get(`/games/games/${gameId}/`);
        return response.data;
    },

    /**
     * Generate a new game (Teacher only)
     * @param {Object} data - Generation parameters
     */
    generateGame: async (data) => {
        const response = await api.post('/games/games/generate/', data);
        return response.data;
    },

    /**
     * Publish or unpublish a game (Teacher only)
     * @param {number} gameId - Game ID
     * @param {boolean} isPublished - Publish status
     */
    publishGame: async (gameId, isPublished) => {
        const response = await api.patch(`/games/games/${gameId}/publish/`, {
            is_published: isPublished
        });
        return response.data;
    },

    /**
     * Start a game session
     * @param {number} gameId - Game ID
     */
    startGame: async (gameId) => {
        const response = await api.post(`/games/games/${gameId}/start/`);
        return response.data;
    },

    /**
     * Get leaderboard for a game
     * @param {number} gameId - Game ID
     * @param {Object} params - Query parameters
     */
    getLeaderboard: async (gameId, params = {}) => {
        const response = await api.get(`/games/games/${gameId}/leaderboard/`, { params });
        return response.data;
    },

    /**
     * Submit an answer
     * @param {number} attemptId - Attempt ID
     * @param {Object} answerData - Answer data
     */
    submitAnswer: async (attemptId, answerData) => {
        const response = await api.post(`/games/attempts/${attemptId}/answer/`, answerData);
        return response.data;
    },

    /**
     * Get game results
     * @param {number} attemptId - Attempt ID
     */
    getResults: async (attemptId) => {
        const response = await api.get(`/games/attempts/${attemptId}/results/`);
        return response.data;
    },

    /**
     * Get user's game attempts
     * @param {Object} params - Query parameters
     */
    getAttempts: async (params = {}) => {
        const response = await api.get('/games/attempts/', { params });
        return response.data;
    },
};

export default gamesService;
