// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
    FiShoppingBag, 
    FiTrendingUp, 
    FiAward, 
    FiTruck,
    FiStar,
    FiArrowRight,
    FiChevronRight
} from 'react-icons/fi';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    const features = [
        { icon: FiTruck, title: 'Free Shipping', description: 'On orders over $50' },
        { icon: FiAward, title: 'Premium Quality', description: '100% genuine products' },
        { icon: FiTrendingUp, title: 'Best Prices', description: 'Price match guarantee' },
        { icon: FiStar, title: 'Top Rated', description: '5-star customer service' },
    ];

    const categories = [
        { name: 'Electronics', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: 150 },
        { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: 320 },
        { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: 210 },
        { name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: 95 },
    ];

    const testimonials = [
        { name: 'Sarah Johnson', comment: 'Amazing quality and fast delivery! Highly recommended.', rating: 5 },
        { name: 'Michael Chen', comment: 'Best shopping experience ever. Will definitely shop again.', rating: 5 },
        { name: 'Emma Davis', comment: 'Great prices and excellent customer service.', rating: 5 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }} />

                {/* Floating Elements - Hidden on mobile */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl hidden sm:block"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -10, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl hidden sm:block"
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 xl:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-block mb-4 sm:mb-6"
                        >
                            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                                🎉 Welcome to ShopZone
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
                        >
                            Discover Amazing
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                                Products & Deals
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
                        >
                            Shop the best products at amazing prices.
                            {user && ` Welcome back, ${user.username}!`}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
                        >
                            <Link to="/products" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        Shop Now
                                        <FiShoppingBag className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-pink-300"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            </Link>
                            
                            {!isAuthenticated && (
                                <Link to="/login" className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/30 transition-all flex items-center justify-center"
                                    >
                                        Sign In
                                        <FiArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    </motion.button>
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
                        <path d="M0,64L48,74.7C96,85,192,107,288,106.7C384,107,480,85,576,80C672,75,768,85,864,101.3C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                    </svg>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Us</h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                        We provide the best shopping experience with premium quality products
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all"
                        >
                            <div className="inline-block p-3 sm:p-4 bg-indigo-100 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Shop by Category</h2>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                            Explore our wide range of categories
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02 }}
                                className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-lg cursor-pointer"
                            >
                                <Link to={`/products?category=${category.name.toLowerCase()}`}>
                                    <div className="aspect-w-16 aspect-h-9">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-1">{category.name}</h3>
                                        <p className="text-xs sm:text-sm text-white/80">{category.count} products</p>
                                    </div>
                                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">What Our Customers Say</h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                        Don't just take our word for it - hear from our satisfied customers
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                                    <div className="flex items-center mt-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <FiStar key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic text-sm sm:text-base">"{testimonial.comment}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12 sm:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center text-white"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Stay Updated</h2>
                        <p className="text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-4">
                            Subscribe to our newsletter for exclusive deals and updates
                        </p>
                        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all text-sm sm:text-base"
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Home;