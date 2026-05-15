import React, { useState, useEffect,useRef  } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addressService } from '../services/addressService';
import { userService } from '../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiMapPin,
    FiHome,
    FiBriefcase,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiLogOut,
    FiLoader,
    FiAlertCircle,
    FiSave,
    FiX,
    FiEdit
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ========== PROFILE DISPLAY CARD (moved outside) ==========
const ProfileDisplayCard = ({ profileData, onEditClick }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 relative">
        <button
            onClick={onEditClick}
            className="absolute top-4 right-4 p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center"
            title="Edit Profile"
        >
            <FiEdit className="h-4 w-4 mr-1" />
            <span className="text-sm">Edit</span>
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Personal Information
        </h2>
        
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        First Name
                    </label>
                    <div className="text-gray-900 text-lg font-medium">
                        {profileData.firstName || '—'}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Name
                    </label>
                    <div className="text-gray-900 text-lg font-medium">
                        {profileData.lastName || '—'}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                </label>
                <div className="flex items-center text-gray-900">
                    <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                    {profileData.email || '—'}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    Mobile Number
                </label>
                <div className="flex items-center text-gray-900">
                    <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                    {profileData.phoneNumber || '—'}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    Gender
                </label>
                <div className="text-gray-900">
                    {profileData.gender || '—'}
                </div>
            </div>
        </div>
    </div>
);

// ========== PROFILE EDIT FORM (moved outside) ==========
const ProfileEditForm = ({ 
    profileData, 
    onInputChange, 
    onGenderChange, 
    onSave, 
    onCancel, 
    isLoading 
}) => (
    <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
                Edit Personal Information
            </h2>
            <button
                onClick={onCancel}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                title="Cancel"
            >
                <FiX className="h-5 w-5" />
            </button>
        </div>
        
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={onInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter first name"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={onInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter last name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed text-gray-600"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                </label>
                <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={onInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter mobile number"
                        maxLength="10"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                </label>
                <div className="flex space-x-6">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="gender"
                            value="MALE"
                            checked={profileData.gender === 'MALE'}
                            onChange={onGenderChange}
                            className="mr-2 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        Male
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="gender"
                            value="FEMALE"
                            checked={profileData.gender === 'FEMALE'}
                            onChange={onGenderChange}
                            className="mr-2 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        Female
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="gender"
                            value="OTHER"
                            checked={profileData.gender === 'OTHER'}
                            onChange={onGenderChange}
                            className="mr-2 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        Other
                    </label>
                </div>
            </div>

            <div className="flex space-x-4 pt-4">
                <button
                    onClick={onSave}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <FiLoader className="animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <FiSave className="mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: ''
    });

    const [originalProfileData, setOriginalProfileData] = useState({});

    const [addressForm, setAddressForm] = useState({
        addressType: 'HOME',
        name: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
    });

    const [formErrors, setFormErrors] = useState({});

// eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchUserProfile();
    }, []);
// eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [activeTab]);

    const fetchUserProfile = async () => {
        try {
            setProfileLoading(true);
            const data = await userService.getProfile();
            setProfileData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                gender: data.gender || ''
            });
            setOriginalProfileData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                gender: data.gender || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressService.getUserAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenderChange = (e) => {
        setProfileData(prev => ({ ...prev, gender: e.target.value }));
    };

    const isUpdating = useRef(false);
    const hasShownSuccess = useRef(false);
    
    const handleProfileUpdate = async () => {
        // Block if already running or success already shown
        if (isUpdating.current || hasShownSuccess.current) return;
        
        isUpdating.current = true;
        setProfileLoading(true);
        
        try {
            const updatedUser = await userService.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phoneNumber: profileData.phoneNumber,
                gender: profileData.gender
            });
    
            if (updateUser) updateUser(updatedUser);
            setOriginalProfileData({ ...profileData });
            setIsEditingProfile(false);
            
            // Show toast only once
            if (!hasShownSuccess.current) {
                hasShownSuccess.current = true;
                // toast.success('Profile updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
            isUpdating.current = false;
            // Reset the success flag after a short delay (allows future edits)
            setTimeout(() => { hasShownSuccess.current = false; }, 500);
        }
    };

    const handleCancelEdit = () => {
        setProfileData({...originalProfileData});
        setIsEditingProfile(false);
        setFormErrors({});
    };

    const handleEditClick = () => {
        setIsEditingProfile(true);
    };

    // ========== ADDRESS HANDLERS (unchanged) ==========
    const validateAddressForm = () => {
        const errors = {};
        if (!addressForm.name.trim()) errors.name = 'Name is required';
        if (!addressForm.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
        else if (!/^\d{10}$/.test(addressForm.phoneNumber)) errors.phoneNumber = 'Phone number must be 10 digits';
        if (!addressForm.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
        if (!addressForm.city.trim()) errors.city = 'City is required';
        if (!addressForm.state.trim()) errors.state = 'State is required';
        if (!addressForm.pincode.trim()) errors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(addressForm.pincode)) errors.pincode = 'Pincode must be 6 digits';
        if (!addressForm.country.trim()) errors.country = 'Country is required';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddressSubmit = async () => {
        if (!validateAddressForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }

        setAddressLoading(true);
        try {
            if (editingAddress) {
                await addressService.updateAddress(editingAddress.id, addressForm);
                toast.success('Address updated successfully');
            } else {
                await addressService.addAddress(addressForm);
                toast.success('Address added successfully');
            }
            await fetchAddresses();
            setShowAddressForm(false);
            setEditingAddress(null);
            resetAddressForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await addressService.deleteAddress(addressId);
            toast.success('Address deleted successfully');
            await fetchAddresses();
            setDeleteConfirm(null);
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await addressService.setDefaultAddress(addressId);
            toast.success('Default address updated');
            await fetchAddresses();
        } catch (error) {
            toast.error('Failed to set default address');
        }
    };

    const editAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            addressType: address.addressType,
            name: address.name,
            phoneNumber: address.phoneNumber,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            isDefault: address.isDefault
        });
        setShowAddressForm(true);
        setFormErrors({});
    };

    const resetAddressForm = () => {
        setAddressForm({
            addressType: 'HOME',
            name: '',
            phoneNumber: '',
            addressLine1: '',
            addressLine2: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            isDefault: false
        });
        setFormErrors({});
    };

    const getAddressTypeIcon = (type) => {
        switch(type) {
            case 'HOME': return <FiHome className="h-5 w-5" />;
            case 'WORK': return <FiBriefcase className="h-5 w-5" />;
            default: return <FiMapPin className="h-5 w-5" />;
        }
    };

    const getAddressTypeColor = (type) => {
        switch(type) {
            case 'HOME': return 'bg-green-100 text-green-600';
            case 'WORK': return 'bg-blue-100 text-blue-600';
            default: return 'bg-purple-100 text-purple-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Hello, {profileData.firstName || user?.username || 'User'}
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your profile and addresses</p>
                    </div>
                    {/* <button
                        onClick={logout}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <FiLogOut className="mr-2 h-5 w-5" />
                        Logout
                    </button> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-24">
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                                        activeTab === 'profile' 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    <FiUser className="mr-3 h-5 w-5" />
                                    Profile Information
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                                        activeTab === 'addresses' 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    <FiMapPin className="mr-3 h-5 w-5" />
                                    Manage Addresses
                                    {addresses.length > 0 && (
                                        <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                            {addresses.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {profileLoading && !profileData.firstName ? (
                                        <div className="flex justify-center py-8 bg-white rounded-2xl shadow-xl p-12">
                                            <FiLoader className="h-8 w-8 text-indigo-600 animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            {isEditingProfile ? (
                                                <ProfileEditForm
                                                    profileData={profileData}
                                                    onInputChange={handleInputChange}
                                                    onGenderChange={handleGenderChange}
                                                    onSave={handleProfileUpdate}
                                                    onCancel={handleCancelEdit}
                                                    isLoading={profileLoading}
                                                />
                                            ) : (
                                                <ProfileDisplayCard
                                                    profileData={profileData}
                                                    onEditClick={handleEditClick}
                                                />
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    {!showAddressForm ? (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    Manage Addresses
                                                </h2>
                                                <button
                                                    onClick={() => {
                                                        setEditingAddress(null);
                                                        resetAddressForm();
                                                        setShowAddressForm(true);
                                                    }}
                                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                                >
                                                    <FiPlus className="mr-2 h-5 w-5" />
                                                    Add New Address
                                                </button>
                                            </div>

                                            {loading ? (
                                                <div className="flex justify-center items-center py-12 bg-white rounded-2xl shadow-xl">
                                                    <FiLoader className="h-8 w-8 text-indigo-600 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {addresses.map(address => (
                                                        <motion.div
                                                            key={address.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all ${
                                                                address.isDefault ? 'border-indigo-500' : 'border-transparent hover:border-indigo-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start space-x-4">
                                                                    <div className={`p-3 rounded-xl ${getAddressTypeColor(address.addressType)}`}>
                                                                        {getAddressTypeIcon(address.addressType)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center space-x-3 mb-2 flex-wrap">
                                                                            <span className="font-semibold text-gray-900">
                                                                                {address.name}
                                                                            </span>
                                                                            <span className="text-gray-400">|</span>
                                                                            <span className="text-gray-600">
                                                                                {address.phoneNumber}
                                                                            </span>
                                                                            {address.isDefault && (
                                                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                                    Default
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-gray-600">
                                                                            {address.addressLine1}
                                                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                                                        </p>
                                                                        {address.landmark && (
                                                                            <p className="text-gray-500 text-sm">
                                                                                Landmark: {address.landmark}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-gray-600">
                                                                            {address.city}, {address.state} - {address.pincode}
                                                                        </p>
                                                                        <p className="text-gray-500 text-sm">
                                                                            {address.country}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex space-x-2 ml-4">
                                                                    {!address.isDefault && (
                                                                        <button
                                                                            onClick={() => handleSetDefault(address.id)}
                                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                            title="Set as default"
                                                                        >
                                                                            <FiCheckCircle className="h-5 w-5" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => editAddress(address)}
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="Edit address"
                                                                    >
                                                                        <FiEdit2 className="h-5 w-5" />
                                                                    </button>
                                                                    {deleteConfirm === address.id ? (
                                                                        <div className="flex space-x-1">
                                                                            <button
                                                                                onClick={() => handleDeleteAddress(address.id)}
                                                                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                                                                            >
                                                                                Confirm
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setDeleteConfirm(null)}
                                                                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setDeleteConfirm(address.id)}
                                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                            title="Delete address"
                                                                        >
                                                                            <FiTrash2 className="h-5 w-5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}

                                                    {addresses.length === 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-center py-16 bg-white rounded-2xl shadow-xl"
                                                        >
                                                            <FiMapPin className="mx-auto h-16 w-16 text-gray-300" />
                                                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                                                No addresses saved
                                                            </h3>
                                                            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                                                Add your first address to make checkout faster and easier
                                                            </p>
                                                            <button
                                                                onClick={() => {
                                                                    resetAddressForm();
                                                                    setShowAddressForm(true);
                                                                }}
                                                                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all inline-flex items-center"
                                                            >
                                                                <FiPlus className="mr-2 h-5 w-5" />
                                                                Add Your First Address
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-2xl shadow-xl p-6"
                                        >
                                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                                            </h2>

                                            {/* Address Form */}
                                            <div className="space-y-4">
                                                {/* Address Type Selection */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Address Type
                                                    </label>
                                                    <div className="flex space-x-4">
                                                        {['HOME', 'WORK', 'OTHER'].map(type => (
                                                            <label key={type} className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="addressType"
                                                                    value={type}
                                                                    checked={addressForm.addressType === type}
                                                                    onChange={(e) => setAddressForm({...addressForm, addressType: e.target.value})}
                                                                    className="mr-2 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                                />
                                                                <span className="flex items-center">
                                                                    {getAddressTypeIcon(type)}
                                                                    <span className="ml-1">{type}</span>
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Name and Phone */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Full Name <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.name}
                                                            onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                                                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="Enter full name"
                                                        />
                                                        {formErrors.name && (
                                                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                                                <FiAlertCircle className="mr-1" /> {formErrors.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Phone Number <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={addressForm.phoneNumber}
                                                            onChange={(e) => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                                                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="10 digit mobile number"
                                                            maxLength="10"
                                                        />
                                                        {formErrors.phoneNumber && (
                                                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                                                <FiAlertCircle className="mr-1" /> {formErrors.phoneNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Address Line 1 */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Address Line 1 <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.addressLine1}
                                                        onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                                                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                            formErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                        placeholder="House no., Building name, Street"
                                                    />
                                                    {formErrors.addressLine1 && (
                                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                                            <FiAlertCircle className="mr-1" /> {formErrors.addressLine1}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Address Line 2 (Optional) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Address Line 2 (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.addressLine2}
                                                        onChange={(e) => setAddressForm({...addressForm, addressLine2: e.target.value})}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        placeholder="Area, Locality"
                                                    />
                                                </div>

                                                {/* Landmark (Optional) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Landmark (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.landmark}
                                                        onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        placeholder="Nearby landmark"
                                                    />
                                                </div>

                                                {/* City, State, Pincode, Country */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            City <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.city}
                                                            onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                formErrors.city ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="Enter city"
                                                        />
                                                        {formErrors.city && (
                                                            <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            State <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.state}
                                                            onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                                                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                formErrors.state ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="Enter state"
                                                        />
                                                        {formErrors.state && (
                                                            <p className="mt-1 text-xs text-red-500">{formErrors.state}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Pincode <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.pincode}
                                                            onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                                                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                formErrors.pincode ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="6 digit pincode"
                                                            maxLength="6"
                                                        />
                                                        {formErrors.pincode && (
                                                            <p className="mt-1 text-xs text-red-500">{formErrors.pincode}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Country <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.country}
                                                            onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                                                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                formErrors.country ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="Enter country"
                                                        />
                                                        {formErrors.country && (
                                                            <p className="mt-1 text-xs text-red-500">{formErrors.country}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Set as Default Checkbox */}
                                                <div className="flex items-center pt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isDefault"
                                                        checked={addressForm.isDefault}
                                                        onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                                                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                                                        Set as default address
                                                    </label>
                                                </div>

                                                {/* Form Buttons */}
                                                <div className="flex space-x-4 pt-6">
                                                    <button
                                                        onClick={handleAddressSubmit}
                                                        disabled={addressLoading}
                                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {addressLoading ? (
                                                            <>
                                                                <FiLoader className="animate-spin mr-2" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            editingAddress ? 'Update Address' : 'Save Address'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddressForm(false);
                                                            setEditingAddress(null);
                                                            resetAddressForm();
                                                        }}
                                                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;