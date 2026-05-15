// src/services/productService.js
import api from './api';

export const productService = {
    // Get all products
    getAllProducts: async () => {
        try {
            const response = await api.get('/products?t=' + Date.now());
            console.log('Products API response:', response.data); // Check what backend returns
            console.log('Products API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get product by ID
    getProductById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            console.log('Product detail response:', response.data); // Check what backend returns
            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },

    // 🔥 NEW: Get all categories
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    // Create product (Admin only)
    createProduct: async (productData, images = []) => {
        try {
            const formData = new FormData();
            formData.append('product', JSON.stringify(productData));
            
            images.forEach(image => {
                formData.append('images', image);
            });
    
            const response = await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // 🔥 Response should include the created product with image IDs
            console.log('Product created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

     // ✅ NEW: Update product
     updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product ${id}:`, error);
            throw error;
        }
    },
    // 🔥 FIXED: Set primary image with API call
    setPrimaryImage: async (productId, imageId) => {
        try {
            console.log(`Setting image ${imageId} as primary for product ${productId}`);
            const response = await api.put(`/products/${productId}/images/${imageId}/primary`);
            return response.data;
        } catch (error) {
            console.error(`Error setting primary image:`, error);
            throw error;
        }
    },

    // ✅ NEW: Add images to product
    addProductImages: async (id, images) => {
        try {
            const formData = new FormData();
            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await api.post(`/products/${id}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error adding images to product ${id}:`, error);
            throw error;
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product ${id}:`, error);
            throw error;
        }
    },

     // ✅ NEW: Delete product image
     deleteProductImage: async (productId, imageId) => {
        try {
            const response = await api.delete(`/products/${productId}/images/${imageId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting image from product ${productId}:`, error);
            throw error;
        }
    }
};