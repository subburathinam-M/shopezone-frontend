// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        // Get token from URL query params
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        
        if (tokenParam) {
            setToken(tokenParam);
            validateToken(tokenParam);
        } else {
            setValidating(false);
            setIsValid(false);
        }
    }, [location]);

    const validateToken = async (token) => {
        try {
            const response = await fetch(`https://api-gateway-production-3d22.up.railway.app/api/auth/validate-reset-token?token=${token}`);
            
            if (response.ok) {
                setIsValid(true);
            } else {
                setIsValid(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setIsValid(false);
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://api-gateway-production-3d22.up.railway.app/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setResetSuccess(true);
                toast.success('Password reset successfully!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Validating your reset link...</p>
                </div>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
                    <p className="text-gray-600 mb-6">
                        The password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                    >
                        Request New Link
                    </button>
                </motion.div>
            </div>
        );
    }

    if (resetSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                    <FiLoader className="animate-spin h-6 w-6 text-indigo-600 mx-auto" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-gray-600 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <FiLoader className="animate-spin mr-2" />
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;