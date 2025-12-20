import axios from 'axios';

// Prefer same-origin /api during dev to avoid port mismatches.
// If an explicit env is set, use it; otherwise build from window.location.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 8000, // fail fast to avoid hanging spinners
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Attach bearer token if stored (admin login returns token + cookie)
    try {
      const token = localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore storage errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 here - let AuthContext handle it
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login/register/home
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password'];
      
      if (!publicPaths.includes(currentPath) && !currentPath.includes('/verify-email') && !currentPath.includes('/reset-password')) {
        // Silently fail - don't redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;

