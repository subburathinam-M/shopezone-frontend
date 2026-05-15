// src/pages/Checkout.jsx (with inline address form)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addressService } from '../services/addressService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiMapPin, 
    FiHome,
    FiBriefcase,
    FiPlus,
    FiArrowLeft,
    FiTruck,
    FiCreditCard,
    FiCheckCircle,
    FiLoader,
    FiEdit2,
    FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import StripePayment from '../components/StripePayment';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressList, setShowAddressList] = useState(false);
    const [showInlineAddForm, setShowInlineAddForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [orderPlacing, setOrderPlacing] = useState(false);
    
    const [newAddress, setNewAddress] = useState({
        addressType: 'HOME',
        name: user?.firstName + ' ' + user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
    });

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
        fetchAddresses();
    }, [cartItems, navigate]);

    const fetchAddresses = async () => {
        try {
            setAddressLoading(true);
            const data = await addressService.getUserAddresses();
            setAddresses(data);
            const defaultAddr = data.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            } else if (data.length > 0) {
                setSelectedAddress(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.name || !newAddress.phoneNumber || !newAddress.addressLine1 || 
            !newAddress.city || !newAddress.state || !newAddress.pincode) {
            toast.error('Please fill all required fields');
            return;
        }
        if (!/^\d{10}$/.test(newAddress.phoneNumber)) {
            toast.error('Phone number must be 10 digits');
            return;
        }
        if (!/^\d{6}$/.test(newAddress.pincode)) {
            toast.error('Pincode must be 6 digits');
            return;
        }
        try {
            setLoading(true);
            const saved = await addressService.addAddress(newAddress);
            setAddresses([...addresses, saved]);
            setSelectedAddress(saved);
            setShowAddressList(false);
            setShowInlineAddForm(false);
            resetAddressForm();
            toast.success('Address added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        setShowAddressList(false);
        toast.success('Address updated');
    };

    const resetAddressForm = () => {
        setNewAddress({
            addressType: 'HOME',
            name: user?.firstName + ' ' + user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            addressLine1: '',
            addressLine2: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            isDefault: false
        });
    };

    // ========== ORDER CREATION ==========
    const createOrder = async () => {

        if (paymentMethod === 'ONLINE') {
    
            console.warn('🔶 Using MOCK order creation for online payment');
    
            await new Promise(resolve => setTimeout(resolve, 500));
    
            return Math.floor(Math.random() * 1000000);
    
        } else {
    
            setOrderPlacing(true);
    
            try {
    
                for (const item of cartItems) {
    
                    const response = await fetch(
                        `https://api-gateway-production-3d22.up.railway.app/orders/cod/${item.id}?quantity=${item.quantity}&address=${encodeURIComponent(
                            `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
                        )}&phone=${selectedAddress.phoneNumber}&city=${selectedAddress.city}&pincode=${selectedAddress.pincode}`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }
                    );
    
                    if (!response.ok) {
                        throw new Error('Failed to place COD order');
                    }
                }
    
                clearCart();
    
                toast.success('COD Order placed successfully!');
    
                navigate('/orders');
    
            } catch (error) {
    
                console.error('COD order failed:', error);
    
                toast.error('Failed to place COD order. Please try again.');
    
            } finally {
    
                setOrderPlacing(false);
            }
    
            return null;
        }
    };

    const handleCODOrder = async () => {
        await createOrder();
    };

    const handleOnlinePayment = async () => {
        setOrderPlacing(true);
        try {
            const mockOrderId = await createOrder();
            navigate('/online-payment', {
                state: {
                    amount: getCartTotal(),
                    selectedAddress: selectedAddress,
                    cartItems: cartItems
                }
            });
        } catch (error) {
            console.error('Failed to create order:', error);
            toast.error('Failed to initiate payment');
        } finally {
            setOrderPlacing(false);
        }
    };

    const onPaymentSuccess = async () => {
        clearCart();
        navigate('/orders');
    };

    const handleContinueClick = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }
        if (paymentMethod === 'COD') {
            await handleCODOrder();
        } else {
            await handleOnlinePayment();
        }
    };

    const getAddressTypeIcon = (type) => {
        switch(type) {
            case 'HOME': return <FiHome className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 'WORK': return <FiBriefcase className="h-4 w-4 sm:h-5 sm:w-5" />;
            default: return <FiMapPin className="h-4 w-4 sm:h-5 sm:w-5" />;
        }
    };

    const getAddressTypeColor = (type) => {
        switch(type) {
            case 'HOME': return 'bg-green-100 text-green-600';
            case 'WORK': return 'bg-blue-100 text-blue-600';
            default: return 'bg-purple-100 text-purple-600';
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 md:py-8">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center text-gray-600 hover:text-indigo-600 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
                >
                    <FiArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Back to Cart
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Left Column - Delivery Address */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                                <FiMapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                Delivery Address
                            </h2>

                            {addressLoading ? (
                                <div className="flex justify-center items-center py-8 sm:py-12">
                                    <FiLoader className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* No addresses yet */}
                                    {addresses.length === 0 && !showInlineAddForm && (
                                        <div className="text-center py-6 sm:py-8">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                                <FiMapPin className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">No saved addresses</p>
                                            <button
                                                onClick={() => setShowInlineAddForm(true)}
                                                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                                            >
                                                <FiPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                Add New Address
                                            </button>
                                        </div>
                                    )}

                                    {/* Selected Address View */}
                                    {!showAddressList && !showInlineAddForm && selectedAddress && (
                                        <motion.div
                                            key="selected"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="mb-4 p-3 sm:p-4 border-2 border-indigo-600 bg-indigo-50 rounded-lg sm:rounded-xl"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                                                    <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getAddressTypeColor(selectedAddress.addressType)}`}>
                                                        {getAddressTypeIcon(selectedAddress.addressType)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                                                                {selectedAddress.name}
                                                            </span>
                                                            <span className="text-gray-400 text-xs sm:text-sm">|</span>
                                                            <span className="text-gray-600 text-xs sm:text-sm">
                                                                {selectedAddress.phoneNumber}
                                                            </span>
                                                            {selectedAddress.isDefault && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                            {selectedAddress.addressLine1}
                                                            {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                                                        </p>
                                                        {selectedAddress.landmark && (
                                                            <p className="text-xs sm:text-sm text-gray-500">
                                                                Landmark: {selectedAddress.landmark}
                                                            </p>
                                                        )}
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                                        </p>
                                                    </div>
                                                </div>
                                                <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0 ml-2" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Address List View */}
                                    {showAddressList && !showInlineAddForm && (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-3 sm:space-y-4 mb-4"
                                        >
                                            <p className="text-sm font-medium text-gray-700 mb-2">Select Delivery Address</p>
                                            {addresses.map(address => (
                                                <motion.div
                                                    key={address.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onClick={() => handleSelectAddress(address)}
                                                    className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                                                        selectedAddress?.id === address.id
                                                            ? 'border-indigo-600 bg-indigo-50'
                                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                                                            <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getAddressTypeColor(address.addressType)}`}>
                                                                {getAddressTypeIcon(address.addressType)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                                                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                                                                        {address.name}
                                                                    </span>
                                                                    <span className="text-gray-400 text-xs sm:text-sm">|</span>
                                                                    <span className="text-gray-600 text-xs sm:text-sm">
                                                                        {address.phoneNumber}
                                                                    </span>
                                                                    {address.isDefault && (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                                    {address.addressLine1}
                                                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                                                </p>
                                                                {address.landmark && (
                                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                                        Landmark: {address.landmark}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs sm:text-sm text-gray-600">
                                                                    {address.city}, {address.state} - {address.pincode}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {selectedAddress?.id === address.id && (
                                                            <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0 ml-2" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* Add New Address button inside list */}
                                            <button
                                                onClick={() => setShowInlineAddForm(true)}
                                                className="w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center text-gray-600 hover:text-indigo-600 text-sm sm:text-base"
                                            >
                                                <FiPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                Add New Address
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Inline Add Address Form */}
                                    {showInlineAddForm && (
                                        <motion.div
                                            key="add-form"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-3 sm:space-y-4 border-2 border-indigo-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-indigo-50"
                                        >
                                            <h3 className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                                                <FiPlus className="mr-2 text-indigo-600 h-4 w-4 sm:h-5 sm:w-5" />
                                                Add New Address
                                            </h3>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                            Full Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newAddress.name}
                                                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            placeholder="Enter full name"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                            Phone Number
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={newAddress.phoneNumber}
                                                            onChange={(e) => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            placeholder="10 digit mobile number"
                                                            maxLength="10"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                        Address Line 1
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newAddress.addressLine1}
                                                        onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        placeholder="House no., Building name, Street"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                        Address Line 2 (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newAddress.addressLine2}
                                                        onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        placeholder="Area, Locality"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                        Landmark (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newAddress.landmark}
                                                        onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        placeholder="Nearby landmark"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newAddress.city}
                                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                            State
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newAddress.state}
                                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                            Pincode
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newAddress.pincode}
                                                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            maxLength="6"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                            Country
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newAddress.country}
                                                            onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="isDefaultInline"
                                                        checked={newAddress.isDefault}
                                                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="isDefaultInline" className="text-xs sm:text-sm text-gray-700">
                                                        Set as default address
                                                    </label>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                                                    <button
                                                        onClick={handleAddAddress}
                                                        disabled={loading}
                                                        className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base order-1 sm:order-none"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <FiLoader className="animate-spin mr-2 h-4 w-4" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            'Save & Continue'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowInlineAddForm(false);
                                                            resetAddressForm();
                                                        }}
                                                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-sm sm:text-base order-2 sm:order-none"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Change Address Button */}
                                    {!showAddressList && !showInlineAddForm && addresses.length > 0 && (
                                        <button
                                            onClick={() => setShowAddressList(true)}
                                            className="w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center text-gray-600 hover:text-indigo-600 text-sm sm:text-base"
                                        >
                                            <FiEdit2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            Change Address ({addresses.length} available)
                                        </button>
                                    )}

                                    {/* Back button when in list view */}
                                    {showAddressList && !showInlineAddForm && (
                                        <button
                                            onClick={() => setShowAddressList(false)}
                                            className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm flex items-center"
                                        >
                                            <FiArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                            Back to selected address
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div>
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:sticky lg:top-24">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                                Order Summary
                            </h2>
                            
                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-48 sm:max-h-60 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 truncate mr-2">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium flex-shrink-0">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 sm:pt-4 space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">
                                        ₹{getCartTotal().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Delivery</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg font-bold mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                                    <span>Total</span>
                                    <span className="text-indigo-600">
                                        ₹{getCartTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                                <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Payment Method</h3>
                                <div className="space-y-2">
                                    <label className={`flex items-center p-2.5 sm:p-3 border rounded-xl cursor-pointer transition-all ${
                                        paymentMethod === 'COD' 
                                            ? 'border-indigo-600 bg-indigo-50' 
                                            : 'hover:border-indigo-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-2 sm:mr-3 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <FiTruck className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 ${
                                            paymentMethod === 'COD' ? 'text-indigo-600' : 'text-gray-500'
                                        }`} />
                                        <span className="text-sm sm:text-base">Cash on Delivery</span>
                                    </label>
                                    <label className={`flex items-center p-2.5 sm:p-3 border rounded-xl cursor-pointer transition-all ${
                                        paymentMethod === 'ONLINE' 
                                            ? 'border-indigo-600 bg-indigo-50' 
                                            : 'hover:border-indigo-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="ONLINE"
                                            checked={paymentMethod === 'ONLINE'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-2 sm:mr-3 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <FiCreditCard className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 ${
                                            paymentMethod === 'ONLINE' ? 'text-indigo-600' : 'text-gray-500'
                                        }`} />
                                        <span className="text-sm sm:text-base">Online Payment</span>
                                    </label>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinueClick}
                                disabled={orderPlacing || !selectedAddress || addressLoading || showAddressList || showInlineAddForm}
                                className="w-full mt-4 sm:mt-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center text-sm sm:text-base"
                            >
                                {orderPlacing ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                                        Processing...
                                    </>
                                ) : (
                                    'Continue to Payment'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;