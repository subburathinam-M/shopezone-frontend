// src/services/api.js
// JWT-only API client - No Keycloak
import axios from 'axios';

const API_URL =
    process.env.REACT_APP_API_URL ||
    'https://api-gateway-production-3d22.up.railway.app';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});

// ── Request: attach JWT token ─────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response: handle 401 → refresh → retry ───────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const storedRefresh = localStorage.getItem('refreshToken');
            if (!storedRefresh) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Call our JWT refresh endpoint
                const res = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    { refreshToken: storedRefresh },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (res.data?.token) {
                    localStorage.setItem('accessToken', res.data.token);
                    if (res.data.refreshToken) {
                        localStorage.setItem('refreshToken', res.data.refreshToken);
                    }
                    originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_URL };
