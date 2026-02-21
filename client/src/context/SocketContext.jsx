import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// The server URL — during dev, Vite proxies /api but socket.io needs its own connection.
// We connect directly to the server origin.
const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_SERVER_PORT || 5002}`
        : 'http://localhost:5002');

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        if (!user) {
            // Disconnect if logged out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Get stored JWT token
        const token = localStorage.getItem('token') || '';

        const socket = io(SERVER_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
        });

        socket.on('user_online', ({ userId }) => {
            setOnlineUsers((prev) => new Set([...prev, userId]));
        });

        socket.on('user_offline', ({ userId }) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
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

export default SocketContext;
