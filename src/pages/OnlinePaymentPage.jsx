// src/pages/OnlinePaymentPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import UPIPayment from '../components/UPIPayment';
import { 
    FiCreditCard, 
    FiLock, 
    FiCheckCircle,
    FiSmartphone,
    FiArrowLeft,
    FiMapPin,
    FiLoader,
    FiShield,
    FiDollarSign,
    FiPackage,
    FiTruck,
    FiShoppingBag,
    FiClock
} from 'react-icons/fi';
import {
    FaGooglePay,
    FaUniversity
} from 'react-icons/fa';
import { SiPhonepe } from 'react-icons/si';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51T2VPNFYMcuRPVfoHpfAhW31smAJDZk4cR5lo9QdrIg5Q160mSX8vRwm9uSPpSKnHVfLh8fUkGIGM4D0IPWGySfF00NIcS1BeT');

const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: FiCreditCard, description: 'Visa, Mastercard, RuPay', color: 'indigo' },
    { id: 'upi', name: 'UPI', icon: FiSmartphone, description: 'Google Pay, PhonePe, Paytm', color: 'purple' },
    { id: 'gpay', name: 'Google Pay', icon: FaGooglePay, description: 'Pay with GPay', color: 'blue' },
    { id: 'phonepe', name: 'PhonePe', icon: SiPhonepe, description: 'Pay with PhonePe', color: 'purple' },
    { id: 'netbanking', name: 'Net Banking', icon: FaUniversity, description: 'All major banks', color: 'green' },
];

const CardPaymentForm = ({ amount, onSuccess, selectedAddress, user }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState(null);
    const hasFetched = useRef(false);
    const [paymentOrderId] = useState(() => Math.floor(Math.random() * 1000000));

    useEffect(() => {
        const fetchClientSecret = async () => {
            if (hasFetched.current || !amount || !selectedAddress || !user) return;
            hasFetched.current = true;
            setError(null);

            try {
                const addressString = selectedAddress ? 
                    `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}` : '';

                const requestBody = {
                    orderId: Number(paymentOrderId),
                    amount: Number(amount),
                    currency: 'inr',
                    userId: user?.id ? Number(user.id) : null,
                    userEmail: user?.email || '',
                    shippingAddress: addressString,
                    phoneNumber: selectedAddress?.phoneNumber || '',
                    city: selectedAddress?.city || '',
                    pincode: selectedAddress?.pincode || '',
                    country: 'IN'
                };

                console.log('🚀 Card payment request:', requestBody);

                const response = await fetch('https://api-gateway-production-3d22.up.railway.app/api/stripe/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                setClientSecret(data.clientSecret);
                console.log('✅ Client secret received');
            } catch (error) {
                console.error('❌ Failed to get client secret:', error);
                setError(error.message);
                toast.error('Payment system error: ' + error.message);
                hasFetched.current = false;
            }
        };

        fetchClientSecret();
    }, [amount, selectedAddress, user, paymentOrderId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements || !clientSecret) {
            toast.error('Payment system not ready');
            setProcessing(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: user?.firstName || user?.username || 'Customer',
                    phone: selectedAddress?.phoneNumber || '',
                    email: user?.email || '',
                    address: {
                        line1: selectedAddress?.addressLine1 || '',
                        city: selectedAddress?.city || '',
                        state: selectedAddress?.state || '',
                        postal_code: selectedAddress?.pincode || '',
                        country: 'IN'
                    }
                }
            }
        });

        if (stripeError) {
            toast.error(stripeError.message);
            setProcessing(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            toast.success('Payment successful!');
            onSuccess({
                paymentIntentId: paymentIntent.id,
                orderId: paymentOrderId
            });
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
                    <p className="text-red-600 text-xs sm:text-sm">❌ {error}</p>
                </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                <p className="text-yellow-700 text-xs sm:text-sm flex items-center">
                    <FiShield className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    Test Mode - Use 4242 4242 4242 4242
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: window.innerWidth < 640 ? '14px' : '16px',
                                color: '#1f2937',
                                '::placeholder': { color: '#9ca3af' },
                            },
                        },
                        hidePostalCode: true,
                    }}
                    onChange={(e) => setCardComplete(e.complete)}
                />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
                <p>• Test card: 4242 4242 4242 4242</p>
                <p>• Any future expiry • Any CVV</p>
            </div>

            <button
                type="submit"
                disabled={!stripe || processing || !cardComplete || !clientSecret}
                className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
                {processing ? (
                    <>
                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                        Processing...
                    </>
                ) : (
                    <>
                        <FiCreditCard className="mr-2 h-4 w-4" />
                        Pay ₹{amount?.toFixed(2)}
                    </>
                )}
            </button>
        </form>
    );
};

const OnlinePaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const { user } = useAuth();
    
    const { amount, selectedAddress, cartItems } = location.state || {};
    
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [paymentOrderId] = useState(() => Math.floor(Math.random() * 1000000));
    const orderCreated = useRef(false);

    if (!amount || !selectedAddress || !cartItems || !user) {
        navigate('/checkout');
        return null;
    }

    const createOrderAfterPayment = async (paymentIntentId) => {
        if (orderCreated.current || processing) return;
        orderCreated.current = true;
        setProcessing(true);
    
        try {
            const token = localStorage.getItem('accessToken');
    
            if (paymentIntentId && paymentIntentId.startsWith('pi_')) {
                const confirmRes = await fetch(`https://api-gateway-production-3d22.up.railway.app/api/stripe/confirm/${paymentIntentId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!confirmRes.ok) {
                    throw new Error('Failed to confirm payment');
                }
                console.log('✅ Payment confirmed');
            }
    
            const orderPromises = cartItems.map(item => {
                const url = new URL(`https://api-gateway-production-3d22.up.railway.app/orders/online/${item.id}`);
                url.searchParams.append('quantity', item.quantity);
                url.searchParams.append('price', item.price);
                url.searchParams.append('address', `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`);
                url.searchParams.append('phone', selectedAddress.phoneNumber);
                url.searchParams.append('city', selectedAddress.city);
                url.searchParams.append('pincode', selectedAddress.pincode);
                url.searchParams.append('paymentId', paymentIntentId);
                url.searchParams.append('paymentMethod', selectedMethod === 'upi' ? 'UPI' : selectedMethod);
                
                console.log('📦 Creating order for item:', item.id, url.toString());
                
                return fetch(url.toString(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    }
                }).then(async res => {
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(`Order creation failed: ${res.status} - ${text}`);
                    }
                    const data = await res.json();
                    console.log('✅ Order created:', data);
                    return data;
                });
            });
    
            const results = await Promise.all(orderPromises);
            console.log('✅ All orders created successfully:', results);
            
            toast.success('Orders placed successfully!');
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('❌ Error in order creation:', error);
            toast.error('Payment succeeded but order creation failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentSuccess = async (paymentData) => {
        const paymentIntentId = typeof paymentData === 'string' ? paymentData : paymentData?.paymentIntentId;
        if (paymentIntentId) {
            await createOrderAfterPayment(paymentIntentId);
        }
    };

    const handleCancel = () => {
        if (processing) return;
        navigate('/checkout');
    };

    const handleSimulatedPayment = (method) => {
        if (processing) return;
        const mockPaymentIntentId = `${method.toLowerCase()}_${Date.now()}`;
        toast.success(`${method} payment successful!`);
        setTimeout(() => handlePaymentSuccess(mockPaymentIntentId), 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Back Button */}
                <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-indigo-600 mb-4 sm:mb-6 text-sm sm:text-base"
                    disabled={processing}
                >
                    <FiArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Back to Checkout
                </button>

                {/* Header */}
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">Complete Payment</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Choose your payment method</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Payment Methods */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6">
                            {/* Address Display */}
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                <div className="flex">
                                    <FiMapPin className="text-indigo-600 mr-2 sm:mr-3 mt-1 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">{selectedAddress.name}</p>
                                        <p className="text-xs sm:text-sm text-gray-600">{selectedAddress.phoneNumber}</p>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                                            {selectedAddress.addressLine1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            disabled={processing}
                                            className={`p-3 sm:p-4 border rounded-lg text-left transition-all ${
                                                selectedMethod === method.id
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 ${
                                                selectedMethod === method.id ? 'text-indigo-600' : 'text-gray-600'
                                            }`} />
                                            <p className="font-medium text-xs sm:text-sm text-gray-900">{method.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{method.description}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Payment Form Area */}
                            <div className="border-t pt-4 sm:pt-6">
                                {selectedMethod === 'card' && (
                                    <Elements stripe={stripePromise}>
                                        <CardPaymentForm
                                            amount={amount}
                                            onSuccess={handlePaymentSuccess}
                                            selectedAddress={selectedAddress}
                                            user={user}
                                        />
                                    </Elements>
                                )}
                                
                                {selectedMethod === 'upi' && (
                                    <UPIPayment
                                        amount={amount}
                                        orderId={paymentOrderId}
                                        onSuccess={handlePaymentSuccess}
                                        selectedAddress={selectedAddress}
                                        user={user}
                                    />
                                )}
                                
                                {selectedMethod === 'gpay' && (
                                    <div className="text-center py-4 sm:py-6">
                                        <FaGooglePay className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-blue-600" />
                                        <h3 className="font-medium text-sm sm:text-base mb-2">Google Pay</h3>
                                        <button
                                            onClick={() => handleSimulatedPayment('GPay')}
                                            disabled={processing}
                                            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            Pay ₹{amount?.toFixed(2)}
                                        </button>
                                    </div>
                                )}
                                
                                {selectedMethod === 'phonepe' && (
                                    <div className="text-center py-4 sm:py-6">
                                        <SiPhonepe className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-purple-600" />
                                        <h3 className="font-medium text-sm sm:text-base mb-2">PhonePe</h3>
                                        <button
                                            onClick={() => handleSimulatedPayment('PhonePe')}
                                            disabled={processing}
                                            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            Pay ₹{amount?.toFixed(2)}
                                        </button>
                                    </div>
                                )}
                                
                                {selectedMethod === 'netbanking' && (
                                    <div className="space-y-3">
                                        <select className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base">
                                            <option>Select your bank</option>
                                            <option>SBI</option>
                                            <option>HDFC</option>
                                            <option>ICICI</option>
                                            <option>Axis</option>
                                        </select>
                                        <button
                                            onClick={() => handleSimulatedPayment('NetBanking')}
                                            disabled={processing}
                                            className="w-full py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            Pay ₹{amount?.toFixed(2)}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 lg:sticky lg:top-24">
                            <h2 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h2>
                            
                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-48 sm:max-h-60 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 truncate mr-2">{item.name} × {item.quantity}</span>
                                        <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{amount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Delivery</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between font-medium pt-2 border-t text-sm sm:text-base">
                                    <span>Total</span>
                                    <span className="text-indigo-600">₹{amount?.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t text-center">
                                <p className="text-xs text-gray-500 flex items-center justify-center">
                                    <FiLock className="mr-1 h-3 w-3" />
                                    Secure payment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Overlay */}
            {processing && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 text-center max-w-xs w-full">
                        <FiLoader className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mx-auto mb-2 sm:mb-3" />
                        <p className="text-gray-700 text-sm sm:text-base">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlinePaymentPage;