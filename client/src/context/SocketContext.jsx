import { createContext, useContext, useEffect, useState } from 'react';
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
    const { user, accessToken } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        if (!user || !accessToken) {
            // Disconnect if logged out or token is missing
            setSocket((prevSocket) => {
                if (prevSocket) {
                    prevSocket.disconnect();
                }
                return null;
            });
            return;
        }

        const socketInstance = io(SERVER_URL, {
            auth: { token: accessToken },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected:', socketInstance.id);
            setSocket(socketInstance);
        });

        socketInstance.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
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

        return () => {
            socketInstance.disconnect();
            setSocket(null);
        };
    }, [user, accessToken]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
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
