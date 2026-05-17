// src/contexts/AuthContext.jsx
// JWT-only Auth - No Keycloak, No OAuth2
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'https://api-gateway-production-3d22.up.railway.app';

// Helper: decode JWT payload
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

// Helper: is token expired?
const isTokenExpired = (token) => {
    const data = decodeToken(token);
    if (!data) return true;
    return data.exp * 1000 < Date.now();
};

// Helper: build user object from our JWT claims
const buildUserFromToken = (token) => {
    const data = decodeToken(token);
    if (!data) return null;
    return {
        id: data.id,
        username: data.sub,
        email: data.email,
        role: data.role,           // "ADMIN" or "USER"
        roles: [data.role],        // array for backward compat
        firstName: data.firstName || '',
        lastName: data.lastName || '',
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoaded, setAuthLoaded] = useState(false);

    // ── Logout ──────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setToken(null);
        window.location.href = '/login';
    }, []);

    // ── Refresh token ────────────────────────────────────────
    const refreshToken = useCallback(async () => {
        const storedRefresh = localStorage.getItem('refreshToken');
        if (!storedRefresh) return false;

        try {
            const res = await fetch(`${API_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: storedRefresh }),
            });
            const data = await res.json();

            if (res.ok && data.success && data.token) {
                localStorage.setItem('accessToken', data.token);
                if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                setToken(data.token);
                setUser(buildUserFromToken(data.token));
                return true;
            }
        } catch (e) {
            console.error('Refresh error:', e);
        }

        logout();
        return false;
    }, [logout]);

    // ── Boot: load user from stored token ───────────────────
    useEffect(() => {
        const boot = async () => {
            const stored = localStorage.getItem('accessToken');

            if (stored) {
                if (isTokenExpired(stored)) {
                    const ok = await refreshToken();
                    if (!ok) {
                        setAuthLoaded(true);
                        setLoading(false);
                        return;
                    }
                } else {
                    setToken(stored);
                    setUser(buildUserFromToken(stored));
                }
            }

            setAuthLoaded(true);
            setLoading(false);
        };

        boot();
    }, [refreshToken]);

    // ── Auto-refresh 5 min before expiry ────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('accessToken');
            if (!stored) return;
            const data = decodeToken(stored);
            if (!data) return;
            const msLeft = data.exp * 1000 - Date.now();
            if (msLeft > 0 && msLeft < 5 * 60 * 1000) {
                refreshToken();
            }
        }, 60_000);
        return () => clearInterval(interval);
    }, [refreshToken]);

    // ── Login ────────────────────────────────────────────────
    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                return { success: false, error: data.message || 'Invalid credentials' };
            }

            localStorage.setItem('accessToken', data.token);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

            const userData = buildUserFromToken(data.token);
            setToken(data.token);
            setUser(userData);

            return { success: true, user: userData };
        } catch (e) {
            console.error('Login error:', e);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    // ── Register ─────────────────────────────────────────────
    const register = async (userData) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Auto-login after register if token returned
                if (data.token) {
                    localStorage.setItem('accessToken', data.token);
                    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                    setToken(data.token);
                    setUser(buildUserFromToken(data.token));
                }
                return { success: true, message: data.message || 'Registration successful!' };
            }
            return { success: false, message: data.message || 'Registration failed' };
        } catch (e) {
            console.error('Register error:', e);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // ── Update profile ───────────────────────────────────────
    const updateUser = async (userData) => {
        try {
            const res = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(userData),
            });
            const data = await res.json();

            if (res.ok) {
                setUser(prev => ({ ...prev, ...data }));
                return { success: true };
            }
            return { success: false };
        } catch (e) {
            console.error('Update profile error:', e);
            return { success: false };
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.roles?.includes('ADMIN');

    const value = {
        user,
        token,
        loading,
        authLoaded,
        login,
        register,
        logout,
        refreshToken,
        updateUser,
        isAuthenticated: !!user,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
