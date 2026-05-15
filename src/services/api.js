// src/services/api.js
import axios from 'axios';

// API Gateway URL
const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://api-gateway-production-3d22.up.railway.app';

// Keycloak configuration
const KEYCLOAK_URL =
  process.env.REACT_APP_KEYCLOAK_URL ||
  'https://keycloak-production-b496.up.railway.app';

const REALM = 'shopzone-realm';
const CLIENT_ID = 'shopzone-frontend';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const params = new URLSearchParams();

        params.append('grant_type', 'refresh_token');
        params.append('client_id', CLIENT_ID);
        params.append('refresh_token', refreshToken);

        const response = await axios.post(
          `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data?.access_token) {
          localStorage.setItem(
            'accessToken',
            response.data.access_token
          );

          if (response.data.refresh_token) {
            localStorage.setItem(
              'refreshToken',
              response.data.refresh_token
            );
          }

          originalRequest.headers.Authorization =
            `Bearer ${response.data.access_token}`;

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