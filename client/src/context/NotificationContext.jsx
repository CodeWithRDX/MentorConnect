import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '../components/ui/toaster';
import api from '../utils/api';
import logger from '../utils/logger';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef(null);

  // Incoming call event listener callback (for CallContext integration)
  const incomingCallHandlerRef = useRef(null);

  const setIncomingCallHandler = useCallback((handler) => {
    incomingCallHandlerRef.current = handler;
  }, []);

  // Fetch initial notifications and unread count
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=20');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      logger.warn('[NotificationContext] Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(res.data.unreadCount ?? Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      logger.error('[NotificationContext] Failed to mark as read', err);
    }
  }, [unreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      logger.error('[NotificationContext] Failed to mark all as read', err);
    }
  }, []);

  // Delete a single notification
  const deleteNotification = useCallback(async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch (err) {
      logger.error('[NotificationContext] Failed to delete notification', err);
    }
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    if (!user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Determine SSE API URL
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

    const sseUrl = `${baseUrl}/notifications/stream${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''}`;

    const es = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = es;

    // Handle generic notification event
    es.addEventListener('notification', (e) => {
      try {
        const notif = JSON.parse(e.data);
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Display toast alert
        toast(notif.message || notif.title, 'info');
      } catch (err) {
        logger.error('[SSE] Failed to parse notification', err);
      }
    });

    // Handle incoming call alert event
    es.addEventListener('call:incoming', (e) => {
      try {
        const callData = JSON.parse(e.data);
        if (incomingCallHandlerRef.current) {
          incomingCallHandlerRef.current(callData);
        }
      } catch (err) {
        logger.error('[SSE] Failed to parse call event', err);
      }
    });

    es.onerror = () => {
      // EventSource automatically handles reconnection internally
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [user, accessToken, fetchNotifications, toast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        setIncomingCallHandler,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};

export default NotificationContext;
