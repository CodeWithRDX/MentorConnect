import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api, { setAccessToken as setApiAccessToken } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getCachedToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch {
    return '';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCachedUser);
  const [accessToken, setAccessTokenState] = useState(getCachedToken);
  const [loading, setLoading] = useState(() => !getCachedUser());
  const hasCheckedAuth = useRef(false);

  const setAccessToken = useCallback((token) => {
    setAccessTokenState(token || '');
    setApiAccessToken(token || '');
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const saveUserSession = useCallback((userData, token, refreshToken) => {
    if (token) setAccessToken(token);
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }, [setAccessToken]);

  // ── CHECK AUTH (Resilient Silent Refresh & Profile Verification) ────────────
  const checkAuth = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/refresh', {
        refreshToken: storedRefreshToken || undefined,
      });

      const token = response.data?.data?.token;
      const loggedUser = response.data?.data?.user;
      const newRefreshToken = response.data?.data?.refreshToken;

      if (token && loggedUser) {
        saveUserSession(loggedUser, token, newRefreshToken);
        return;
      }
    } catch {
      // If cookie/refresh endpoint failed (e.g. cross-origin cookie restricted),
      // verify if current access token in localStorage is still valid via /auth/me
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        try {
          const meRes = await api.get('/auth/me');
          const verifiedUser = meRes.data?.data?.user;
          if (verifiedUser) {
            setUser(verifiedUser);
            localStorage.setItem('user', JSON.stringify(verifiedUser));
            return;
          }
        } catch {
          // Token is genuinely expired
        }
      }

      // Both refresh and token verification failed: clear session
      setAccessToken('');
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, [saveUserSession, setAccessToken]);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  // ── USER LOGIN (email + password) ───────────────────────────────────────────
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data?.data?.user || response.data?.data;
    const token = response.data?.data?.token;
    const refreshToken = response.data?.data?.refreshToken;

    saveUserSession(userData, token, refreshToken);
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
    const token = response.data?.data?.token;
    const refreshToken = response.data?.data?.refreshToken;

    saveUserSession(userData, token, refreshToken);
    return { user: userData, token };
  };

  // ── ADMIN LOGIN ─────────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    const userData = response.data.user;
    const token = response.data.token;
    const refreshToken = response.data.refreshToken;

    saveUserSession(userData, token, refreshToken);
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
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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

export default AuthContext;