// src/services/adminService.js
import api from './api';

export const adminService = {
    // Get all users
    getAllUsers: async () => {
        try {
            console.log('Fetching users from API...');
            const response = await api.get('/admin/users');
            console.log('Users response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (id) => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    },

    // Toggle user status (activate/deactivate)
    toggleUserStatus: async (id) => {
        try {
            const response = await api.put(`/admin/users/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling user status ${id}:`, error);
            throw error;
        }
    },

    // Delete user
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    }
};