import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api, { setAccessToken as setApiAccessToken } from '../utils/api';

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
  const [accessToken, setAccessTokenState] = useState('');
  const [loading, setLoading] = useState(false);
  const hasCheckedAuth = useRef(false);

  const setAccessToken = (token) => {
    setAccessTokenState(token);
    setApiAccessToken(token);
  };

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, []);

  // ── CHECK AUTH (Silent Refresh on Load) ─────────────────────────────────────
  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/refresh');
      const token = response.data?.data?.token;
      const loggedUser = response.data?.data?.user;

      if (token && loggedUser) {
        setAccessToken(token);
        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch {
      // Refresh failed or no refresh token cookie. Clear session metadata.
      setAccessToken('');
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // ── USER LOGIN (email + password) ───────────────────────────────────────────
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data?.data?.user || response.data?.data;
    const token    = response.data?.data?.token;
    
    if (token) setAccessToken(token);
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
    
    if (token) setAccessToken(token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { user: userData, token };
  };

  // ── ADMIN LOGIN ─────────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    const userData = response.data.user;
    const token = response.data.token;
    
    if (token) setAccessToken(token);
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
      setAccessToken('');
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const value = {
    user,
    accessToken,
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