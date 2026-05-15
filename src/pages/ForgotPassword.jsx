// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiLoader, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://api-gateway-production-3d22.up.railway.app/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                toast.success('Reset link sent to your email!');
            } else {
                toast.error(data.message || 'Failed to send reset link');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 my-4 sm:my-8"
            >
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
                            submitted ? 'bg-green-100' : 'bg-indigo-100'
                        }`}
                    >
                        {submitted ? (
                            <FiCheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                        ) : (
                            <FiMail className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
                        )}
                    </motion.div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {submitted ? 'Check Your Email' : 'Forgot Password?'}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
                        {!submitted 
                            ? "Enter your email and we'll send you a reset link"
                            : 'Check your email for the reset link'
                        }
                    </p>
                </div>

                {!submitted ? (
                    /* Form */
                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base placeholder-gray-400"
                                    placeholder="you@example.com"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </motion.button>

                        {/* Back to Login */}
                        <div className="text-center pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                            >
                                <FiArrowLeft className="mr-1 h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    /* Success State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center space-y-5 sm:space-y-6"
                    >
                        <div>
                            <p className="text-sm sm:text-base text-gray-600">
                                We've sent a password reset link to:
                            </p>
                            <p className="text-base sm:text-lg font-medium text-indigo-600 mt-1 break-all">
                                {email}
                            </p>
                        </div>

                        {/* Email Tips */}
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-5 text-left">
                            <p className="text-xs sm:text-sm text-gray-600 mb-3">
                                Didn't receive the email?
                            </p>
                            <ul className="space-y-2 text-xs sm:text-sm text-gray-500">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Check your spam or junk folder
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Make sure you entered the correct email
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    The link expires in 30 minutes
                                </li>
                            </ul>
                        </div>

                        {/* Resend Button */}
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                            Try with a different email
                        </button>

                        {/* Return to Login */}
                        <div className="pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
                            >
                                Return to Login
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Help Text */}
                {!submitted && (
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                        <p className="text-xs sm:text-sm text-gray-500 text-center">
                            Need help?{' '}
                            <a href="mailto:support@shopzone.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                                Contact Support
                            </a>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;