import api from './api';

export const addressService = {
    // Get all addresses for the logged-in user
    getUserAddresses: async () => {
        try {
            const response = await api.get('/api/addresses');
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            if (error.response?.status === 401) {
                // Handle unauthorized - redirect to login
                window.location.href = '/login';
            }
            return [];
        }
    },

    // Add a new address
    addAddress: async (addressData) => {
        try {
            const response = await api.post('/api/addresses', addressData);
            return response.data;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    // Update an existing address
    updateAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/api/addresses/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    },

    // Delete an address
    deleteAddress: async (addressId) => {
        try {
            await api.delete(`/api/addresses/${addressId}`);
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    },

    // Set an address as default
    setDefaultAddress: async (addressId) => {
        try {
            await api.put(`/api/addresses/${addressId}/default`);
        } catch (error) {
            console.error('Error setting default address:', error);
            throw error;
        }
    }
};