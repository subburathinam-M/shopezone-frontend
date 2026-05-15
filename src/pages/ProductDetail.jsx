import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiShoppingCart, 
    FiImage, 
    FiChevronLeft, 
    FiChevronRight,
    FiHeart,
    FiShare2,
    FiStar,
    FiTruck,
    FiRefreshCw,
    FiShield,
    FiCheckCircle,
    FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        // Load wishlist status from localStorage
        if (isAuthenticated && user?.id && product?.id) {
            const wishlistKey = `wishlist_${user.id}`;
            const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
            setIsWishlisted(wishlist.includes(product.id));
        }
    }, [isAuthenticated, user?.id, product?.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevImage = () => {
        setSelectedImage(prev => 
            prev > 0 ? prev - 1 : images.length - 1
        );
    };

    const handleNextImage = () => {
        setSelectedImage(prev => 
            prev < images.length - 1 ? prev + 1 : 0
        );
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return;
        }
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        // toast.success('Added to cart!');
    };

    const handleWishlist = () => {
        if (!isAuthenticated) {
            toast.error('Please login to add to wishlist');
            return;
        }

        const wishlistKey = `wishlist_${user.id}`;
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        if (isWishlisted) {
            wishlist = wishlist.filter(id => id !== product.id);
            toast.success('Removed from wishlist');
        } else {
            wishlist.push(product.id);
            toast.success('Added to wishlist');
        }
        
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        setIsWishlisted(!isWishlisted);
    };

    const handleShare = async () => {
        const shareData = {
            title: product?.name || 'ShopZone Product',
            text: `Check out ${product?.name} for $${product?.price} on ShopZone!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const incrementQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    if (loading) return <Spinner />;
    if (!product) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
                <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
                <Link 
                    to="/products" 
                    className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Browse Products
                </Link>
            </div>
        </div>
    );

    const images = product.images ? product.images.map(img => img.imageUrl) : (product.imageUrls || []);
    const hasImages = images.length > 0;
    const inStock = product.stock > 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <nav className="flex items-center space-x-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    {/* Left Column - Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        {/* Main Image */}
                        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden aspect-square">
                            {hasImages ? (
                                <>
                                    <motion.img
                                        key={selectedImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        src={`https://api-gateway-production-3d22.up.railway.app${images[selectedImage]}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center"
                                    />
                                    
                                    {images.length > 1 && (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handlePrevImage}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                                            >
                                                <FiChevronLeft className="h-6 w-6 text-gray-800" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                                            >
                                                <FiChevronRight className="h-6 w-6 text-gray-800" />
                                            </motion.button>

                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                                                {selectedImage + 1} / {images.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <FiImage className="h-24 w-24 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {hasImages && images.length > 1 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-5 gap-4"
                            >
                                {images.map((img, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage === index 
                                                ? 'border-indigo-600 shadow-lg' 
                                                : 'border-transparent hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={`https://api-gateway-production-3d22.up.railway.app${img}`}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Right Column - Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 lg:mt-0"
                    >
                        {/* Brand & Title */}
                        <div className="mb-6">
                            {product.brand && (
                                <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            
                            {/* Ratings */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar 
                                            key={i} 
                                            className={`h-5 w-5 ${
                                                i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                            }`} 
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">(4.0) • 124 reviews</span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-gray-900">
                                    ${product.price}
                                </span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">
                                            ${product.originalPrice}
                                        </span>
                                        <span className="text-sm text-green-600 font-semibold">
                                            Save ${(product.originalPrice - product.price).toFixed(2)}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                    }`} />
                                    <span className={`font-medium ${
                                        inStock ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                {inStock && (
                                    <span className="text-sm text-gray-600">
                                        {product.stock} units available
                                    </span>
                                )}
                            </div>
                            
                            {inStock && (
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(product.stock / 100) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {inStock && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        -
                                    </motion.button>
                                    <span className="w-16 text-center text-xl font-semibold">
                                        {quantity}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={incrementQuantity}
                                        disabled={quantity >= product.stock}
                                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        +
                                    </motion.button>
                                    <span className="text-sm text-gray-500 ml-2">
                                        Max: {product.stock}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-4 mb-8">
                            {inStock ? (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                    >
                                        <FiShoppingCart className="h-5 w-5" />
                                        <span>Add to Cart</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleWishlist}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            isWishlisted 
                                                ? 'border-red-500 text-red-500 bg-red-50' 
                                                : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                                        }`}
                                    >
                                        <FiHeart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleShare}
                                        className="p-4 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                                    >
                                        <FiShare2 className="h-5 w-5" />
                                    </motion.button>
                                </>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-gray-500 py-4 px-6 rounded-xl font-semibold cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                            )}
                        </div>

                        {/* Product Features */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FiTruck className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                                    <p className="text-xs text-gray-500">On orders over $50</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FiRefreshCw className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                                    <p className="text-xs text-gray-500">30 days return</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FiShield className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                                    <p className="text-xs text-gray-500">100% secure</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FiCheckCircle className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Warranty</p>
                                    <p className="text-xs text-gray-500">1 year warranty</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t border-gray-200 pt-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Category */}
                        {product.category && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h2 className="text-sm font-medium text-gray-900 mb-2">Category</h2>
                                <Link 
                                    to={`/products?category=${product.category.id}`}
                                    className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    {product.category.name}
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;