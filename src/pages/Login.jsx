// src/pages/Login.jsx
// JWT login - calls /auth/login on our backend
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMail, FiLock, FiUser, FiLogIn,
    FiAlertCircle, FiEye, FiEyeOff,
    FiShield, FiStar, FiGithub, FiTwitter, FiFacebook
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();

    const validateField = (name, value) => {
        if (name === 'username' && !value) return 'Username is required';
        if (name === 'password' && !value) return 'Password is required';
        if (name === 'password' && value.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validateField(name, value) });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(formData.username, formData.password);

            if (result.success) {
                toast.success('Login successful!');
                // Redirect based on role
                const role = result.user?.role;
                setTimeout(() => {
                    if (role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/products');
                    }
                }, 100);
            } else {
                toast.error(result.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.3, staggerChildren: 0.2 } }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };
    const floatingIcons = [
        { Icon: FiStar, delay: 0, duration: 20, x: '10%', y: '20%' },
        { Icon: FiShield, delay: 5, duration: 25, x: '80%', y: '60%' },
        { Icon: FiUser, delay: 10, duration: 22, x: '30%', y: '80%' },
        { Icon: FiLock, delay: 15, duration: 18, x: '70%', y: '30%' },
        { Icon: FiMail, delay: 20, duration: 24, x: '50%', y: '40%' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden overflow-y-auto">
            {floatingIcons.map((item, index) => (
                <motion.div key={index} className="absolute text-white/10 hidden sm:block"
                    style={{ left: item.x, top: item.y }}
                    animate={{ y: [0, -30, 0, 30, 0], x: [0, 20, 0, -20, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "linear" }}>
                    <item.Icon size={60} />
                </motion.div>
            ))}

            {[...Array(20)].map((_, i) => (
                <motion.div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full hidden sm:block"
                    style={{ left: `${(i * 5) % 100}%`, top: `${(i * 7) % 100}%` }}
                    animate={{ y: [0, -30, 0, 30, 0], x: [0, 20, 0, -20, 0] }}
                    transition={{ duration: 10 + (i % 10), repeat: Infinity, ease: "linear", delay: i * 0.5 }} />
            ))}

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/20 my-4 sm:my-8">

                <motion.div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ filter: 'blur(20px)', opacity: 0.3 }} />

                <div className="relative p-5 sm:p-6 md:p-8">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center mb-4 sm:mb-6 md:mb-8">
                        <motion.div variants={itemVariants} className="inline-block"
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 300 }}>
                            <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                <FiLogIn className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-white" />
                            </div>
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-3 sm:mt-4">
                            Welcome Back
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                            Sign in to continue your journey
                        </motion.p>
                    </motion.div>

                    <motion.form variants={containerVariants} initial="hidden" animate="visible"
                        onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">

                        {/* Username */}
                        <motion.div variants={itemVariants} className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-white/80">Username or Email</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50 group-focus-within:text-white transition-colors">
                                    <FiUser className="h-4 w-4 sm:h-5 sm:w-5" />
                                </span>
                                <input type="text" name="username" value={formData.username}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={`w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 bg-white/10 border ${errors.username && touched.username ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-white'} rounded-xl focus:outline-none focus:ring-2 text-white placeholder-white/50 transition-all text-sm sm:text-base`}
                                    placeholder="Enter your username or email" />
                                <AnimatePresence>
                                    {errors.username && touched.username && (
                                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                            className="text-xs text-red-300 flex items-center mt-1">
                                            <FiAlertCircle className="mr-1 h-3 w-3" />{errors.username}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-white/80">Password</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50 group-focus-within:text-white transition-colors">
                                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5" />
                                </span>
                                <input type={showPassword ? 'text' : 'password'} name="password"
                                    value={formData.password} onChange={handleChange} onBlur={handleBlur}
                                    className={`w-full pl-9 sm:pl-10 pr-10 py-2.5 sm:py-3 bg-white/10 border ${errors.password && touched.password ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-white'} rounded-xl focus:outline-none focus:ring-2 text-white placeholder-white/50 transition-all text-sm sm:text-base`}
                                    placeholder="Enter your password" />
                                <motion.button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    {showPassword ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {errors.password && touched.password && (
                                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-300 flex items-center mt-1">
                                        <FiAlertCircle className="mr-1 h-3 w-3" />{errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Remember & Forgot */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500" />
                                <span className="text-xs sm:text-sm text-white/70">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
                                Forgot password?
                            </Link>
                        </motion.div>

                        {/* Submit */}
                        <motion.button type="submit" disabled={loading} variants={itemVariants}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm sm:text-base">
                            <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} />
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </motion.svg>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <FiLogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Sign In
                                </div>
                            )}
                        </motion.button>

                        <motion.p variants={itemVariants} className="text-center text-white/70 text-xs sm:text-sm md:text-base">
                            Don't have an account?{' '}
                            <Link to="/register">
                                <motion.span className="text-white font-semibold cursor-pointer inline-block"
                                    whileHover={{ scale: 1.05, x: 2 }} whileTap={{ scale: 0.95 }}>
                                    Create one now
                                </motion.span>
                            </Link>
                        </motion.p>
                    </motion.form>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }} className="mt-4 sm:mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-white/50 text-xs sm:text-sm">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                            {[{ Icon: FiGithub }, { Icon: FiTwitter }, { Icon: FiFacebook }].map((social, index) => (
                                <motion.button key={index} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center py-2 sm:py-2.5 px-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all border border-white/20">
                                    <social.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
