// src/services/userService.js
import api from './api';

export const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/api/users/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/api/users/profile', profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
};