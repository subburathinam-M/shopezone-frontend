// src/pages/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPackage, 
    FiEdit, 
    FiTrash2, 
    FiPlus,
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiChevronUp,
    FiDollarSign,
    FiBox,
    FiTag,
    FiImage,
    FiEye,
    FiX,
    FiStar,
    FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stockFilter, setStockFilter] = useState('all');
    
    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        productId: null,
        productDetails: null
    });

    useEffect(() => {
        fetchProducts();
        
        const handleRefresh = () => {
            console.log('Refreshing products list...');
            fetchProducts();
        };
        
        window.addEventListener('refreshProducts', handleRefresh);
        window.addEventListener('productsUpdated', handleRefresh);
        
        return () => {
            window.removeEventListener('refreshProducts', handleRefresh);
            window.removeEventListener('productsUpdated', handleRefresh);
        };
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchTerm, sortField, sortDirection, stockFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            
            // Filter out deleted products (soft delete)
            const activeProducts = data.filter(product => !product.isDeleted);
            console.log('Active products fetched:', activeProducts);
            setProducts(activeProducts);
            setFilteredProducts(activeProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Stock filter
        if (stockFilter !== 'all') {
            filtered = filtered.filter(product => {
                if (stockFilter === 'inStock') return product.stock > 0;
                if (stockFilter === 'lowStock') return product.stock > 0 && product.stock <= 10;
                if (stockFilter === 'outOfStock') return product.stock === 0;
                return true;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            
            if (sortField === 'price' || sortField === 'stock') {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredProducts(filtered);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle delete click - open modal
    const handleDeleteClick = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({
            isOpen: true,
            productId: product.id,
            productDetails: product
        });
    };

    // Handle confirm delete - SOFT DELETE
    const handleConfirmDelete = async () => {
        const { productId, productDetails } = deleteModal;
        
        setDeleteModal({ isOpen: false, productId: null, productDetails: null });
        
        try {
            toast.loading('Deleting product...', { id: 'delete-product' });
            
            // Call delete API - This should be soft delete in backend
            await productService.deleteProduct(productId);
            
            toast.dismiss('delete-product');
            
            // Remove from UI immediately (optimistic update)
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            
            toast.success(
                <div className="flex items-center">
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    <span>Product deleted successfully</span>
                </div>
            );
            
        } catch (error) {
            console.error('Failed to delete product:', error);
            toast.dismiss('delete-product');
            toast.error('Failed to delete product');
            
            // Refresh to restore if API failed
            await fetchProducts();
        }
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setDeleteModal({ isOpen: false, productId: null, productDetails: null });
    };

    const viewProductDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
        if (stock <= 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <FiChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />;
        return sortDirection === 'asc' ? 
            <FiChevronUp className="h-4 w-4 text-indigo-600" /> : 
            <FiChevronDown className="h-4 w-4 text-indigo-600" />;
    };

    const stats = {
        total: filteredProducts.length,
        inStock: filteredProducts.filter(p => p.stock > 0).length,
        lowStock: filteredProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
        outOfStock: filteredProducts.filter(p => p.stock === 0).length
    };

    if (loading) return <Spinner />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 sm:py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                                <FiPackage className="mr-2 sm:mr-3 text-indigo-600" size={24} />
                                Product Management
                            </h1>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">
                                Manage your product inventory
                            </p>
                        </div>
                        <Link to="/admin/products/add" className="w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                            >
                                <FiPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                Add New Product
                            </motion.button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 border-l-4 border-indigo-500"
                        >
                            <p className="text-xs sm:text-sm text-gray-500">Total Products</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">{stats.total}</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 border-l-4 border-green-500"
                        >
                            <p className="text-xs sm:text-sm text-gray-500">In Stock</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.inStock}</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 border-l-4 border-yellow-500"
                        >
                            <p className="text-xs sm:text-sm text-gray-500">Low Stock</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 border-l-4 border-red-500"
                        >
                            <p className="text-xs sm:text-sm text-gray-500">Out of Stock</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Search Products
                            </label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, brand, description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Stock Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Stock Status
                            </label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-white"
                            >
                                <option value="all">All Products</option>
                                <option value="inStock">In Stock</option>
                                <option value="lowStock">Low Stock (≤10)</option>
                                <option value="outOfStock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Products Table - Desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                <tr>
                                    {[
                                        { field: 'id', label: 'ID', icon: FiTag },
                                        { field: 'image', label: 'Image', icon: FiImage, sortable: false },
                                        { field: 'name', label: 'Name', icon: FiBox },
                                        { field: 'price', label: 'Price', icon: FiDollarSign },
                                        { field: 'stock', label: 'Stock', icon: FiPackage },
                                        { field: null, label: 'Actions', icon: null, sortable: false }
                                    ].map((column, index) => (
                                        <th
                                            key={index}
                                            className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer group"
                                            onClick={() => column.sortable !== false && handleSort(column.field)}
                                        >
                                            <div className="flex items-center space-x-1">
                                                {column.icon && <column.icon className="h-3 w-3 lg:h-4 lg:w-4" />}
                                                <span>{column.label}</span>
                                                {column.sortable !== false && <SortIcon field={column.field} />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredProducts.map((product, index) => {
                                        const stockStatus = getStockStatus(product.stock);
                                        return (
                                            <motion.tr
                                                key={product.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ backgroundColor: '#f9fafb' }}
                                                className="hover:shadow-md transition-all cursor-pointer"
                                                onClick={() => viewProductDetails(product)}
                                            >
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{product.id}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                    {product.images && product.images.length > 0 ? (
                                                        <div className="relative group">
                                                            <img 
                                                                src={`https://api-gateway-production-3d22.up.railway.app${product.images[0].imageUrl}`}
                                                                alt={product.name}
                                                                className="h-10 w-10 lg:h-12 lg:w-12 object-cover rounded-lg shadow-md group-hover:scale-110 transition-transform"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                                                }}
                                                            />
                                                            {product.images.length > 1 && (
                                                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                                                                    {product.images.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : product.imageUrls && product.imageUrls.length > 0 ? (
                                                        <img 
                                                        src={`https://api-gateway-production-3d22.up.railway.app${product.imageUrls[0]}`}
                                                            alt={product.name}
                                                            className="h-10 w-10 lg:h-12 lg:w-12 object-cover rounded-lg shadow-md"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <FiImage className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    {product.brand && (
                                                        <div className="text-xs text-indigo-600 mt-1">{product.brand}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">${product.price}</div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                                        <FiPackage className="mr-1 h-3 w-3" />
                                                        <span className="hidden sm:inline">{stockStatus.label}</span>
                                                        <span className="sm:hidden">({product.stock})</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-1 lg:space-x-2" onClick={(e) => e.stopPropagation()}>
                                                        <Link to={`/admin/products/edit/${product.id}`}>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-1.5 lg:p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
                                                                title="Edit"
                                                            >
                                                                <FiEdit className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                                            </motion.button>
                                                        </Link>
                                                        
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => handleDeleteClick(product, e)}
                                                            className="p-1.5 lg:p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                                        </motion.button>
                                                        
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => viewProductDetails(product)}
                                                            className="p-1.5 lg:p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                                                            title="View Details"
                                                        >
                                                            <FiEye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </motion.div>

                {/* Products Cards - Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:hidden space-y-3 sm:space-y-4"
                >
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
                            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, index) => {
                            const stockStatus = getStockStatus(product.stock);
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 space-y-3"
                                >
                                    {/* Product Image and Name */}
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {product.images && product.images.length > 0 ? (
                                                <div className="relative">
                                                    <img 
                                                        src={`https://api-gateway-production-3d22.up.railway.app${product.imageUrls[0]}`}
                                                        alt={product.name}
                                                        className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg shadow-md"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                                        }}
                                                    />
                                                    {product.images.length > 1 && (
                                                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                            {product.images.length}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FiImage className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                #{product.id} - {product.name}
                                            </h3>
                                            {product.brand && (
                                                <p className="text-xs text-indigo-600 mt-0.5">{product.brand}</p>
                                            )}
                                            <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                                                ${product.price}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                            <FiPackage className="mr-1 h-3 w-3" />
                                            {stockStatus.label} ({product.stock})
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                        <Link to={`/admin/products/edit/${product.id}`} className="flex-1">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all text-xs sm:text-sm font-medium"
                                            >
                                                <FiEdit className="mr-1.5 h-3.5 w-3.5" />
                                                Edit
                                            </motion.button>
                                        </Link>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => handleDeleteClick(product, e)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-xs sm:text-sm font-medium"
                                        >
                                            <FiTrash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Delete
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => viewProductDetails(product)}
                                            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs sm:text-sm font-medium"
                                        >
                                            <FiEye className="h-3.5 w-3.5" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>
            </div>

            {/* Product Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Details</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {/* Images */}
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                                        {selectedProduct.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={`https://api-gateway-production-3d22.up.railway.app${img.imageUrl}`}
                                                alt={`${selectedProduct.name} ${idx + 1}`}
                                                className="h-16 sm:h-20 w-full object-cover rounded-lg shadow-md"
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 sm:gap=4">
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900 text-sm">{selectedProduct.name}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Brand</p>
                                        <p className="font-medium text-gray-900 text-sm">{selectedProduct.brand || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="font-medium text-indigo-600 text-sm">${selectedProduct.price}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Stock</p>
                                        <p className={`font-medium text-sm ${
                                            selectedProduct.stock === 0 ? 'text-red-600' : 
                                            selectedProduct.stock <= 10 ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                            {selectedProduct.stock} units
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Category</p>
                                        <p className="font-medium text-gray-900 text-sm">{selectedProduct.category?.name || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Created At</p>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-700">{selectedProduct.description || 'No description available'}</p>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6 flex justify-end">
                                <Link to={`/admin/products/edit/${selectedProduct.id}`} className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
                                    >
                                        Edit Product
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message={deleteModal.productDetails ? 
                    `Are you sure you want to delete "${deleteModal.productDetails.name}"? This action cannot be undone.` : 
                    'Are you sure you want to delete this product? This action cannot be undone.'
                }
            />
        </div>
    );
};

export default AdminProducts;