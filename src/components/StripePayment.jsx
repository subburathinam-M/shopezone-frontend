// src/components/StripePayment.jsx
import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ amount, onSuccess, orderId, selectedAddress, user }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientSecret = async () => {
            try {
                setError(null);
                console.log('Fetching client secret for order:', orderId);
                console.log('Selected Address:', selectedAddress);
                console.log('User:', user);
                
                // Format address string
                const addressString = selectedAddress ? 
                    `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}` : 
                    '';
                
                // Send ALL address fields to backend
                const requestBody = {
                    orderId: orderId,
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
                
                console.log('Sending to backend:', requestBody);
                
                const response = await fetch(
                    'https://api-gateway-production-3d22.up.railway.app/api/stripe/create-payment-intent', {
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
                console.log('Client secret received:', data.clientSecret);
            } catch (error) {
                console.error('Failed to get client secret:', error);
                setError(error.message);
                toast.error('Payment system error. Please try COD.');
            }
        };

        // Only fetch if we have all required data
        if (amount > 0 && orderId && selectedAddress && user) {
            fetchClientSecret();
        } else {
            console.log('Missing data:', { amount, orderId, selectedAddress, user });
        }
    }, [amount, orderId, selectedAddress, user]);

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
            // ⭐ FIXED: Pass object with paymentIntentId and orderId
            onSuccess({
                paymentIntentId: paymentIntent.id,
                orderId: orderId
            });
        }
        
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">❌ {error}</p>
                </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-yellow-700 text-xs font-medium">🧪 TEST MODE - No real money</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 focus-within:border-indigo-500">
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': { color: '#aab7c4' },
                            },
                        },
                        hidePostalCode: true,
                    }}
                    onChange={(e) => setCardComplete(e.complete)}
                />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-2">
                <span>Test: 4242 4242 4242 4242</span>
                <span>Any future expiry</span>
                <span>Any CVV</span>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!stripe || processing || !cardComplete || !clientSecret}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
                {processing ? (
                    <div className="flex items-center justify-center">
                        <FiLoader className="animate-spin mr-2" />
                        Processing...
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <FiCreditCard className="mr-2 h-5 w-5" />
                        Pay ₹{amount?.toFixed(2)}
                        <FiLock className="ml-2 h-4 w-4" />
                    </div>
                )}
            </motion.button>
        </form>
    );
};

export const StripePayment = ({ amount, onSuccess, orderId, selectedAddress, user }) => {
    // Don't render if missing required data
    if (!selectedAddress || !user) {
        console.log('StripePayment: Missing selectedAddress or user');
        return (
            <div className="text-center py-4 text-red-500">
                Missing address information. Please go back and select address.
            </div>
        );
    }
    
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm 
                amount={amount} 
                onSuccess={onSuccess} 
                orderId={orderId}
                selectedAddress={selectedAddress}
                user={user}
            />
        </Elements>
    );
};

export default StripePayment;