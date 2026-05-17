import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
    FiShoppingCart, 
    FiImage, 
    FiHeart,
    FiStar,
    FiEye,
    FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductCard = ({ product, listMode = false }) => {
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Get image URL
    const getImageUrl = () => {
        if (product.images && product.images.length > 0) {
            return `${process.env.REACT_APP_IMAGE_URL}${product.images[0].imageUrl}`;
        } else if (product.imageUrls && product.imageUrls.length > 0) {
            return `${process.env.REACT_APP_IMAGE_URL}${product.imageUrls[0]}`;
        }
        return null;
    };

    const imageUrl = getImageUrl();
    const isFallback = product.fallback;
    const inStock = product.stock > 0;
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return;
        }
        if (inStock) {
            addToCart(product);
            toast.success('Added to cart!');
        }
    };

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add to wishlist');
            return;
        }
        
        // Load existing wishlist
        const wishlistKey = `wishlist_${user?.id}`;
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        if (isFavorite) {
            wishlist = wishlist.filter(id => id !== product.id);
            toast.success('Removed from wishlist');
        } else {
            wishlist.push(product.id);
            toast.success('Added to wishlist');
        }
        
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        setIsFavorite(!isFavorite);
    };

    // List View Design
    if (listMode) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden group">
                        <Link to={`/product/${product.id}`} className="block w-full h-full">
                            {imageUrl ? (
                                <>
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        onLoad={() => setImageLoaded(true)}
                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                                            imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FiImage className="h-16 w-16 text-gray-400" />
                                </div>
                            )}
                            
                            {/* Discount Badge */}
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    -{discount}%
                                </div>
                            )}
                            
                            {/* Favorite Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleFavorite}
                                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                            >
                                <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </motion.button>
                        </Link>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-6">
                        <Link to={`/product/${product.id}`}>
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-2">
                                {product.name}
                            </h3>
                        </Link>
                        
                        {product.brand && (
                            <p className="text-sm text-indigo-600 font-medium mb-3">{product.brand}</p>
                        )}
                        
                        <p className="text-gray-600 line-clamp-2 mb-4">
                            {product.description}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar 
                                        key={i} 
                                        className={`h-4 w-4 ${
                                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">(4.0) • 24 reviews</span>
                        </div>

                        {/* Price and Stock */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">
                                            ${product.originalPrice}
                                        </span>
                                        <span className="text-xs text-green-600 font-semibold">
                                            Save ${(product.originalPrice - product.price).toFixed(2)}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className={`flex items-center space-x-1 ${
                                inStock ? 'text-green-600' : 'text-red-600'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                <span className="text-sm font-medium">
                                    {inStock ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
                                    inStock 
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <FiShoppingCart className="h-5 w-5" />
                                <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                            </motion.button>
                            
                            <Link to={`/product/${product.id}`}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 border-2 border-gray-300 rounded-xl text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                                >
                                    <FiEye className="h-5 w-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid View Design (Original Enhanced)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
            <Link to={`/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {imageUrl ? (
                        <>
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            )}
                            <motion.img
                                src={imageUrl}
                                alt={product.name}
                                onLoad={() => setImageLoaded(true)}
                                animate={{ scale: isHovered ? 1.1 : 1 }}
                                transition={{ duration: 0.3 }}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiImage className="h-16 w-16 text-gray-400" />
                        </div>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <motion.div
                            initial={{ x: -100 }}
                            animate={{ x: 0 }}
                            className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                        >
                            -{discount}%
                        </motion.div>
                    )}

                    {/* Stock Badge */}
                    {!isFallback && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                                inStock 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-red-500 text-white'
                            }`}
                        >
                            {inStock ? `${product.stock} left` : 'Out of stock'}
                        </motion.div>
                    )}

                    {/* Quick Actions - Appear on Hover */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center space-x-3"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleFavorite}
                            className="p-3 bg-white rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAddToCart}
                            disabled={!inStock}
                            className="p-3 bg-white rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiShoppingCart className="h-5 w-5" />
                        </motion.button>
                    </motion.div>

                    {/* Featured Badge */}
                    {product.featured && (
                        <div className="absolute bottom-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Featured
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                            {product.name}
                        </h3>
                        {product.brand && (
                            <span className="text-xs text-indigo-600 font-medium ml-2">
                                {product.brand}
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <FiStar 
                                    key={i} 
                                    className={`h-3 w-3 ${
                                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`} 
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">(24)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                ${product.originalPrice}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    {inStock ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddToCart}
                            className="mt-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 text-sm font-medium"
                        >
                            <FiShoppingCart className="h-4 w-4" />
                            <span>Add to Cart</span>
                        </motion.button>
                    ) : (
                        <button
                            disabled
                            className="mt-3 w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-xl cursor-not-allowed text-sm font-medium"
                        >
                            Out of Stock
                        </button>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;