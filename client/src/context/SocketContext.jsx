import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import logger from '../utils/logger';

const SocketContext = createContext(null);

// The server URL for Socket.IO
const getServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.');
    if (isLocalhost) {
      return 'http://localhost:5002';
    }
    return window.location.origin;
  }
  return 'http://localhost:5002';
};

const SERVER_URL = getServerUrl();

export const SocketProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeSubscribers, setActiveSubscribers] = useState(0);

  const socketRef = useRef(null);
  const disconnectTimerRef = useRef(null);

  // Register / Unregister active communication session
  const registerSession = useCallback(() => {
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    setActiveSubscribers((prev) => prev + 1);
  }, []);

  const unregisterSession = useCallback(() => {
    setActiveSubscribers((prev) => Math.max(0, prev - 1));
  }, []);

  // Manage On-Demand Connection Lifecycle
  useEffect(() => {
    // Only connect if user is authenticated AND there is at least 1 active communication surface
    const shouldConnect = Boolean(user && accessToken && activeSubscribers > 0);

    if (shouldConnect) {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }

      if (!socketRef.current) {
        const socketInstance = io(SERVER_URL, {
          auth: { token: accessToken },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
          logger.info('[Socket] Connected (Active Communication):', socketInstance.id);
          setSocket(socketInstance);
        });

        socketInstance.on('connect_error', (err) => {
          logger.warn('[Socket] Connection notice', err);
        });

        socketInstance.on('user_online', ({ userId }) => {
          setOnlineUsers((prev) => new Set([...prev, userId]));
        });

        socketInstance.on('user_offline', ({ userId }) => {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        });

        socketRef.current = socketInstance;
      }
    } else {
      // Disconnect lazily when leaving communication pages with debounce to avoid reconnect churn
      if (socketRef.current && !disconnectTimerRef.current) {
        disconnectTimerRef.current = setTimeout(() => {
          if (socketRef.current) {
            logger.info('[Socket] Disconnecting: No active communication in progress');
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setOnlineUsers(new Set());
          }
          disconnectTimerRef.current = null;
        }, 1200);
      }
    }

    return () => {
      // no-op; handled by activeSubscribers
    };
  }, [user, accessToken, activeSubscribers]);

  // Clean up completely on logout / unmount
  useEffect(() => {
    if (!user || !accessToken) {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setOnlineUsers(new Set());
      }
      setActiveSubscribers(0);
    }
  }, [user, accessToken]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        registerSession,
        unregisterSession,
        isConnected: Boolean(socket?.connected),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to access the socket instance and online users set.
 * Must be used inside <SocketProvider>.
 */
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
};

/**
 * Hook to declare that the current component is an active communication surface
 * (e.g. Chat, Video Call, Whiteboard, Shared Notes). Automatically connects socket
 * while mounted and disconnects when unmounted.
 */
export const useActiveCommunication = () => {
  const { registerSession, unregisterSession, socket, onlineUsers, isConnected } = useSocket();

  useEffect(() => {
    registerSession();
    return () => {
      unregisterSession();
    };
  }, [registerSession, unregisterSession]);

  return { socket, onlineUsers, isConnected };
};

export default SocketContext;
