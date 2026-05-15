// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { orderService } from '../services/orderService';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Load cart for specific user
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserCart();
        } else {
            setCartItems([]);
        }
    }, [isAuthenticated, user]);

    const loadUserCart = () => {
        try {
            const cartKey = `cart_${user.id}`;
            const savedCart = localStorage.getItem(cartKey);
            
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
                console.log(`Cart loaded for user ${user.username}:`, JSON.parse(savedCart));
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    // Save cart for specific user
    useEffect(() => {
        if (isAuthenticated && user) {
            const cartKey = `cart_${user.id}`;
            if (cartItems.length > 0) {
                localStorage.setItem(cartKey, JSON.stringify(cartItems));
            } else {
                localStorage.removeItem(cartKey);
            }
        }
    }, [cartItems, isAuthenticated, user]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    toast.success(`Added another ${product.name} to cart`);
                    return prev.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    toast.error(`Only ${product.stock} items available`);
                    return prev;
                }
            } else {
                if (product.stock > 0) {
                    toast.success(`${product.name} added to cart`);
                    
                    let imageUrl = null;
                    if (product.images && product.images.length > 0) {
                        imageUrl = product.images[0].imageUrl;
                    } else if (product.imageUrls && product.imageUrls.length > 0) {
                        imageUrl = product.imageUrls[0];
                    }
                    
                    return [...prev, { 
                        id: product.id, 
                        name: product.name, 
                        price: product.price, 
                        image: imageUrl,
                        stock: product.stock,
                        quantity: 1 
                    }];
                } else {
                    toast.error('Out of stock');
                    return prev;
                }
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => {
            const item = prev.find(i => i.id === productId);
            if (item) {
                toast.success(`${item.name} removed from cart`);
            }
            return prev.filter(item => item.id !== productId);
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        setCartItems(prev =>
            prev.map(item => {
                if (item.id === productId) {
                    if (quantity <= item.stock) {
                        return { ...item, quantity };
                    } else {
                        toast.error(`Only ${item.stock} items available`);
                        return item;
                    }
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
        // toast.success('Cart cleared');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    // 🔥 FIXED: Actual API call to place order
    const placeOrder = async (productId, quantity) => {
        try {
            setPlacingOrder(true);
            console.log(`Placing order for product ${productId} with quantity ${quantity}`);
            
            const response = await orderService.placeOrderWithQuantity(productId, quantity);
            
            if (response?.success) {
                // After successful order, refresh products everywhere
                window.dispatchEvent(new CustomEvent('productsUpdated'));
                window.dispatchEvent(new CustomEvent('refreshProducts'));
                
                // toast.success(
                //     <div className="flex items-center">
                //         <FiCheckCircle className="mr-2 h-5 w-5 text-green-500" />
                //         <span>Order placed successfully! Stock updated.</span>
                //     </div>,
                //     { duration: 4000 }
                // );
                return true;
            } else {
                toast.error(
                    <div className="flex items-center">
                        <FiAlertCircle className="mr-2 h-5 w-5 text-red-500" />
                        <span>{response?.message || 'Failed to place order'}</span>
                    </div>
                );
                return false;
            }
        } catch (error) {
            console.error('Failed to place order:', error);
            toast.error(
                <div className="flex items-center">
                    <FiAlertCircle className="mr-2 h-5 w-5 text-red-500" />
                    <span>Failed to place order. Please try again.</span>
                </div>
            );
            return false;
        } finally {
            setPlacingOrder(false);
        }
    };

    // 🔥 NEW: Checkout all items at once
    const checkout = async () => {
        try {
            setPlacingOrder(true);
            
            // Place order for each item
            for (const item of cartItems) {
                const success = await placeOrder(item.id, item.quantity);
                if (!success) {
                    throw new Error(`Failed to place order for ${item.name}`);
                }
            }
            
            // Clear cart after all orders successful
            clearCart();
            
            return true;
        } catch (error) {
            console.error('Checkout failed:', error);
            return false;
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            placeOrder,
            checkout,
            placingOrder
        }}>
            {children}
        </CartContext.Provider>
    );
};