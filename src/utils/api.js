import axios from 'axios';

/**
 * API Client
 * Configured axios instance with:
 * - Base URL pointing to backend
 * - Credentials: 'include' for session cookies
 * - Error handling
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // Include session cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Could be used for adding auth tokens, logging, etc.
 */
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles errors and redirects on 401 (unauthorized)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Could redirect to login here
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
