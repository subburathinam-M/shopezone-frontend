// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
    FiUser, 
    FiMail, 
    FiLock, 
    FiUserPlus,
    FiAlertCircle,
    FiEye,
    FiEyeOff,
    FiShield,
    FiStar,
    FiGithub,
    FiTwitter,
    FiFacebook,
    FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'USER'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    // Validation function
    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'username':
                if (!value) error = 'Username is required';
                else if (value.length < 3) error = 'Username must be at least 3 characters';
                else if (value.length > 20) error = 'Username must be less than 20 characters';
                else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Username can only contain letters, numbers, and underscores';
                break;
            case 'email':
                if (!value) error = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                else if (value.length < 6) error = 'Password must be at least 6 characters';
                else if (!/(?=.*[0-9])/.test(value)) error = 'Password must contain at least one number';
                else if (!/(?=.*[a-zA-Z])/.test(value)) error = 'Password must contain at least one letter';
                break;
            case 'firstName':
                if (!value) error = 'First name is required';
                break;
            default: break;
        }
        return error;
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

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'role' && key !== 'lastName') {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }
    
        setLoading(true);
        try {
            // This calls Auth Service which creates user in Keycloak
            const result = await register(formData);
            
            console.log('Registration result:', result); // Debug log
            
            // Check for success properly
            if (result && result.success === true) {
                setRegistrationSuccess(true);
                toast.success('Account created successfully! 🎉');
                
                // Show success message then redirect to login
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Show error message from server
                toast.error(result?.message || 'Registration failed');
                setLoading(false);
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // Better error handling
            if (error.response) {
                // Server responded with error
                toast.error(error.response.data?.message || 'Registration failed');
            } else if (error.request) {
                // Request made but no response
                toast.error('Server not responding. Please try again.');
            } else {
                // Something else happened
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const floatingIcons = [
        { Icon: FiStar, delay: 0, duration: 20, x: '10%', y: '20%' },
        { Icon: FiShield, delay: 5, duration: 25, x: '80%', y: '60%' },
        { Icon: FiUser, delay: 10, duration: 22, x: '30%', y: '80%' },
        { Icon: FiMail, delay: 15, duration: 18, x: '70%', y: '30%' },
        { Icon: FiLock, delay: 20, duration: 24, x: '50%', y: '40%' },
    ];

    // Success screen
    if (registrationSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-12 max-w-md w-full border border-white/20 text-center my-4"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                    >
                        <FiCheckCircle className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-white" />
                    </motion.div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Registration Successful!</h2>
                    <p className="text-white/70 mb-6 sm:mb-8 text-sm sm:text-base">
                        Your account has been created in Keycloak. You can now login with your credentials.
                    </p>
                    
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                        />
                    </div>
                    
                    <p className="text-white/50 mt-4 text-sm">Redirecting to login page...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden overflow-y-auto">
            {/* Animated Background Icons - Hidden on mobile */}
            {floatingIcons.map((item, index) => (
                <motion.div
                    key={index}
                    className="absolute text-white/10 hidden sm:block"
                    style={{ left: item.x, top: item.y }}
                    animate={{
                        y: [0, -30, 0, 30, 0],
                        x: [0, 20, 0, -20, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: item.duration,
                        delay: item.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <item.Icon size={60} />
                </motion.div>
            ))}

            {/* Floating Particles - Hidden on mobile */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/20 rounded-full hidden sm:block"
                    style={{
                        left: `${(i * 5) % 100}%`,
                        top: `${(i * 7) % 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0, 30, 0],
                        x: [0, 20, 0, -20, 0],
                    }}
                    transition={{
                        duration: 10 + (i % 10),
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.5,
                    }}
                />
            ))}

            {/* Main Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.5
                }}
                className="w-full max-w-md sm:max-w-lg md:max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/20 my-4 sm:my-6 md:my-8"
            >
                {/* Animated Gradient Border */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        filter: 'blur(20px)',
                        opacity: 0.3,
                    }}
                />

                {/* Content */}
                <div className="relative p-4 sm:p-6 md:p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-4 sm:mb-6"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="inline-block"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300 mx-auto mb-3 sm:mb-4">
                                <FiUserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </div>
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Join Our Community</h2>
                        <p className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-sm">Create your account and start shopping</p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* First Name */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-1"
                            >
                                <label className="block text-xs sm:text-sm font-medium text-white/80">First Name *</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                                        <FiUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 bg-white/10 border ${
                                            errors.firstName && touched.firstName
                                                ? 'border-red-400'
                                                : 'border-white/20'
                                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all text-xs sm:text-sm`}
                                        placeholder="John"
                                    />
                                </div>
                                {errors.firstName && touched.firstName && (
                                    <p className="text-xs text-red-300 flex items-center mt-1">
                                        <FiAlertCircle className="mr-1 h-3 w-3" />
                                        {errors.firstName}
                                    </p>
                                )}
                            </motion.div>

                            {/* Last Name */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-1"
                            >
                                <label className="block text-xs sm:text-sm font-medium text-white/80">Last Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                                        <FiUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all text-xs sm:text-sm"
                                        placeholder="Doe"
                                    />
                                </div>
                            </motion.div>

                            {/* Username */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-1"
                            >
                                <label className="block text-xs sm:text-sm font-medium text-white/80">Username *</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                                        <FiUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 bg-white/10 border ${
                                            errors.username && touched.username
                                                ? 'border-red-400'
                                                : 'border-white/20'
                                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all text-xs sm:text-sm`}
                                        placeholder="johndoe"
                                    />
                                </div>
                                {errors.username && touched.username && (
                                    <p className="text-xs text-red-300 flex items-center mt-1">
                                        <FiAlertCircle className="mr-1 h-3 w-3" />
                                        {errors.username}
                                    </p>
                                )}
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-1"
                            >
                                <label className="block text-xs sm:text-sm font-medium text-white/80">Email *</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                                        <FiMail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 bg-white/10 border ${
                                            errors.email && touched.email
                                                ? 'border-red-400'
                                                : 'border-white/20'
                                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all text-xs sm:text-sm`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {errors.email && touched.email && (
                                    <p className="text-xs text-red-300 flex items-center mt-1">
                                        <FiAlertCircle className="mr-1 h-3 w-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-1 sm:col-span-2"
                            >
                                <label className="block text-xs sm:text-sm font-medium text-white/80">Password *</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                                        <FiLock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-8 sm:pl-9 pr-10 py-2 sm:py-2.5 bg-white/10 border ${
                                            errors.password && touched.password
                                                ? 'border-red-400'
                                                : 'border-white/20'
                                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all text-xs sm:text-sm`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <FiEye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                    </button>
                                </div>
                                {errors.password && touched.password && (
                                    <p className="text-xs text-red-300 flex items-center mt-1">
                                        <FiAlertCircle className="mr-1 h-3 w-3" />
                                        {errors.password}
                                    </p>
                                )}
                                <p className="text-xs text-white/40 mt-1">
                                    Must be at least 6 characters with 1 number and 1 letter
                                </p>
                            </motion.div>
                        </div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm sm:text-base"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating Account...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <FiUserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Create Account
                                    </div>
                                )}
                            </button>
                        </motion.div>

                        {/* Login Link */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-center text-white/70 text-xs sm:text-sm"
                        >
                            Already have an account?{' '}
                            <Link to="/login" className="text-white font-semibold hover:underline">
                                Sign in
                            </Link>
                        </motion.p>
                    </form>

                    {/* Social Signup */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="mt-4 sm:mt-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-white/50 text-xs sm:text-sm">Or sign up with</span>
                            </div>
                        </div>

                        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                                { Icon: FiGithub },
                                { Icon: FiTwitter },
                                { Icon: FiFacebook }
                            ].map((social, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center py-2 sm:py-2.5 px-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all border border-white/20"
                                >
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

export default Register;