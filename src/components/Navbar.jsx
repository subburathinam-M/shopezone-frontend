// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiLogOut, 
    FiShoppingCart, 
    FiHome, 
    FiPackage, 
    FiUsers, 
    FiShoppingBag,
    FiUser,
    FiList,
    FiMenu,
    FiX,
    FiChevronDown,
    FiChevronRight,
    FiLogIn,
    FiUserPlus
} from 'react-icons/fi';

const Navbar = () => {
    const { isAuthenticated, user, logout, authLoaded } = useAuth();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(false);

    // 🔥 FIX: Force re-render when auth state changes
    useEffect(() => {
        console.log('Auth state changed:', { isAuthenticated, user });
    }, [isAuthenticated, user]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    
    // Check if page is auth page (login/register)
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    // ✅ Loading placeholder - but hooks already called above
    if (!authLoaded) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 h-16">
                <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
                    <div className="text-white font-bold text-xl">ShopZone</div>
                </div>
            </div>
        );
    }

    // Don't render navbar on auth pages
    if (isAuthPage) return null;

    const navVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 }
        }
    };

    const logoVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: { 
            scale: 1, 
            rotate: 0,
            transition: { type: "spring", stiffness: 200, delay: 0.2 }
        },
        hover: { 
            scale: 1.05,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.3 }
        }
    };

    const linkVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: (i) => ({
            y: 0,
            opacity: 1,
            transition: { delay: i * 0.1, type: "spring", stiffness: 300 }
        }),
        hover: { 
            scale: 1.1,
            y: -2,
            transition: { type: "spring", stiffness: 400 }
        },
        tap: { scale: 0.95 }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.5)",
            transition: { type: "spring", stiffness: 400 }
        },
        tap: { scale: 0.95 }
    };

    const sidebarVariants = {
        hidden: { x: '100%' },
        visible: { 
            x: 0,
            transition: { type: 'spring', damping: 25, stiffness: 200 }
        },
        exit: { 
            x: '100%',
            transition: { type: 'spring', damping: 25, stiffness: 200 }
        }
    };

    return (
        <>
            <motion.nav
                variants={navVariants}
                initial="hidden"
                animate="visible"
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-indigo-700/95 backdrop-blur-md shadow-lg' 
                        : 'bg-indigo-600'
                }`}
            >
                <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo Section */}
                        <motion.div
                            variants={logoVariants}
                            whileHover="hover"
                            className="flex-shrink-0"
                        >
                            <Link to="/" className="flex items-center space-x-2">
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1.1, 1]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3
                                    }}
                                    className="w-8 h-8 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-lg flex items-center justify-center"
                                >
                                    <span className="text-indigo-700 font-bold text-lg">S</span>
                                </motion.div>
                                <motion.span 
                                    className="text-white font-bold text-xl"
                                    animate={{ 
                                        textShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 10px rgba(255,255,255,0.5)", "0 0 0 rgba(255,255,255,0)"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    ShopZone
                                </motion.span>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
                            {[
                                { to: '/', icon: FiHome, text: 'Home' },
                                { to: '/products', icon: FiShoppingBag, text: 'Products' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.to}
                                    custom={i}
                                    variants={linkVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Link
                                        to={item.to}
                                        className="text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.text}</span>
                                    </Link>
                                </motion.div>
                            ))}

                            {/* My Orders - Authenticated only */}
                            {isAuthenticated && (
                                <motion.div
                                    variants={linkVariants}
                                    custom={2}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Link
                                        to="/orders"
                                        className="text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all"
                                    >
                                        <FiList className="h-4 w-4" />
                                        <span>My Orders</span>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Admin Dropdown */}
                            {isAuthenticated && user?.roles?.includes('ADMIN') && (
                                <motion.div
                                    variants={linkVariants}
                                    custom={3}
                                    initial="hidden"
                                    animate="visible"
                                    className="relative"
                                    onMouseEnter={() => setIsAdminDropdownOpen(true)}
                                    onMouseLeave={() => setIsAdminDropdownOpen(false)}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all"
                                    >
                                        <FiPackage className="h-4 w-4" />
                                        <span>Admin</span>
                                        <FiChevronDown className={`h-4 w-4 transition-transform duration-300 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {isAdminDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden"
                                            >
                                                {[
                                                    { to: '/admin', text: 'Dashboard', icon: FiPackage },
                                                    { to: '/admin/users', text: 'Users', icon: FiUsers },
                                                    { to: '/admin/products', text: 'Products', icon: FiShoppingBag },
                                                    { to: '/admin/orders', text: 'All Orders', icon: FiList },
                                                ].map((item) => (
                                                    <Link
                                                        key={item.to}
                                                        to={item.to}
                                                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <item.icon className="h-4 w-4" />
                                                        <span className="text-sm font-medium">{item.text}</span>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Section - Cart & User (Desktop) */}
                        <div className="hidden md:flex items-center space-x-3">
                            {isAuthenticated ? (
                                <>
                                    {/* Cart */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Link
                                            to="/cart"
                                            className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-all inline-block"
                                        >
                                            <FiShoppingCart className="h-5 w-5" />
                                            {cartCount > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white font-bold"
                                                >
                                                    {cartCount}
                                                </motion.span>
                                            )}
                                        </Link>
                                    </motion.div>

                                    {/* Profile Dropdown */}
                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20 transition-all"
                                        >
                                            <FiUser className="h-5 w-5 text-white" />
                                            <span className="text-white text-sm font-medium">{user?.username}</span>
                                            <FiChevronDown className={`h-4 w-4 text-white transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                                        </motion.button>

                                        <AnimatePresence>
                                            {isProfileDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                                                >
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                    >
                                                        <FiUser className="h-4 w-4" />
                                                        <span className="text-sm font-medium">My Profile</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setIsProfileDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <FiLogOut className="h-4 w-4" />
                                                        <span className="text-sm font-medium">Logout</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Login Button */}
                                    <motion.div
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Link
                                            to="/login"
                                            className="px-4 py-2 text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center space-x-2"
                                        >
                                            <FiLogIn className="h-4 w-4" />
                                            <span>Login</span>
                                        </Link>
                                    </motion.div>

                                    {/* Register Button */}
                                    <motion.div
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Link
                                            to="/register"
                                            className="px-4 py-2 bg-gradient-to-r from-yellow-300 to-pink-300 text-indigo-700 rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center space-x-2"
                                        >
                                            <FiUserPlus className="h-4 w-4" />
                                            <span>Register</span>
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button & Cart */}
                        <div className="flex md:hidden items-center space-x-2">
                            {/* Cart for Mobile */}
                            {isAuthenticated && (
                                <Link
                                    to="/cart"
                                    className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <FiShoppingCart className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white font-bold"
                                        >
                                            {cartCount}
                                        </motion.span>
                                    )}
                                </Link>
                            )}
                            
                            {/* Hamburger Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <FiMenu className="h-6 w-6" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Animated Progress Bar on Scroll */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-300 to-pink-300"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isScrolled ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: '0%' }}
                />
            </motion.nav>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* Sidebar */}
                        <motion.div
                            variants={sidebarVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                        >
                            {/* Sidebar Header */}
                            <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-lg flex items-center justify-center">
                                            <span className="text-indigo-700 font-bold text-lg">S</span>
                                        </div>
                                        <span className="text-xl font-bold text-gray-900">ShopZone</span>
                                    </Link>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* User Info (if authenticated) */}
                                {isAuthenticated && (
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <FiUser className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{user?.username || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Links */}
                            <div className="p-4 space-y-1">
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                        location.pathname === '/' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <FiHome className="h-5 w-5" />
                                        <span className="font-medium">Home</span>
                                    </div>
                                    <FiChevronRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    to="/products"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                        location.pathname === '/products' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <FiShoppingBag className="h-5 w-5" />
                                        <span className="font-medium">Products</span>
                                    </div>
                                    <FiChevronRight className="h-4 w-4" />
                                </Link>

                                {isAuthenticated && (
                                    <Link
                                        to="/orders"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                            location.pathname === '/orders' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FiList className="h-5 w-5" />
                                            <span className="font-medium">My Orders</span>
                                        </div>
                                        <FiChevronRight className="h-4 w-4" />
                                    </Link>
                                )}

                                {isAuthenticated && (
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                            location.pathname === '/profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FiUser className="h-5 w-5" />
                                            <span className="font-medium">My Profile</span>
                                        </div>
                                        <FiChevronRight className="h-4 w-4" />
                                    </Link>
                                )}

                                {/* Admin Section in Sidebar */}
                                {isAuthenticated && user?.roles?.includes('ADMIN') && (
                                    <>
                                        <div className="border-t border-gray-100 my-2"></div>
                                        
                                        <button
                                            onClick={() => setIsMobileAdminOpen(!isMobileAdminOpen)}
                                            className="flex items-center justify-between w-full p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FiPackage className="h-5 w-5" />
                                                <span className="font-medium">Admin</span>
                                            </div>
                                            <FiChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMobileAdminOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isMobileAdminOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden ml-4 space-y-1"
                                                >
                                                    {[
                                                        { to: '/admin', text: 'Dashboard', icon: FiPackage },
                                                        { to: '/admin/users', text: 'Users', icon: FiUsers },
                                                        { to: '/admin/products', text: 'Products', icon: FiShoppingBag },
                                                        { to: '/admin/orders', text: 'All Orders', icon: FiList },
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.to}
                                                            to={item.to}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                                                        >
                                                            <item.icon className="h-4 w-4" />
                                                            <span className="text-sm font-medium">{item.text}</span>
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}

                                {/* Auth Buttons for non-authenticated users */}
                                {!isAuthenticated && (
                                    <>
                                        <div className="border-t border-gray-100 my-2"></div>
                                        
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FiLogIn className="h-5 w-5" />
                                                <span className="font-medium">Login</span>
                                            </div>
                                            <FiChevronRight className="h-4 w-4" />
                                        </Link>

                                        <Link
                                            to="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-300 to-pink-300 text-indigo-700 mt-2 transition-all"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FiUserPlus className="h-5 w-5" />
                                                    <span className="font-medium">Register</span>
                                                </div>
                                                <FiChevronRight className="h-4 w-4" />
                                            </motion.div>
                                        </Link>
                                    </>
                                )}

                                {/* Logout for authenticated users */}
                                {isAuthenticated && (
                                    <>
                                        <div className="border-t border-gray-100 my-2"></div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            <FiLogOut className="h-5 w-5 mr-3" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="border-t border-gray-100 p-6 mt-4">
                                <p className="text-xs text-gray-400 text-center">
                                    © 2024 ShopZone. All rights reserved.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;