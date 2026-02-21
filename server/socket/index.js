import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Map of userId -> Set of socketIds (a user can have multiple tabs open)
const onlineUsers = new Map();

const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: (origin, cb) => {
                const allowed =
                    !origin ||
                    origin.includes('localhost') ||
                    origin.includes('127.0.0.1') ||
                    origin === process.env.FRONTEND_URL;
                cb(null, allowed ? origin : false);
            },
            credentials: true,
        },
    });

    // ── JWT Authentication Middleware ─────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
            if (!token) return next(new Error('Authentication error: token missing'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('_id name role');
            if (!user) return next(new Error('Authentication error: user not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: invalid token'));
        }
    });

    // ── Connection Handler ────────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();

        // Each user joins their own private room — others can send events there
        socket.join(userId);

        // Track online status
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);

        // Broadcast to all connected clients that this user is online
        io.emit('user_online', { userId });

        console.log(`[Socket] Connected: ${socket.user.name} (${userId}), sockets: ${onlineUsers.get(userId).size}`);

        // ── Send Message ────────────────────────────────────────────────────────
        socket.on('send_message', async ({ to, body }, ack) => {
            try {
                if (!to || !body?.trim()) {
                    return ack?.({ success: false, error: 'Recipient and body are required' });
                }

                // Save to DB
                const message = await Message.create({
                    from: userId,
                    to,
                    body: body.trim(),
                });

                const payload = {
                    _id: message._id,
                    from: userId,
                    to,
                    body: message.body,
                    createdAt: message.createdAt,
                    expiresAt: message.expiresAt,
                };

                // Deliver to recipient's room (real-time)
                socket.to(to).emit('new_message', payload);

                // Echo back to sender's other open tabs
                socket.to(userId).emit('new_message', payload);

                // Acknowledge to the sending tab
                ack?.({ success: true, data: payload });
            } catch (err) {
                console.error('[Socket] send_message error:', err.message);
                ack?.({ success: false, error: 'Failed to save message' });
            }
        });

        // ── Typing Indicators ───────────────────────────────────────────────────
        socket.on('typing', ({ to }) => {
            socket.to(to).emit('typing', { from: userId });
        });

        socket.on('stop_typing', ({ to }) => {
            socket.to(to).emit('stop_typing', { from: userId });
        });

        // ── Disconnect ──────────────────────────────────────────────────────────
        socket.on('disconnect', () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit('user_offline', { userId });
                }
            }
            console.log(`[Socket] Disconnected: ${socket.user.name} (${userId})`);
        });
    });

    return io;
};

/**
 * Check if a user is currently online
 * @param {string} userId
 */
export const isUserOnline = (userId) => onlineUsers.has(userId.toString());

export default initSocket;
