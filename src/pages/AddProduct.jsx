// src/pages/AddProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUpload, 
    FiX, 
    FiStar,
    FiPackage,
    FiDollarSign,
    FiTag,
    FiBox,
    FiImage,
    FiArrowLeft,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        brand: '',
        description: '',
        stock: '0',
        categoryId: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'name':
                if (!value) error = 'Product name is required';
                else if (value.length < 3) error = 'Name must be at least 3 characters';
                break;
            case 'price':
                if (!value) error = 'Price is required';
                else if (isNaN(value) || parseFloat(value) <= 0) error = 'Price must be greater than 0';
                break;
            case 'stock':
                if (!value) error = 'Stock is required';
                else if (isNaN(value) || parseInt(value) < 0) error = 'Stock must be 0 or greater';
                break;
            case 'categoryId':
                if (!value) error = 'Please select a category';
                break;
            default:
                break;
        }
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate file types
        const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            toast.error('Please upload only image files');
            return;
        }

        // Validate file size (max 10MB)
        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            toast.error('Some files exceed 10MB limit');
            return;
        }

        setImages(prev => [...prev, ...files]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
        
        // First image auto-set as primary
        if (images.length === 0 && files.length > 0) {
            setPrimaryImageIndex(0);
        }
    };

    const setAsPrimary = (index) => {
        setPrimaryImageIndex(index);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        
        if (index === primaryImageIndex) {
            setPrimaryImageIndex(0);
        } else if (index < primaryImageIndex) {
            setPrimaryImageIndex(prev => prev - 1);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        
        if (images.length === 0) {
            toast.error('Please upload at least one product image');
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setLoading(true);

        try {
            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                brand: formData.brand,
                description: formData.description,
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                primaryImageIndex: primaryImageIndex
            };

            await productService.createProduct(productData, images);
            
            toast.success(
                <div className="flex items-center">
                    <FiCheckCircle className="mr-2 h-5 w-5" />
                    <span>Product created successfully!</span>
                </div>
            );
            
            window.dispatchEvent(new CustomEvent('productsUpdated'));
            navigate('/admin/products');
        } catch (error) {
            console.error('Failed to create product:', error);
            toast.error(
                <div className="flex items-center">
                    <FiAlertCircle className="mr-2 h-5 w-5" />
                    <span>Failed to create product</span>
                </div>
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 sm:py-6 md:py-8">
            <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/admin/products')}
                            className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex-shrink-0"
                        >
                            <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </motion.button>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                                <FiPackage className="mr-2 sm:mr-3 text-indigo-600 flex-shrink-0" size={24} />
                                <span className="truncate">Add New Product</span>
                            </h1>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">
                                Fill in the details to add a new product to your inventory
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                    <FiBox className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Name */}
                                    <div className="sm:col-span-2 lg:col-span-1">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                            Product Name *
                                        </label>
                                        <div className="relative">
                                            <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border text-sm sm:text-base ${
                                                    errors.name && touched.name
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-indigo-500'
                                                } rounded-xl focus:outline-none focus:ring-2 transition-all`}
                                                placeholder="e.g., iPhone 15 Pro"
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.name && touched.name && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-xs text-red-600 flex items-center"
                                                >
                                                    <FiAlertCircle className="mr-1 h-3 w-3" />
                                                    {errors.name}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Brand */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                                            placeholder="e.g., Apple"
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                            Price * (USD)
                                        </label>
                                        <div className="relative">
                                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                min="0"
                                                step="0.01"
                                                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border text-sm sm:text-base ${
                                                    errors.price && touched.price
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-indigo-500'
                                                } rounded-xl focus:outline-none focus:ring-2 transition-all`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.price && touched.price && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-xs text-red-600 flex items-center"
                                                >
                                                    <FiAlertCircle className="mr-1 h-3 w-3" />
                                                    {errors.price}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            min="0"
                                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border text-sm sm:text-base ${
                                                errors.stock && touched.stock
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500'
                                            } rounded-xl focus:outline-none focus:ring-2 transition-all`}
                                            placeholder="0"
                                        />
                                        <AnimatePresence>
                                            {errors.stock && touched.stock && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-xs text-red-600 flex items-center"
                                                >
                                                    <FiAlertCircle className="mr-1 h-3 w-3" />
                                                    {errors.stock}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Category */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                            Category *
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border text-sm sm:text-base ${
                                                errors.categoryId && touched.categoryId
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500'
                                            } rounded-xl focus:outline-none focus:ring-2 transition-all bg-white`}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <AnimatePresence>
                                            {errors.categoryId && touched.categoryId && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-xs text-red-600 flex items-center"
                                                >
                                                    <FiAlertCircle className="mr-1 h-3 w-3" />
                                                    {errors.categoryId}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base resize-none"
                                    placeholder="Enter product description..."
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                    <FiImage className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                    Product Images
                                </h2>

                                {/* Upload Area */}
                                <div className="mt-2 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors cursor-pointer">
                                    <div className="space-y-1 sm:space-y-2 text-center">
                                        <FiUpload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                                        <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600 items-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                <span>Upload files</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <p className="sm:pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 10MB each
                                        </p>
                                    </div>
                                </div>

                                {/* Image Previews */}
                                {previewUrls.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 sm:mt-6"
                                    >
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                            Preview Images (Click star to set as primary)
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                            {previewUrls.map((url, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="relative group"
                                                >
                                                    <div className={`relative rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg ${
                                                        index === primaryImageIndex ? 'ring-2 sm:ring-4 ring-yellow-400' : ''
                                                    }`}>
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-24 sm:h-28 md:h-32 w-full object-cover"
                                                        />
                                                        
                                                        {/* Overlay - Always visible on mobile, hover on desktop */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        {/* Action Buttons */}
                                                        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                onClick={() => setAsPrimary(index)}
                                                                className={`p-1 sm:p-1.5 rounded-full ${
                                                                    index === primaryImageIndex
                                                                        ? 'bg-yellow-400 text-white'
                                                                        : 'bg-white text-gray-700 hover:bg-yellow-400 hover:text-white'
                                                                } shadow-lg transition-all`}
                                                                title="Set as primary"
                                                            >
                                                                <FiStar className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                                                    index === primaryImageIndex ? 'fill-current' : ''
                                                                }`} />
                                                            </motion.button>
                                                        </div>
                                                        
                                                        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                                                                title="Delete"
                                                            >
                                                                <FiX className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </motion.button>
                                                        </div>
                                                        
                                                        {/* Primary Badge */}
                                                        {index === primaryImageIndex && (
                                                            <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 bg-yellow-400 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
                                                                Primary
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => navigate('/admin/products')}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            Create Product
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AddProduct;