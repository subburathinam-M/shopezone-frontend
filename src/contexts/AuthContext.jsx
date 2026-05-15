// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('accessToken'));
    const [authLoaded, setAuthLoaded] = useState(false);

    // Keycloak configuration
    const KEYCLOAK_URL = 'https://keycloak-production-b496.up.railway.app';
    const REALM = 'shopzone-realm';
    // const CLIENT_ID = 'shopzone-backend';
    // const CLIENT_SECRET = 'QrZhpn8qgFZFfoUJm6DH1KNYhJwaCB1C';
    const CLIENT_ID = 'shopzone-frontend';

    // Token endpoint
    const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;

    // 🔥 FIX: Use useCallback to memoize this function
    const setUserFromToken = useCallback((token) => {
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            
            // Debug: log token data to see structure
            console.log('Token data:', tokenData);
            
            // Extract roles - handle different possible structures
            let roles = [];
            
            if (tokenData.realm_access && tokenData.realm_access.roles) {
                roles = tokenData.realm_access.roles;
            }
            else if (tokenData.resource_access && tokenData.resource_access[CLIENT_ID]) {
                roles = tokenData.resource_access[CLIENT_ID].roles || [];
            }
            else if (tokenData.roles) {
                roles = tokenData.roles;
            }
            
            console.log('Extracted roles:', roles);
            
            const userData = {
                id: tokenData.sub,
                username: tokenData.preferred_username || tokenData.username,
                email: tokenData.email,
                roles: roles,
                firstName: tokenData.given_name || tokenData.firstName,
                lastName: tokenData.family_name || tokenData.lastName
            };
            
            // 🔥 FIX: Set user state
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }, []);

    // 🔥 FIX: Create refreshToken function first
    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('client_id', CLIENT_ID);
            // params.append('client_secret', CLIENT_SECRET);
            params.append('refresh_token', refreshToken);

            const response = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.access_token);
                setToken(data.access_token);
                
                // Update user from new token
                setUserFromToken(data.access_token);
                
                return true;
            }
        } catch (error) {
            console.error('Refresh token error:', error);
        }
        
        logout();
        return false;
    }, [setUserFromToken]);

    // Load user from token on mount
    useEffect(() => {
        const loadUserFromToken = async () => {
            const storedToken = localStorage.getItem('accessToken');
            
            if (storedToken) {
                try {
                    const tokenData = JSON.parse(atob(storedToken.split('.')[1]));
                    
                    const currentTime = Date.now() / 1000;
                    if (tokenData.exp < currentTime) {
                        console.log('Token expired, trying refresh...');
                        const refreshed = await refreshToken();
                        if (!refreshed) {
                            logout();
                        }
                        setAuthLoaded(true);
                        return;
                    }
                    
                    setUserFromToken(storedToken);
                    setToken(storedToken);
                    
                } catch (error) {
                    console.error('Failed to decode token:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setAuthLoaded(true);
            setLoading(false);
        };

        loadUserFromToken();
    }, [refreshToken, setUserFromToken]);

    // Auto refresh token before expiry
    useEffect(() => {
        const checkTokenExpiry = () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    const expiryTime = tokenData.exp * 1000;
                    const currentTime = Date.now();
                    const timeUntilExpiry = expiryTime - currentTime;

                    // Refresh if token expires in less than 5 minutes
                    if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
                        console.log('Token expiring soon, refreshing...');
                        refreshToken();
                    }
                } catch (error) {
                    console.error('Token expiry check failed:', error);
                }
            }
        };

        const interval = setInterval(checkTokenExpiry, 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshToken]);

    // Login with Keycloak
    const login = async (username, password) => {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', CLIENT_ID);
            // params.append('client_secret', CLIENT_SECRET);
            params.append('username', username);
            params.append('password', password);

            const response = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || 'Login failed');
            }

            // Store tokens
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            setToken(data.access_token);

            // 🔥 FIX: Immediately set user from token
            const userData = setUserFromToken(data.access_token);
            
            // 🔥 FIX: Force a small delay to ensure state updates propagate
            await new Promise(resolve => setTimeout(resolve, 50));

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    // Register with Auth Service
    const register = async (userData) => {
        try {
            const API_URL =
            process.env.REACT_APP_API_URL ||
            'https://api-gateway-production-3d22.up.railway.app';
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
    
            const data = await response.json();
            console.log('Register response:', data);
    
            if (response.ok && data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: error.message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setToken(null);
        window.location.href = '/login';
    };

    // Update user profile
    const updateUser = async (userData) => {
        try {
            const API_URL =
                process.env.REACT_APP_API_URL ||
                'https://api-gateway-production-3d22.up.railway.app';
            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setUser(prev => ({ ...prev, ...data }));
                return { success: true };
            } else {
                return { success: false };
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            return { success: false };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        authLoaded,
        register,
        logout,
        refreshToken,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.roles?.includes('ADMIN') || user?.roles?.includes('admin')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};