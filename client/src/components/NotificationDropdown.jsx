import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Trash2, MessageSquare, Calendar, Video, Target, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'booking':
      return <Calendar className="w-4 h-4 text-purple-500" />;
    case 'call':
      return <Video className="w-4 h-4 text-green-500" />;
    case 'goal':
      return <Target className="w-4 h-4 text-amber-500" />;
    default:
      return <Info className="w-4 h-4 text-neutral-500" />;
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition focus:outline-none"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition group ${
                      !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {n.link ? (
                        <Link
                          to={n.link}
                          onClick={() => {
                            if (!n.read) markAsRead(n._id);
                            setIsOpen(false);
                          }}
                          className="block group/link"
                        >
                          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white group-hover/link:text-primary-600 dark:group-hover/link:text-primary-400 transition truncate">
                            {n.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        </Link>
                      ) : (
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                            {n.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                      )}
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="p-1 text-neutral-400 hover:text-red-500"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
