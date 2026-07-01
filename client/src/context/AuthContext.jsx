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

const getCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCachedUser());
  const [loading, setLoading] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, []);

  // ── CHECK AUTH ──────────────────────────────────────────────────────────────
  const checkAuth = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      const response = await api.get('/auth/me', {
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });
      const loggedUser = response.data.data.user;
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
    } catch {
      const cachedUser = getCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── USER LOGIN (email + password) ───────────────────────────────────────────
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data?.data?.user || response.data?.data;
    const token    = response.data?.data?.token;
    if (token) localStorage.setItem('token', token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { user: userData, token };
  };

  // ── GOOGLE OAUTH LOGIN ──────────────────────────────────────────────────────
  const loginWithGoogle = async (credential, role, userInfo) => {
    const response = await api.post('/auth/oauth/google', {
      credential,
      role,
      _googleUserInfo: userInfo,
    });
    const userData = response.data?.data?.user;
    const token    = response.data?.data?.token;
    if (token) localStorage.setItem('token', token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { user: userData, token };
  };

  // ── ADMIN LOGIN ─────────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    const userData = response.data.user;
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return response;
  };

  // ── REGISTER ────────────────────────────────────────────────────────────────
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // proceed with local logout even if server call fails
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    adminLogin,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};