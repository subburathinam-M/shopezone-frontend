// src/services/orderService.js
import api from './api';

export const orderService = {
    // USER: Get their own orders
    getUserOrders: async () => {
        try {
            const response = await api.get('/orders');
            console.log('User orders fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    },

    // ADMIN: Get all orders with user details
    getAllOrders: async () => {
        try {
            const response = await api.get('/orders/all');
            console.log('All orders fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    },

    // Get order by ID
    getOrderById: async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    // Place order (single quantity)
    placeOrder: async (productId) => {
        try {
            const response = await api.post(`/orders/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    },

    // Place order with quantity
    placeOrderWithQuantity: async (productId, quantity) => {
        try {
            const response = await api.post(`/orders/${productId}/quantity/${quantity}`);
            return response.data;
        } catch (error) {
            console.error('Error placing order with quantity:', error);
            throw error;
        }
    }
};