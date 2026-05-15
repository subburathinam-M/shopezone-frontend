import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Checkout from './pages/Checkout'; 
import Profile from './pages/Profile';
import OnlinePaymentPage from './pages/OnlinePaymentPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
    const location = useLocation();
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50 overflow-visible">
            {!isAuthPage && <Navbar />}
            <div className={!isAuthPage ? 'pt-16' : ''}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    <Route path="/cart" element={
                        <PrivateRoute>
                            <Cart />
                        </PrivateRoute>
                    } />
                    <Route path="/orders" element={
                        <PrivateRoute>
                            <Orders />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                        <AdminRoute>
                            <AdminProducts />
                        </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <AdminRoute>
                            <AdminOrders />
                        </AdminRoute>
                    } />
                    <Route path="/admin/products/edit/:id" element={
                        <AdminRoute>
                            <EditProduct 
                                onProductUpdated={() => {
                                    window.dispatchEvent(new CustomEvent('productsUpdated'));
                                    window.dispatchEvent(new CustomEvent('refreshProducts'));
                                }} 
                            />
                        </AdminRoute>
                    } />
                    <Route path="/admin/products/add" element={
                        <AdminRoute>
                            <AddProduct />
                        </AdminRoute>
                    } />

                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />

                    <Route path="/checkout" element={
                        <PrivateRoute>
                            <Checkout />
                        </PrivateRoute>
                    } />
               
                    <Route path="/online-payment" element={
                        <PrivateRoute>
                            <OnlinePaymentPage />
                        </PrivateRoute>
                    } />
                </Routes>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;