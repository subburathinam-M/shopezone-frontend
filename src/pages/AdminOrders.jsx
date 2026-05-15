// src/pages/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPackage, 
    FiCheckCircle, 
    FiClock, 
    FiXCircle, 
    FiUser,
    FiMail,
    FiCalendar,
    FiDollarSign,
    FiHash,
    FiShoppingBag,
    FiImage,
    FiTrendingUp,
    FiFilter,
    FiX,
    FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        confirmedOrders: 0,
        pendingOrders: 0,
        codOrders: 0,
        onlineOrders: 0
    });

    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        orderId: null,
        orderDetails: null
    });

    useEffect(() => {
        fetchAllOrdersWithProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [orders, filterStatus, filterPaymentMethod, sortOrder, searchQuery]);

    const fetchAllOrdersWithProducts = async () => {
        try {
            setLoading(true);
            const ordersData = await orderService.getAllOrders();
            const activeOrders = ordersData.filter(order => !order.deleted);
            setOrders(activeOrders);
            
            const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
            const confirmed = activeOrders.filter(o => o.status === 'CONFIRMED' || o.paymentStatus === 'PAID').length;
            const pending = activeOrders.filter(o => o.status === 'PENDING' || o.paymentStatus === 'PENDING').length;
            const cod = activeOrders.filter(o => o.paymentMethod === 'COD').length;
            const online = activeOrders.filter(o => o.paymentMethod !== 'COD').length;
            
            setStats({ totalOrders: activeOrders.length, totalRevenue, confirmedOrders: confirmed, pendingOrders: pending, codOrders: cod, onlineOrders: online });
            
            if (activeOrders.length > 0) {
                const productIds = [...new Set(activeOrders.map(order => order.productId))];
                const products = {};
                await Promise.all(productIds.map(async (id) => {
                    try {
                        const product = await productService.getProductById(id);
                        if (product) products[id] = product;
                    } catch (error) { console.error(`Failed to fetch product ${id}:`, error); }
                }));
                setProductDetails(products);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally { setLoading(false); }
    };

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
                order.id.toString().includes(query) || order.productName?.toLowerCase().includes(query) ||
                order.userName?.toLowerCase().includes(query) || order.userEmail?.toLowerCase().includes(query)
            );
        }
        filtered.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setFilteredOrders(filtered);
    };

    const handleStatusUpdate = async (orderId) => {
        try {
            setUpdatingOrderId(orderId);
            const order = orders.find(o => o.id === orderId);
            if (!order) { toast.error('Order not found'); return; }
            if (!order.paymentId) {
                try {
                    const paymentResponse = await fetch(`https://api-gateway-production-3d22.up.railway.app/api/payments/order/${orderId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                    });
                    if (paymentResponse.ok) {
                        const paymentData = await paymentResponse.json();
                        order.paymentId = paymentData.id;
                    } else { toast.error('Payment record not found'); return; }
                } catch (e) { toast.error('Payment record not found'); return; }
            }
            const paymentResponse = await fetch(`https://api-gateway-production-3d22.up.railway.app/api/payments/${order.paymentId}/mark-paid`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (!paymentResponse.ok) throw new Error('Payment update failed');
            const orderResponse = await fetch(`https://api-gateway-production-3d22.up.railway.app/orders/${orderId}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: JSON.stringify({ status: 'CONFIRMED' })
            });
            if (!orderResponse.ok) throw new Error('Order update failed');
            await fetchAllOrdersWithProducts();
            toast.success('Order marked as PAID and CONFIRMED');
        } catch (error) {
            toast.error(error.message || 'Failed to update order status');
        } finally { setUpdatingOrderId(null); }
    };

    const handleDeleteClick = (order, e) => {
        e.preventDefault(); e.stopPropagation();
        setDeleteModal({ isOpen: true, orderId: order.id, orderDetails: order });
    };

    const handleConfirmDelete = async () => {
        const { orderId } = deleteModal;
        setDeleteModal({ isOpen: false, orderId: null, orderDetails: null });
        try {
            toast.loading('Deleting order...', { id: 'delete-order' });
            const response = await fetch(`https://api-gateway-production-3d22.up.railway.app/orders/${orderId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Content-Type': 'application/json' }
            });
            toast.dismiss('delete-order');
            if (!response.ok) throw new Error('Failed to delete order');
            await fetchAllOrdersWithProducts();
            toast.success('Order deleted successfully');
        } catch (error) {
            toast.dismiss('delete-order');
            toast.error(error.message || 'Failed to delete order');
        }
    };

    const handleCancelDelete = () => setDeleteModal({ isOpen: false, orderId: null, orderDetails: null });

    const getStatusIcon = (status, paymentMethod, paymentStatus) => {
        if (paymentMethod === 'COD') {
            if (paymentStatus === 'PAID') return <FiCheckCircle className="text-green-500" size={18} />;
            if (paymentStatus === 'PENDING') return <FiClock className="text-yellow-500" size={18} />;
        }
        switch(status) {
            case 'CONFIRMED': return <FiCheckCircle className="text-green-500" size={18} />;
            case 'PENDING': return <FiClock className="text-yellow-500" size={18} />;
            case 'FAILED': return <FiXCircle className="text-red-500" size={18} />;
            default: return <FiPackage className="text-gray-500" size={18} />;
        }
    };

    const getStatusColor = (status, paymentMethod, paymentStatus) => {
        if (paymentMethod === 'COD') {
            if (paymentStatus === 'PAID') return 'bg-green-100 text-green-800 border-green-200';
            if (paymentStatus === 'PENDING') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
        switch(status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusDisplay = (order) => {
        if (order.paymentMethod === 'COD') return order.paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING';
        return order.status || 'CONFIRMED';
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
                    <FiTrendingUp className="mr-2 sm:mr-3 text-indigo-600" size={24} />
                    All Orders (Admin)
                </h1>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Complete overview of all orders in the system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs sm:text-sm">Total Orders</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-blue-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                            <FiShoppingBag size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs sm:text-sm">Total Revenue</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                            <FiDollarSign size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs sm:text-sm">Confirmed</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{stats.confirmedOrders}</p>
                        </div>
                        <div className="bg-purple-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                            <FiCheckCircle size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100 text-xs sm:text-sm">Pending</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{stats.pendingOrders}</p>
                        </div>
                        <div className="bg-yellow-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                            <FiClock size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
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

            {/* Results count */}
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiPackage className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-sm text-gray-500">No orders match the selected filters</p>
                    {(filterStatus !== 'ALL' || filterPaymentMethod !== 'ALL' || searchQuery) && (
                        <button onClick={clearAllFilters} className="mt-3 sm:mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Clear Filters</button>
                    )}
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {filteredOrders.map((order) => {
                        const displayStatus = getStatusDisplay(order);
                        const statusColors = getStatusColor(displayStatus, order.paymentMethod, order.paymentStatus);
                        const productImage = getProductImage(order);
                        const product = productDetails[order.productId];
                        const isUpdating = updatingOrderId === order.id;

                        return (
                            <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
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
                                                {getStatusIcon(displayStatus, order.paymentMethod, order.paymentStatus)}
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
                                    {/* User Info */}
                                    <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                                            <div className="flex items-center space-x-1.5 sm:space-x-2">
                                                <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg"><FiUser className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" /></div>
                                                <div><p className="text-xs text-gray-500">Customer</p><p className="font-medium text-gray-900 text-xs sm:text-sm">{order.userName || 'N/A'}</p></div>
                                            </div>
                                            <div className="flex items-center space-x-1.5 sm:space-x-2">
                                                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg"><FiMail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" /></div>
                                                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-900 text-xs sm:text-sm">{order.userEmail || 'N/A'}</p></div>
                                            </div>
                                            <div className="flex items-center space-x-1.5 sm:space-x-2">
                                                <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg"><FiDollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" /></div>
                                                <div><p className="text-xs text-gray-500">Payment</p><p className="font-medium text-gray-900 text-xs sm:text-sm">{order.paymentMethod || 'N/A'}</p></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <Link to={`/product/${order.productId}`} className="flex-shrink-0">
                                            <div className="w-full sm:w-24 md:w-32 h-24 sm:h-24 md:h-32 bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity border border-gray-200">
                                                {productImage ? (
                                                    <img src={productImage} alt={order.productName} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/128?text=No+Image'; }} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100"><FiImage className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" /></div>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${order.productId}`} className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">{order.productName}</Link>
                                            {product?.brand && <p className="text-xs sm:text-sm text-gray-500 mt-1">{product.brand}</p>}
                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg"><p className="text-xs text-gray-500">Unit Price</p><p className="font-semibold text-gray-900 text-sm">${order.price / order.quantity}</p></div>
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg"><p className="text-xs text-gray-500">Quantity</p><p className="font-semibold text-gray-900 text-sm">{order.quantity}</p></div>
                                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg"><p className="text-xs text-gray-500">Total</p><p className="font-semibold text-indigo-600 text-sm">${order.price.toFixed(2)}</p></div>
                                                {product?.stock !== undefined && <div className="bg-gray-50 p-2 sm:p-3 rounded-lg"><p className="text-xs text-gray-500">Current Stock</p><p className="font-semibold text-gray-900 text-sm">{product.stock}</p></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-3 sm:mt-4 flex flex-wrap justify-end gap-2 sm:gap-3">
                                        <Link to={`/product/${order.productId}`} className="px-3 sm:px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm">View Product</Link>
                                        {order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && (
                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusUpdate(order.id); }} disabled={isUpdating} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center" type="button">
                                                {isUpdating ? <><FiClock className="animate-spin mr-2" size={14} />Updating...</> : <><FiCheckCircle className="mr-2" size={14} />Mark as PAID</>}
                                            </button>
                                        )}
                                        <button onClick={(e) => handleDeleteClick(order, e)} className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1" type="button">
                                            <FiTrash2 size={14} /><span>Delete</span>
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

export default AdminOrders;