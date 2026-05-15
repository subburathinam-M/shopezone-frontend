// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
// import { FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiGrid, 
    FiList, 
    FiFilter, 
    FiSearch,
    FiX,
    FiChevronDown,
    FiStar,
    FiTrendingUp,
    FiClock,
    FiAlertCircle,  // ✅ Add this
    FiRefreshCw     // ✅ Add this
} from 'react-icons/fi';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        
        const handleProductsUpdated = () => {
            console.log('Products updated, refreshing...');
            fetchProducts();
        };
        
        window.addEventListener('productsUpdated', handleProductsUpdated);
        window.addEventListener('refreshProducts', handleProductsUpdated);
        
        return () => {
            window.removeEventListener('productsUpdated', handleProductsUpdated);
            window.removeEventListener('refreshProducts', handleProductsUpdated);
        };
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            console.log('Products fetched:', data);
            
            const transformedData = data.map(product => ({
                ...product,
                imageUrls: product.images ? product.images.map(img => img.imageUrl) : (product.imageUrls || [])
            }));
            
            setProducts(transformedData);
            setFilteredProducts(transformedData);
            setFallbackMode(false);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            // setError('Failed to load products. Please try again.');
            // setFallbackMode(true);
             // 🔥 SHOW FALLBACK WITH PLACEHOLDERS
        setFallbackMode(true);
        setError('Product service is temporarily unavailable. Showing placeholder products.');
        
        // Create placeholder products
        const placeholders = [
            {
                id: 'placeholder-1',
                name: '🔧 Service Unavailable',
                price: 0,
                description: 'Product service is down. Please try again later.',
                stock: 0,
                brand: 'System',
                fallback: true,
                images: [],
                imageUrls: []
            },
            {
                id: 'placeholder-2',
                name: '📦 Pending Orders',
                price: 0,
                description: 'Your pending orders will be processed automatically when service is back.',
                stock: 0,
                brand: 'Info',
                fallback: true,
                images: [],
                imageUrls: []
            },
            {
                id: 'placeholder-3',
                name: '🔄 Retry Now',
                price: 0,
                description: 'Click retry button to check if service is back.',
                stock: 0,
                brand: 'Action',
                fallback: true,
                images: [],
                imageUrls: []
            }
        ];
        
        setProducts(placeholders);
        setFilteredProducts(placeholders);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category?.id === parseInt(selectedCategory) ||
                product.category?.name === selectedCategory
            );
        }

        // Price range filter
        filtered = filtered.filter(product => 
            product.price >= priceRange.min && product.price <= priceRange.max
        );

        // Sorting
        switch(sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                // Default sorting (by id or whatever)
                break;
        }

        setFilteredProducts(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSortBy('default');
        setPriceRange({ min: 0, max: 1000000 });
    };

    if (loading) return <Spinner />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
                        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                            Discover amazing products at the best prices
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-4 mb-8"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${
                                    viewMode === 'grid' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <FiGrid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${
                                    viewMode === 'list' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <FiList className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Filter Toggle (Mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-all"
                        >
                            <FiFilter className="h-5 w-5" />
                            <span>Filters</span>
                        </button>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="default">Sort by: Default</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>

                    {/* Filter Section */}
                    <AnimatePresence>
                        {(showFilters || window.innerWidth >= 1024) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price Range
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <span className="text-gray-500">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Clear Filters */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center space-x-2"
                                        >
                                            <FiX className="h-4 w-4" />
                                            <span>Clear Filters</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Results Count */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 flex items-center justify-between"
                >
                    <p className="text-gray-600">
                        Showing <span className="font-semibold text-indigo-600">{filteredProducts.length}</span> products
                    </p>
                    {searchTerm && (
                        <p className="text-sm text-gray-500">
                            Searching for: "{searchTerm}"
                        </p>
                    )}
                </motion.div>

               {/* Error Message */}
                {/* {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <FiX className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                        <button
                            onClick={fetchProducts}
                            className="px-3 py-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm flex items-center"
                        >
                            <FiRefreshCw className="mr-1 h-4 w-4" />
                            Retry
                        </button>
                    </motion.div>
                )} */}

                {/* Error Message */}
{error && (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
            fallbackMode 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-red-100 border border-red-400'
        }`}
    >
        <div className="flex items-center">
            {fallbackMode ? (
                <FiAlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            ) : (
                <FiX className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={fallbackMode ? 'text-yellow-700' : 'text-red-700'}>
                {error}
            </span>
        </div>
        <button
            onClick={fetchProducts}
            className="px-3 py-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm flex items-center"
        >
            <FiRefreshCw className="mr-1 h-4 w-4" />
            Retry
        </button>
    </motion.div>
)}

                {/* Products Grid/List */}
                {filteredProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiSearch className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                        }
                    >
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {viewMode === 'grid' ? (
                                        <ProductCard product={product} />
                                    ) : (
                                        <ProductCard product={product} listMode={true} />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Products;