// src/components/UPIPayment.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSmartphone, FiLock, FiLoader, FiArrowLeft, FiShield, FiCheckCircle } from 'react-icons/fi';
import { FaGooglePay } from 'react-icons/fa';
import { SiPhonepe, SiPaytm } from 'react-icons/si';
import toast from 'react-hot-toast';

const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: FaGooglePay, color: 'bg-blue-50 text-blue-600' },
    { id: 'phonepe', name: 'PhonePe', icon: SiPhonepe, color: 'bg-purple-50 text-purple-600' },
    { id: 'paytm', name: 'Paytm', icon: SiPaytm, color: 'bg-blue-50 text-blue-600' },
    { id: 'bhim', name: 'BHIM', icon: FiSmartphone, color: 'bg-orange-50 text-orange-600' },
];

export const UPIPayment = ({ amount, orderId, onSuccess, selectedAddress, user }) => {
    const [selectedApp, setSelectedApp] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState('select'); // 'select' | 'enter' | 'processing' | 'success'
    const [clientSecret, setClientSecret] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [error, setError] = useState(null);
    const hasFetched = useRef(false);
    const [paymentOrderId] = useState(() => Math.floor(Math.random() * 1000000));

    // Fetch client secret when component mounts
    useEffect(() => {
        const fetchUpiIntent = async () => {
            if (hasFetched.current || !amount || !selectedAddress || !user) {
                console.log('Skipping fetch - missing data:', { amount, selectedAddress, user });
                return;
            }
            hasFetched.current = true;
            setError(null);

            try {
                const addressString = selectedAddress ? 
                    `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}` : 
                    '';

                const requestBody = {
                    orderId: paymentOrderId,
                    amount: amount,
                    currency: 'inr',
                    userId: user?.id,
                    userEmail: user?.email,
                    shippingAddress: addressString,
                    phoneNumber: selectedAddress?.phoneNumber || '',
                    city: selectedAddress?.city || '',
                    pincode: selectedAddress?.pincode || '',
                    country: 'IN'
                };

                console.log('🚀 Sending UPI request:', requestBody);

                const response = await fetch(
                    'https://api-gateway-production-3d22.up.railway.app/api/payments/upi/create-intent',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify(requestBody)
                });

                console.log('📡 Response status:', response.status);

                const data = await response.json();
                console.log('📡 Response data:', data);

                if (response.ok) {
                    setClientSecret(data.clientSecret);
                    setTransactionId(data.paymentIntentId);
                    console.log('✅ UPI intent created:', data.clientSecret);
                } else {
                    throw new Error(data.message || `HTTP ${response.status}: Failed to create UPI payment`);
                }
            } catch (error) {
                console.error('❌ Failed to create UPI intent:', error);
                setError(error.message);
                toast.error('UPI payment system error: ' + error.message);
                hasFetched.current = false;
            }
        };

        fetchUpiIntent();
    }, [amount, selectedAddress, user, paymentOrderId, orderId]); // ⭐ Added orderId

    // Confirm UPI payment
    const handleUpiSubmit = async (e) => {
        e.preventDefault();
        
        console.log('🔘 Pay button clicked', { clientSecret, upiId, selectedApp });
        
        if (!clientSecret) {
            toast.error('Payment not initialized yet. Please wait...');
            return;
        }
        
        if (!upiId || !selectedApp) {
            toast.error('Please complete all fields');
            return;
        }

        setProcessing(true);
        setStep('processing');

        try {
            console.log('🚀 Confirming UPI payment...');
            
            const confirmResponse = await fetch(
                `https://api-gateway-production-3d22.up.railway.app/api/payments/upi/confirm/${clientSecret}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    upiId: upiId,
                    upiApp: selectedApp
                })
            });

            console.log('📡 Confirm response status:', confirmResponse.status);

            const confirmData = await confirmResponse.json();
            console.log('📡 Confirm response data:', confirmData);

            if (confirmResponse.ok && confirmData.status === 'SUCCESS') {
                setStep('success');
                toast.success('UPI Payment successful!');
                setTimeout(() => {
                    // ⭐ FIXED: Pass object with paymentIntentId and orderId
                    onSuccess({
                        paymentIntentId: transactionId,
                        orderId: orderId
                    });
                }, 1500);
            } else {
                throw new Error(confirmData.message || 'UPI verification failed');
            }

        } catch (error) {
            console.error('❌ UPI payment failed:', error);
            toast.error(error.message || 'UPI payment failed');
            setStep('enter');
            setProcessing(false);
        }
    };

    // Success State
    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-500">Redirecting to order confirmation...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Show error if any */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">❌ {error}</p>
                    <button 
                        onClick={() => {
                            hasFetched.current = false;
                            setError(null);
                        }}
                        className="text-red-600 text-xs underline mt-1"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Step 1: Select UPI App */}
            {step === 'select' && (
                <>
                    <p className="text-sm text-gray-600 mb-3">Choose UPI app to pay</p>
                    <div className="grid grid-cols-2 gap-3">
                        {upiApps.map(app => (
                            <button
                                key={app.id}
                                onClick={() => {
                                    if (!clientSecret) {
                                        toast.error('Please wait, initializing payment...');
                                        return;
                                    }
                                    setSelectedApp(app.name);
                                    setStep('enter');
                                }}
                                disabled={!clientSecret}
                                className={`p-4 border-2 rounded-xl hover:border-indigo-500 transition-all ${app.color} ${!clientSecret ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <app.icon className="h-8 w-8 mx-auto mb-2" />
                                <span className="text-sm font-medium">{app.name}</span>
                            </button>
                        ))}
                    </div>
                    {!clientSecret && !error && (
                        <div className="flex flex-col items-center justify-center py-4">
                            <FiLoader className="animate-spin h-6 w-6 text-indigo-600 mb-2" />
                            <p className="text-sm text-gray-500">Initializing UPI payment...</p>
                        </div>
                    )}
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 flex items-center">
                            <FiShield className="mr-1" />
                            🧪 Test Mode - Use any UPI ID (e.g., test@upi)
                        </p>
                    </div>
                </>
            )}

            {/* Step 2: Enter UPI ID */}
            {step === 'enter' && (
                <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <button
                        type="button"
                        onClick={() => {
                            setStep('select');
                            setSelectedApp(null);
                        }}
                        className="text-indigo-600 text-sm flex items-center mb-2"
                    >
                        <FiArrowLeft className="mr-1" /> Back to apps
                    </button>
                    
                    <div className="flex items-center space-x-2 mb-4 p-3 bg-indigo-50 rounded-lg">
                        {selectedApp === 'Google Pay' && <FaGooglePay className="h-6 w-6 text-blue-600" />}
                        {selectedApp === 'PhonePe' && <SiPhonepe className="h-6 w-6 text-purple-600" />}
                        {selectedApp === 'Paytm' && <FiSmartphone className="h-6 w-6 text-blue-600" />}
                        {selectedApp === 'BHIM' && <FiSmartphone className="h-6 w-6 text-orange-600" />}
                        <span className="font-medium text-gray-700">{selectedApp}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter UPI ID
                        </label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank or 9876543210@ybl"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Test: any UPI ID works (e.g., test@upi)</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-700 flex items-center">
                            <FiLock className="mr-1" />
                            You will receive a notification on your {selectedApp} app to approve this payment
                        </p>
                    </div>

                    {/* 👇 DEBUG INFO - Remove after fixing */}
                    <div className="text-xs text-gray-400">
                        Debug: clientSecret={clientSecret ? '✅' : '❌'}, upiId={upiId || '❌'}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={processing || !upiId || !clientSecret}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {processing ? (
                            <>
                                <FiLoader className="animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <FiSmartphone className="mr-2" />
                                Pay ₹{amount?.toFixed(2)} via UPI
                            </>
                        )}
                    </motion.button>
                </form>
            )}

            {/* Processing State */}
            {step === 'processing' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiLoader className="animate-spin h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Processing UPI Payment...</h3>
                    <p className="text-sm text-gray-500">Please check your {selectedApp} app and approve the payment</p>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-yellow-700">🧪 Test Mode: Simulating UPI approval...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UPIPayment;