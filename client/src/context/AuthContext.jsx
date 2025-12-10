import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, []);

  // ----------------------------
  // CHECK AUTH
  // ----------------------------
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      const loggedUser = response.data.data.user;
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // USER LOGIN
  // ----------------------------
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const userData = response.data.data.user || response.data.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // ----------------------------
  // ADMIN LOGIN (NEW)
  // ----------------------------
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password });

      const userData = response.data.user;

      // save token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return response;
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  // ----------------------------
  // REGISTER
  // ----------------------------
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  // ----------------------------
  // LOGOUT
  // ----------------------------
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};