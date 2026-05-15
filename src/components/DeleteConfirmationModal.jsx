// src/components/DeleteConfirmationModal.jsx
import React from 'react';
import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX size={20} />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        {/* Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <FiAlertTriangle className="h-8 w-8 text-red-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            {title || 'Delete Item'}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-500 text-center mb-6">
                            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
                        </p>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                            >
                                <FiTrash2 size={18} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;