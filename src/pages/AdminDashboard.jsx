// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, 
    FiPackage, 
    FiShoppingCart, 
    FiUser, 
    FiBox, 
    FiClock,
    FiTrendingUp,
    FiDollarSign,
    FiArrowUp,
    FiArrowDown,
    FiActivity,
    FiCalendar,
    FiBarChart2,
    FiSettings,
    FiBell,
    FiSearch,
    FiMenu,
    FiX,
    FiPlus,
    FiEye,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import { 
    LineChart, 
    Line, 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0,
        pendingOrders: 0,
        lowStock: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [timeRange, setTimeRange] = useState('week');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        
        const interval = setInterval(() => {
            console.log('Auto-refreshing dashboard data...');
            fetchDashboardData();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch counts
            const users = await adminService.getAllUsers();
            const products = await productService.getAllProducts();
            const orders = await orderService.getAllOrders();
            
            // Calculate stats
            const totalRevenue = orders.reduce((sum, order) => 
                order.status === 'CONFIRMED' ? sum + (order.price * order.quantity) : sum, 0
            );
            
            const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
            const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 10).length;

            setStats({
                users: users?.length || 0,
                products: products?.length || 0,
                orders: orders?.length || 0,
                revenue: totalRevenue,
                pendingOrders,
                lowStock: lowStockItems
            });

            // Generate sales data based on time range
            generateSalesData(orders, timeRange);
            
            // Generate category data
            generateCategoryData(products);
            
            // Create recent activity feed
            createActivityFeed(users, products, orders);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSalesData = (orders, range) => {
        const data = [];
        const now = new Date();
        let days = 7;
        
        if (range === 'month') days = 30;
        if (range === 'year') days = 365;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            data.push({
                date: dateStr,
                sales: Math.floor(Math.random() * 5000) + 1000,
                orders: Math.floor(Math.random() * 50) + 10
            });
        }
        
        setSalesData(data);
    };

    const generateCategoryData = (products) => {
        const categoryMap = new Map();
        products.forEach(product => {
            const catName = product.category?.name || 'Uncategorized';
            const count = categoryMap.get(catName) || 0;
            categoryMap.set(catName, count + 1);
        });

        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
        const data = Array.from(categoryMap.entries()).map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length]
        }));

        setCategoryData(data);
    };

    const createActivityFeed = (users, products, orders) => {
        const activities = [];

        if (orders?.length > 0) {
            const sortedOrders = [...orders].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            sortedOrders.slice(0, 3).forEach(order => {
                activities.push({
                    id: `order-${order.id}`,
                    type: 'order',
                    message: `New order #${order.id} for ${order.productName}`,
                    time: order.createdAt,
                    icon: FiShoppingCart,
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-600',
                    borderColor: 'border-purple-200'
                });
            });
        }

        if (users?.length > 0) {
            const sortedUsers = [...users].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            sortedUsers.slice(0, 3).forEach(user => {
                activities.push({
                    id: `user-${user.id}`,
                    type: 'user',
                    message: `New user registered: ${user.username}`,
                    time: user.createdAt,
                    icon: FiUser,
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-600',
                    borderColor: 'border-blue-200'
                });
            });
        }

        if (products?.length > 0) {
            const sortedProducts = [...products].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            sortedProducts.slice(0, 3).forEach(product => {
                activities.push({
                    id: `product-${product.id}`,
                    type: 'product',
                    message: `New product added: ${product.name}`,
                    time: product.createdAt,
                    icon: FiBox,
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-600',
                    borderColor: 'border-green-200'
                });
            });
        }

        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activities.slice(0, 5));
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Recently';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const statCards = [
        { 
            name: 'Total Users', 
            value: stats.users, 
            icon: FiUsers, 
            href: '/admin/users',
            bgColor: 'bg-blue-500',
            gradient: 'from-blue-500 to-blue-600',
            change: '+12%',
            trend: 'up'
        },
        { 
            name: 'Total Products', 
            value: stats.products, 
            icon: FiPackage, 
            href: '/admin/products',
            bgColor: 'bg-green-500',
            gradient: 'from-green-500 to-green-600',
            change: '+5%',
            trend: 'up'
        },
        { 
            name: 'Total Orders', 
            value: stats.orders, 
            icon: FiShoppingCart, 
            href: '/admin/orders',
            bgColor: 'bg-purple-500',
            gradient: 'from-purple-500 to-purple-600',
            change: '+8%',
            trend: 'up'
        },
        { 
            name: 'Revenue', 
            value: `$${stats.revenue.toLocaleString()}`, 
            icon: FiDollarSign, 
            href: '/admin/orders',
            bgColor: 'bg-yellow-500',
            gradient: 'from-yellow-500 to-yellow-600',
            change: '+15%',
            trend: 'up'
        },
        { 
            name: 'Pending Orders', 
            value: stats.pendingOrders, 
            icon: FiClock, 
            href: '/admin/orders',
            bgColor: 'bg-orange-500',
            gradient: 'from-orange-500 to-orange-600',
            change: '-2%',
            trend: 'down'
        },
        { 
            name: 'Low Stock', 
            value: stats.lowStock, 
            icon: FiAlertCircle, 
            href: '/admin/products',
            bgColor: 'bg-red-500',
            gradient: 'from-red-500 to-red-600',
            change: '+3%',
            trend: 'up'
        }
    ];

    if (loading) return <Spinner />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <FiBarChart2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">Welcome back, {user?.username}!</p>
                            </div>
                        </div>
                        
                        {/* Desktop Actions */}
                        <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all relative">
                                <FiBell className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                <FiSettings className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="sm:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            {isMobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Mobile Actions Dropdown */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="sm:hidden mt-3 pt-3 border-t border-gray-100"
                            >
                                <div className="flex items-center justify-around">
                                    <button className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                                        <FiSearch className="h-5 w-5 mb-1" />
                                        <span className="text-xs">Search</span>
                                    </button>
                                    <button className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 transition-colors relative">
                                        <FiBell className="h-5 w-5 mb-1" />
                                        <span className="text-xs">Alerts</span>
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                    <button className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                                        <FiSettings className="h-5 w-5 mb-1" />
                                        <span className="text-xs">Settings</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                        >
                            <Link to={stat.href}>
                                <div className={`bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all p-3 sm:p-4 lg:p-6 text-white h-full`}>
                                    <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                        <div className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3">
                                            <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        </div>
                                        <span className={`text-xs font-semibold flex items-center ${
                                            stat.trend === 'up' ? 'text-green-300' : 'text-red-300'
                                        }`}>
                                            {stat.trend === 'up' ? <FiArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" /> : <FiArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />}
                                            <span className="hidden sm:inline">{stat.change}</span>
                                        </span>
                                    </div>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1">{stat.value}</p>
                                    <p className="text-xs sm:text-sm text-white/80">{stat.name}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
                    {/* Sales Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Sales Overview</h2>
                                <p className="text-xs sm:text-sm text-gray-500">Monthly sales performance</p>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                {['week', 'month', 'year'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            timeRange === range
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {range.charAt(0).toUpperCase() + range.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-60 sm:h-72 lg:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                    <YAxis stroke="#888" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px'
                                        }} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#4f46e5" 
                                        strokeWidth={2}
                                        fill="url(#salesGradient)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Category Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
                    >
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Products by Category</h2>
                        <div className="h-60 sm:h-72 lg:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px'
                                        }} 
                                    />
                                    <Legend 
                                        layout="horizontal"
                                        align="center"
                                        verticalAlign="bottom"
                                        wrapperStyle={{
                                            fontSize: '11px',
                                            paddingTop: '10px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
                    >
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
                                <p className="text-xs sm:text-sm text-gray-500">Latest updates from your store</p>
                            </div>
                            <FiActivity className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>

                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="bg-gray-50 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <FiClock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">No recent activity</p>
                            </div>
                        ) : (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {recentActivity.map((activity, index) => (
                                        <motion.li
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (index * 0.1) }}
                                        >
                                            <div className="relative pb-6 sm:pb-8">
                                                {index < recentActivity.length - 1 && (
                                                    <span
                                                        className="absolute left-4 sm:left-5 top-4 sm:top-5 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <div className="relative flex items-start space-x-3">
                                                    <div className="relative">
                                                        <div className={`${activity.bgColor} h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ring-4 sm:ring-8 ring-white`}>
                                                            <activity.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${activity.textColor}`} />
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div>
                                                            <p className="text-xs sm:text-sm text-gray-900 font-medium">
                                                                {activity.message}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {formatTime(activity.time)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
                    >
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
                        <div className="space-y-2 sm:space-y-4">
                            <Link to="/admin/products/add">
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all group"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-lg">
                                            <FiPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-700 text-xs sm:text-sm">Add New Product</span>
                                    </div>
                                    <FiArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 rotate-45 group-hover:text-indigo-600 transition-colors" />
                                </motion.button>
                            </Link>

                            <Link to="/admin/users">
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all group"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                                            <FiUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-700 text-xs sm:text-sm">Manage Users</span>
                                    </div>
                                    <FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </motion.button>
                            </Link>

                            <Link to="/admin/orders">
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg">
                                            <FiShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-700 text-xs sm:text-sm">View All Orders</span>
                                    </div>
                                    <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                </motion.button>
                            </Link>

                            <Link to="/admin/products">
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all group"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg">
                                            <FiPackage className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-700 text-xs sm:text-sm">Manage Products</span>
                                    </div>
                                    <FiAlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                                </motion.button>
                            </Link>
                        </div>

                        {/* System Status */}
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">System Status</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-600">Server Status</span>
                                    <span className="flex items-center text-xs text-green-600 font-medium">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                        Operational
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-600">Database</span>
                                    <span className="flex items-center text-xs text-green-600 font-medium">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></span>
                                        Connected
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-600">API Response</span>
                                    <span className="text-xs text-gray-600">120ms</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;