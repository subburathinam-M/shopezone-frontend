// src/pages/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, 
    FiUser, 
    FiMail, 
    FiCalendar,
    FiShield,
    FiPower,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiChevronUp,
    FiAward,
    FiUserCheck,
    FiUserX,
    FiX,
    FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user: currentUser } = useAuth();

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        userDetails: null
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => 
                statusFilter === 'active' ? user.isActive : !user.isActive
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            
            if (sortField === 'createdAt') {
                aVal = new Date(aVal || 0);
                bVal = new Date(bVal || 0);
            }
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredUsers(filtered);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            const updatedUser = await adminService.toggleUserStatus(userId);
            setUsers(users.map(u => u.id === userId ? updatedUser : u));
            toast.success(
                <div className="flex items-center">
                    <FiShield className="mr-2 h-4 w-4" />
                    <span>User {updatedUser.isActive ? 'activated' : 'deactivated'} successfully</span>
                </div>
            );
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            toast.error('Failed to update user status');
        }
    };

    // Handle delete click - open modal
    const handleDeleteClick = (user, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't allow deleting yourself
        if (user.id === currentUser?.id) {
            toast.error('You cannot delete your own account');
            return;
        }
        
        setDeleteModal({
            isOpen: true,
            userId: user.id,
            userDetails: user
        });
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        const { userId, userDetails } = deleteModal;
        
        setDeleteModal({ isOpen: false, userId: null, userDetails: null });
        
        try {
            toast.loading('Deleting user...', { id: 'delete-user' });
            
            await adminService.deleteUser(userId);
            
            toast.dismiss('delete-user');
            
            // Remove from UI
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            
            toast.success(
                <div className="flex items-center">
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    <span>User deleted successfully</span>
                </div>
            );
            
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.dismiss('delete-user');
            toast.error('Failed to delete user');
            
            // Refresh if API failed
            await fetchUsers();
        }
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setDeleteModal({ isOpen: false, userId: null, userDetails: null });
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <FiChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />;
        return sortDirection === 'asc' ? 
            <FiChevronUp className="h-4 w-4 text-indigo-600" /> : 
            <FiChevronDown className="h-4 w-4 text-indigo-600" />;
    };

    if (loading) return <Spinner />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 sm:py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                                <FiUsers className="mr-2 sm:mr-3 text-indigo-600" size={24} />
                                User Management
                            </h1>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">
                                Manage all users registered in the system
                            </p>
                        </div>
                        <div className="bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-sm w-full sm:w-auto text-center sm:text-left">
                            <span className="text-xs sm:text-sm text-gray-500">Total Users</span>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">{filteredUsers.length}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Search Users
                            </label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="USER">User</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Users Table - Desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                <tr>
                                    {[
                                        { field: 'id', label: 'ID', icon: FiUser },
                                        { field: 'username', label: 'Username', icon: FiUser },
                                        { field: 'email', label: 'Email', icon: FiMail },
                                        { field: 'role', label: 'Role', icon: FiShield },
                                        { field: 'isActive', label: 'Status', icon: FiPower },
                                        { field: 'createdAt', label: 'Created', icon: FiCalendar },
                                        { field: null, label: 'Actions', icon: null }
                                    ].map((column, index) => (
                                        <th
                                            key={index}
                                            className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer group"
                                            onClick={() => column.field && handleSort(column.field)}
                                        >
                                            <div className="flex items-center space-x-1">
                                                {column.icon && <column.icon className="h-3 w-3 lg:h-4 lg:w-4" />}
                                                <span>{column.label}</span>
                                                {column.field && <SortIcon field={column.field} />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ backgroundColor: '#f9fafb' }}
                                            className="hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => viewUserDetails(user)}
                                        >
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{user.id}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base flex-shrink-0">
                                                        {user.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-3 lg:ml-4 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {user.username}
                                                        </div>
                                                        {user.firstName && (
                                                            <div className="text-xs lg:text-sm text-gray-500 truncate">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.role === 'ADMIN' 
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                    <FiShield className="mr-1 h-3 w-3" />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.isActive 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    {user.isActive ? (
                                                        <><FiUserCheck className="mr-1 h-3 w-3" /> Active</>
                                                    ) : (
                                                        <><FiUserX className="mr-1 h-3 w-3" /> Inactive</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                                                {user.id !== currentUser?.id && (
                                                    <div className="flex items-center space-x-1 lg:space-x-2" onClick={(e) => e.stopPropagation()}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => toggleUserStatus(user.id)}
                                                            className={`p-1.5 lg:p-2 rounded-lg transition-all ${
                                                                user.isActive 
                                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            }`}
                                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <FiPower className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                                        </motion.button>
                                                        
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => handleDeleteClick(user, e)}
                                                            className="p-1.5 lg:p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </motion.div>

                {/* Users Cards - Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:hidden space-y-3 sm:space-y-4"
                >
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
                            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 space-y-3"
                                onClick={() => viewUserDetails(user)}
                            >
                                {/* User Info */}
                                <div className="flex items-start space-x-3">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                            #{user.id} - {user.username}
                                        </h3>
                                        {user.firstName && (
                                            <p className="text-xs text-gray-500 truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        user.role === 'ADMIN' 
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                        <FiShield className="mr-1 h-3 w-3" />
                                        {user.role}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        user.isActive 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        {user.isActive ? (
                                            <><FiUserCheck className="mr-1 h-3 w-3" /> Active</>
                                        ) : (
                                            <><FiUserX className="mr-1 h-3 w-3" /> Inactive</>
                                        )}
                                    </span>
                                </div>

                                {/* Created Date */}
                                <p className="text-xs text-gray-400">
                                    Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>

                                {/* Action Buttons */}
                                {user.id !== currentUser?.id && (
                                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleUserStatus(user.id);
                                            }}
                                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all text-xs sm:text-sm font-medium ${
                                                user.isActive 
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            <FiPower className="mr-1.5 h-3.5 w-3.5" />
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => handleDeleteClick(user, e)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-xs sm:text-sm font-medium"
                                        >
                                            <FiTrash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Delete
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Details</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                                        {selectedUser.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{selectedUser.username}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">First Name</p>
                                        <p className="font-medium text-gray-900 text-sm">{selectedUser.firstName || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Last Name</p>
                                        <p className="font-medium text-gray-900 text-sm">{selectedUser.lastName || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Role</p>
                                        <p className="font-medium text-gray-900 text-sm">{selectedUser.role}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Status</p>
                                        <p className={`font-medium text-sm ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedUser.isActive ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div className="col-span-2 bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">Created At</p>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={deleteModal.userDetails ? 
                    `Are you sure you want to delete user "${deleteModal.userDetails.username}"? This action cannot be undone.` : 
                    'Are you sure you want to delete this user? This action cannot be undone.'
                }
            />
        </div>
    );
};

export default AdminUsers;