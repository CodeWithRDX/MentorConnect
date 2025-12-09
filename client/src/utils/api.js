import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
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

