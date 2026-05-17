// src/pages/Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiTrash2, 
    FiShoppingBag, 
    FiPlus, 
    FiMinus,
    FiShoppingCart,
    FiArrowRight,
    FiHome,
    FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Cart = () => {
    const navigate = useNavigate();
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        getCartTotal, 
        placingOrder
    } = useCart();

    const handleQuantityChange = (item, newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= item.stock) {
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const getImageUrl = (item) => {
        if (item.image)
            return `${process.env.REACT_APP_IMAGE_URL}${item.image}`;
    
        if (item.imageUrls?.length > 0)
            return `${process.env.REACT_APP_IMAGE_URL}${item.imageUrls[0]}`;
    
        if (item.images?.length > 0)
            return `${process.env.REACT_APP_IMAGE_URL}${item.images[0].imageUrl}`;
    
        return null;
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 md:p-12 text-center"
                    >
                        <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-16 sm:h-20 md:h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <FiShoppingBag className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-indigo-600" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Your cart is empty</h2>
                        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Looks like you haven't added anything to your cart yet</p>
                        <Link to="/products">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center text-sm sm:text-base"
                            >
                                <FiShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                Start Shopping
                                <FiArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-6 md:mb-8"
                >
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        <FiShoppingCart className="mr-2 sm:mr-3 text-indigo-600" size={24} />
                        Shopping Cart
                    </h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">
                        You have {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                    {/* Cart Items */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1"
                    >
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {cartItems.map((item, index) => {
                                        const itemTotal = item.price * item.quantity;
                                        const imageUrl = getImageUrl(item);

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                                    {/* Product Image */}
                                                    <Link to={`/product/${item.id}`} className="sm:w-24 md:w-32 sm:h-24 md:h-32 flex-shrink-0">
                                                        <div className="w-full h-24 sm:h-full bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden hover:opacity-90 transition-opacity">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <FiShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                                            <div className="min-w-0 flex-1">
                                                                <Link 
                                                                    to={`/product/${item.id}`}
                                                                    className="text-base sm:text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                                    ${item.price} each
                                                                </p>
                                                                <div className="flex items-center mt-1.5 sm:mt-2">
                                                                    <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                                                                        item.stock > 10 
                                                                            ? 'bg-green-100 text-green-700' 
                                                                            : 'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                        {item.stock} in stock
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-left sm:text-right">
                                                                <p className="text-lg sm:text-xl font-bold text-indigo-600">
                                                                    ${itemTotal.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                                >
                                                                    <FiMinus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </motion.button>
                                                                
                                                                <span className="w-10 sm:w-12 text-center font-semibold text-sm sm:text-base">
                                                                    {item.quantity}
                                                                </span>
                                                                
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                                    disabled={item.quantity >= item.stock}
                                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                                >
                                                                    <FiPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                </motion.button>
                                                            </div>

                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Remove item"
                                                            >
                                                                <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:w-80 xl:w-96"
                    >
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:sticky lg:top-24">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
                            
                            <div className="space-y-2 sm:space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 truncate mr-2">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium text-gray-900 flex-shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 mt-4 sm:mt-6 pt-4 sm:pt-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                                        ${getCartTotal().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs sm:text-sm text-gray-600">Shipping</span>
                                    <span className="text-xs text-gray-500">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg font-bold mt-3 sm:mt-4">
                                    <span>Total</span>
                                    <span className="text-indigo-600">
                                        ${getCartTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={placingOrder || cartItems.length === 0}
                                className="w-full mt-4 sm:mt-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                            >
                                {placingOrder ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingBag className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Proceed to Checkout
                                    </>
                                )}
                            </motion.button>

                            <Link to="/products">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-2 sm:mt-3 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center justify-center text-sm sm:text-base"
                                >
                                    <FiHome className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Continue Shopping
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Cart;