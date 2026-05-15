// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPackage, 
    FiCheckCircle, 
    FiClock, 
    FiXCircle, 
    FiImage,
    FiShoppingBag,
    FiCalendar,
    FiDollarSign,
    FiHash,
    FiShoppingCart,
    FiFilter,
    FiX,
    FiTrendingUp,
    FiPieChart,
    FiTrash2,
    FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [deletingOrderId, setDeletingOrderId] = useState(null);
    const { user } = useAuth();

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        orderId: null,
        orderDetails: null
    });

    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrdersWithProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [orders, filterStatus, filterPaymentMethod, sortOrder, searchQuery]);

    const fetchOrdersWithProducts = async () => {
        try {
            setLoading(true);
            const ordersData = await orderService.getUserOrders();
            setOrders(ordersData);
            
            if (ordersData.length > 0) {
                const productIds = [...new Set(ordersData.map(order => order.productId))];
                const products = {};
                
                await Promise.all(productIds.map(async (id) => {
                    try {
                        const product = await productService.getProductById(id);
                        if (product) products[id] = product;
                    } catch (error) {
                        console.error(`Failed to fetch product ${id}:`, error);
                    }
                }));
                
                setProductDetails(products);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally { setLoading(false); }
    };

    const handleDeleteClick = (order, e) => {
        e.preventDefault(); e.stopPropagation();
        setDeleteModal({ isOpen: true, orderId: order.id, orderDetails: order });
    };

    const handleConfirmDelete = async () => {
        const { orderId } = deleteModal;
        setDeleteModal({ isOpen: false, orderId: null, orderDetails: null });
        
        try {
            setDeletingOrderId(orderId);
            toast.loading('Deleting order...', { id: 'delete-order' });
            
            const response = await fetch(`https://api-gateway-production-3d22.up.railway.app/orders/${orderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
    
            toast.dismiss('delete-order');
            if (!response.ok) throw new Error('Failed to delete order');
    
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            setFilteredOrders(prevFiltered => prevFiltered.filter(o => o.id !== orderId));
            toast.success('Order deleted successfully');
        } catch (error) {
            toast.dismiss('delete-order');
            toast.error(error.message || 'Failed to delete order');
        } finally { setDeletingOrderId(null); }
    };

    const handleCancelDelete = () => setDeleteModal({ isOpen: false, orderId: null, orderDetails: null });

    const applyFilters = () => {
        let filtered = [...orders];
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(order => {
                const displayStatus = getStatusDisplay(order);
                return displayStatus === filterStatus;
            });
        }
        if (filterPaymentMethod !== 'ALL') {
            filtered = filtered.filter(order => {
                if (filterPaymentMethod === 'COD') return order.paymentMethod === 'COD';
                if (filterPaymentMethod === 'ONLINE') return order.paymentMethod !== 'COD' && order.paymentMethod !== null;
                return true;
            });
        }
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order => 
                order.id.toString().includes(query) || order.productName?.toLowerCase().includes(query)
            );
        }
        filtered.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setFilteredOrders(filtered);
    };

    const getStatusDisplay = (order) => {
        if (order.paymentMethod === 'COD') return order.paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING';
        return order.status || 'CONFIRMED';
    };

    const getStatusIcon = (order) => {
        const displayStatus = getStatusDisplay(order);
        switch(displayStatus) {
            case 'CONFIRMED': return <FiCheckCircle className="text-green-500" size={18} />;
            case 'PENDING': return <FiClock className="text-yellow-500" size={18} />;
            case 'FAILED': return <FiXCircle className="text-red-500" size={18} />;
            default: return <FiPackage className="text-gray-500" size={18} />;
        }
    };

    const getStatusColor = (order) => {
        const displayStatus = getStatusDisplay(order);
        switch(displayStatus) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getProductImage = (order) => {
        const product = productDetails[order.productId];
    
        if (product?.images && product.images.length > 0)
            return `https://api-gateway-production-3d22.up.railway.app${product.images[0].imageUrl}`;
    
        if (product?.imageUrls && product.imageUrls.length > 0)
            return `https://api-gateway-production-3d22.up.railway.app${product.imageUrls[0]}`;
    
        return null;
    };

    const clearAllFilters = () => {
        setFilterStatus('ALL'); setFilterPaymentMethod('ALL'); setSortOrder('newest'); setSearchQuery('');
    };

    if (loading) return <Spinner />;

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {/* Header */}
            <div className="mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                    <FiShoppingBag className="mr-2 sm:mr-3 text-indigo-600" size={24} />
                    My Orders
                </h1>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Track and manage your orders</p>
            </div>

            {/* Filters Section */}
            {orders.length > 0 && (
                <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center space-x-2">
                            <FiFilter className="text-gray-400" size={16} />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by:</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-xs text-gray-500 hidden sm:inline">Status:</span>
                            <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                                <button onClick={() => setFilterStatus('ALL')} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${filterStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>All</button>
                                <button onClick={() => setFilterStatus('PENDING')} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all flex items-center ${filterStatus === 'PENDING' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}><FiClock className="mr-1" size={12} />Pending</button>
                                <button onClick={() => setFilterStatus('CONFIRMED')} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all flex items-center ${filterStatus === 'CONFIRMED' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}><FiCheckCircle className="mr-1" size={12} />Confirmed</button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-xs text-gray-500 hidden sm:inline">Payment:</span>
                            <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                                <button onClick={() => setFilterPaymentMethod('ALL')} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${filterPaymentMethod === 'ALL' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>All</button>
                                <button onClick={() => setFilterPaymentMethod('COD')} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${filterPaymentMethod === 'COD' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>COD</button>
                                <button onClick={() => setFilterPaymentMethod('ONLINE')} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${filterPaymentMethod === 'ONLINE' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>Online</button>
                            </div>
                        </div>

                        <div className="flex-1 min-w-[150px] sm:min-w-[200px]">
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-indigo-500">
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    </div>

                    {(filterStatus !== 'ALL' || filterPaymentMethod !== 'ALL' || searchQuery) && (
                        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="text-xs text-gray-500">Active:</span>
                            {filterStatus !== 'ALL' && <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs">Status: {filterStatus}<button onClick={() => setFilterStatus('ALL')} className="ml-1"><FiX size={10} /></button></span>}
                            {filterPaymentMethod !== 'ALL' && <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">Payment: {filterPaymentMethod}<button onClick={() => setFilterPaymentMethod('ALL')} className="ml-1"><FiX size={10} /></button></span>}
                            {searchQuery && <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">Search: "{searchQuery}"<button onClick={() => setSearchQuery('')} className="ml-1"><FiX size={10} /></button></span>}
                            <button onClick={clearAllFilters} className="text-xs text-red-600 hover:text-red-800">Clear all</button>
                        </div>
                    )}
                </div>
            )}

            {/* Results count */}
            {orders.length > 0 && (
                <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                    Showing {filteredOrders.length} of {orders.length} orders
                </div>
            )}
            
            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiPackage className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                        {orders.length === 0 ? 'No orders yet' : 'No orders found'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 sm:mb-6 px-4">
                        {orders.length === 0 ? 'Start shopping to place your first order' : 'No orders match the selected filters'}
                    </p>
                    {orders.length === 0 ? (
                        <Link to="/products" className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base">
                            Browse Products
                            <FiShoppingBag className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                    ) : (
                        <button onClick={clearAllFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Clear Filters</button>
                    )}
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {filteredOrders.map((order) => {
                        const displayStatus = getStatusDisplay(order);
                        const statusColors = getStatusColor(order);
                        const productImage = getProductImage(order);
                        const product = productDetails[order.productId];
                        const isDeleting = deletingOrderId === order.id;

                        return (
                            <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100">
                                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                                        <div className="flex items-center space-x-2 sm:space-x-4">
                                            <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                                                <FiHash className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Order ID</span>
                                                <p className="font-semibold text-gray-900 text-sm sm:text-base">#{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 sm:space-x-4">
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <FiCalendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                                <span className="text-xs sm:text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                                            </div>
                                            <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center space-x-1 sm:space-x-2 ${statusColors}`}>
                                                {getStatusIcon(order)}
                                                <span>{displayStatus}</span>
                                            </span>
                                            {order.paymentMethod === 'COD' && (
                                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs">COD</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-3 sm:p-4 md:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {/* Product Image */}
                                        <Link to={`/product/${order.productId}`} className="flex-shrink-0">
                                            <div className="w-full sm:w-24 md:w-32 h-24 sm:h-24 md:h-32 bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity border border-gray-200">
                                                {productImage ? (
                                                    <img src={productImage} alt={order.productName} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/128?text=No+Image'; }} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100"><FiImage className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" /></div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${order.productId}`} className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                                {order.productName}
                                            </Link>
                                            {product?.brand && <p className="text-xs sm:text-sm text-gray-500 mt-1">{product.brand}</p>}
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500">Unit Price</p>
                                                    <p className="font-semibold text-gray-900 text-sm">${(order.price / order.quantity).toFixed(2)}</p>
                                                </div>
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{order.quantity}</p>
                                                </div>
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500">Total</p>
                                                    <p className="font-semibold text-indigo-600 text-sm">${order.price.toFixed(2)}</p>
                                                </div>
                                                {product?.stock !== undefined && (
                                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                        <p className="text-xs text-gray-500">Stock Status</p>
                                                        <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                                                            product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-3 sm:mt-4 flex flex-wrap justify-end gap-2 sm:gap-3">
                                        <Link to={`/product/${order.productId}`} className="px-3 sm:px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm">View Product</Link>
                                        <Link to={`/product/${order.productId}`} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium flex items-center">
                                            <FiShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                            Buy Again
                                        </Link>
                                        <button onClick={(e) => handleDeleteClick(order, e)} disabled={isDeleting} className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center">
                                            {isDeleting ? <><FiClock className="animate-spin mr-2" size={14} />Deleting...</> : <><FiTrash2 className="mr-2" size={14} />Delete</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Order"
                message={deleteModal.orderDetails ? `Are you sure you want to delete order #${deleteModal.orderDetails.id}? This action cannot be undone.` : 'Are you sure you want to delete this order? This action cannot be undone.'}
            />
        </div>
    );
};

export default Orders;