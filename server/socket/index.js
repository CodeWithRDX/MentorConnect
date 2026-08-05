import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import CallSession from '../models/CallSession.js';
import { v4 as uuidv4 } from 'uuid';

// Map of userId -> Set of socketIds (a user can have multiple tabs open)
const onlineUsers = new Map();

// Map of roomId -> { caller, callee, sessionId } for active calls
const activeCalls = new Map();

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
        maxHttpBufferSize: 1e6, // 1MB max message size
    });

    // ── JWT Authentication Middleware ─────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(' ')[1];
            if (!token) return next(new Error('Authentication error: token missing'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('_id name role');
            if (!user) return next(new Error('Authentication error: user not found'));

            socket.user = user;
            next();
        } catch {
            next(new Error('Authentication error: invalid token'));
        }
    });

    // ── Connection Handler ────────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();

        // Each user joins their own private room
        socket.join(userId);

        // Track online status
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);

        io.emit('user_online', { userId });

        // ── ─────────────────────────────────────────────────────────────────
        // MESSAGING
        // ── ─────────────────────────────────────────────────────────────────

        socket.on('send_message', async ({ to, body }, ack) => {
            try {
                if (!to || !body?.trim()) {
                    return ack?.({ success: false, error: 'Recipient and body are required' });
                }

                const message = await Message.create({ from: userId, to, body: body.trim() });

                const payload = {
                    _id:       message._id,
                    from:      userId,
                    to,
                    body:      message.body,
                    createdAt: message.createdAt,
                    expiresAt: message.expiresAt,
                };

                socket.to(to).emit('new_message', payload);
                socket.to(userId).emit('new_message', payload);
                ack?.({ success: true, data: payload });
            } catch (err) {
                ack?.({ success: false, error: 'Failed to save message' });
            }
        });

        socket.on('typing',      ({ to }) => socket.to(to).emit('typing',      { from: userId }));
        socket.on('stop_typing', ({ to }) => socket.to(to).emit('stop_typing', { from: userId }));

        // ── ─────────────────────────────────────────────────────────────────
        // VIDEO CALLING — WebRTC Signaling
        // ── ─────────────────────────────────────────────────────────────────

        // Caller initiates a call
        socket.on('call:initiate', async ({ to, offer, bookingId, roomId }, ack) => {
            try {
                if (!to || !offer) {
                    return ack?.({ success: false, error: 'Recipient and offer are required' });
                }

                // Check if target is online
                if (!onlineUsers.has(to)) {
                    return ack?.({ success: false, error: 'User is not online' });
                }

                // Validate that caller and callee belong to this booking
                if (bookingId) {
                    const booking = await Booking.findById(bookingId).populate('mentor', 'user');
                    if (!booking) {
                        return ack?.({ success: false, error: 'Invalid booking session.' });
                    }
                    const menteeId = booking.mentee.toString();
                    const mentorUserId = booking.mentor?.user?.toString();

                    const isAuthorized = 
                        (userId === menteeId && to === mentorUserId) ||
                        (userId === mentorUserId && to === menteeId);

                    if (!isAuthorized) {
                        return ack?.({ success: false, error: 'Unauthorized call session for this booking.' });
                    }
                }

                const finalRoomId = roomId || uuidv4();

                // Create or update call session in DB
                let session = await CallSession.findOne({ roomId: finalRoomId });
                if (session) {
                    session.offer = offer;
                    session.status = 'ringing';
                    await session.save();
                } else {
                    session = await CallSession.create({
                        roomId: finalRoomId,
                        caller: userId,
                        callee: to,
                        booking: bookingId || null,
                        status: 'ringing',
                        offer,
                    });
                }

                activeCalls.set(finalRoomId, { caller: userId, callee: to, sessionId: session._id });

                // Forward call invitation to callee
                socket.to(to).emit('call:incoming', {
                    from:   userId,
                    name:   socket.user.name,
                    roomId: finalRoomId,
                    offer,
                });

                ack?.({ success: true, roomId: finalRoomId });
            } catch (err) {
                console.error('[Socket] Error in call:initiate:', err);
                ack?.({ success: false, error: 'Failed to initiate call' });
            }
        });

        // Callee answers the call
        socket.on('call:answer', async ({ to, answer, roomId }) => {
            try {
                socket.join(roomId);
                socket.to(to).emit('call:answer', { answer, roomId, from: userId });

                // Update call session
                const call = activeCalls.get(roomId);
                if (call?.sessionId) {
                    await CallSession.findByIdAndUpdate(call.sessionId, {
                        status: 'active',
                        answeredAt: new Date(),
                        answer,
                    });
                }
            } catch {
                // Non-critical — call can proceed without DB update
            }
        });

        // ICE candidate exchange
        socket.on('call:ice-candidate', ({ to, candidate, roomId }) => {
            socket.to(to).emit('call:ice-candidate', { candidate, roomId, from: userId });
        });

        // Screen share signaling
        socket.on('call:screen-share-start', ({ to, roomId }) => {
            socket.to(to).emit('call:screen-share-start', { from: userId, roomId });
        });

        socket.on('call:screen-share-stop', ({ to, roomId }) => {
            socket.to(to).emit('call:screen-share-stop', { from: userId, roomId });
        });

        // Camera state toggle signaling
        socket.on('call:camera-toggle', ({ to, enabled }) => {
            socket.to(to).emit('call:camera-toggle', { from: userId, enabled });
        });

        // Mic state toggle signaling
        socket.on('call:mic-toggle', ({ to, enabled }) => {
            socket.to(to).emit('call:mic-toggle', { from: userId, enabled });
        });

        // Either party ends the call
        socket.on('call:end', async ({ to, roomId }) => {
            try {
                socket.to(to).emit('call:end', { from: userId, roomId });

                const call = activeCalls.get(roomId);
                if (call?.sessionId) {
                    const session = await CallSession.findById(call.sessionId);
                    if (session) {
                        const endedAt = new Date();
                        const durationSeconds = session.answeredAt
                            ? Math.round((endedAt - session.answeredAt) / 1000)
                            : 0;
                        await CallSession.findByIdAndUpdate(call.sessionId, {
                            status: session.status === 'active' ? 'completed' : 'missed',
                            endedAt,
                            durationSeconds,
                        });
                    }
                }

                activeCalls.delete(roomId);
            } catch {
                // Non-critical
            }
        });

        // Callee rejects the call
        socket.on('call:rejected', async ({ to, roomId }) => {
            try {
                socket.to(to).emit('call:rejected', { from: userId, roomId });

                const call = activeCalls.get(roomId);
                if (call?.sessionId) {
                    await CallSession.findByIdAndUpdate(call.sessionId, {
                        status: 'rejected',
                        endedAt: new Date(),
                    });
                }
                activeCalls.delete(roomId);
            } catch {
                // Non-critical
            }
        });

        // Screen share state notifications
        socket.on('call:screen-share-start', ({ to, roomId }) => {
            socket.to(to).emit('call:screen-share-start', { from: userId, roomId });
        });

        socket.on('call:screen-share-stop', ({ to, roomId }) => {
            socket.to(to).emit('call:screen-share-stop', { from: userId, roomId });
        });

        // ── ─────────────────────────────────────────────────────────────────
        // WHITEBOARD — real-time collaborative drawing
        // ── ─────────────────────────────────────────────────────────────────

        // Join a whiteboard room (shared per booking/call)
        socket.on('whiteboard:join', async ({ roomId }, ack) => {
            try {
                const session = await CallSession.findOne({ roomId });
                if (!session) {
                    return ack?.({ success: false, error: 'Call session not found' });
                }
                const isParticipant =
                    session.caller.toString() === userId ||
                    session.callee.toString() === userId;

                if (!isParticipant) {
                    return ack?.({ success: false, error: 'Unauthorized to join whiteboard.' });
                }

                socket.join(`wb:${roomId}`);
                ack?.({ success: true });
            } catch (err) {
                ack?.({ success: false, error: 'Failed to join whiteboard.' });
            }
        });

        // Broadcast draw strokes to everyone in the room except sender
        socket.on('whiteboard:draw', ({ roomId, stroke }) => {
            socket.to(`wb:${roomId}`).emit('whiteboard:draw', { stroke, from: userId });
        });

        // Broadcast clear canvas
        socket.on('whiteboard:clear', ({ roomId }) => {
            socket.to(`wb:${roomId}`).emit('whiteboard:clear', { from: userId });
        });

        // ── ─────────────────────────────────────────────────────────────────
        // SHARED NOTES — real-time collaborative editing
        // ── ─────────────────────────────────────────────────────────────────

        // Join a notes room (keyed by bookingId)
        socket.on('notes:join', async ({ bookingId }, ack) => {
            try {
                const booking = await Booking.findById(bookingId).populate('mentor', 'user');
                if (!booking) {
                    return ack?.({ success: false, error: 'Booking not found.' });
                }
                const menteeId = booking.mentee.toString();
                const mentorUserId = booking.mentor?.user?.toString();

                if (userId !== menteeId && userId !== mentorUserId) {
                    return ack?.({ success: false, error: 'Unauthorized to join notes.' });
                }

                socket.join(`notes:${bookingId}`);
                ack?.({ success: true });
            } catch (err) {
                ack?.({ success: false, error: 'Failed to join notes.' });
            }
        });

        // Broadcast content changes (debounced on client)
        socket.on('notes:update', ({ bookingId, content }) => {
            socket.to(`notes:${bookingId}`).emit('notes:update', {
                content,
                from:   userId,
                fromName: socket.user.name,
            });
        });

        // ── ─────────────────────────────────────────────────────────────────
        // DISCONNECT
        // ── ─────────────────────────────────────────────────────────────────

        socket.on('disconnect', async () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit('user_offline', { userId });

                    // Clean up any active calls for this user
                    for (const [roomId, call] of activeCalls.entries()) {
                        if (call.caller === userId || call.callee === userId) {
                            const otherId = call.caller === userId ? call.callee : call.caller;
                            io.to(otherId).emit('call:end', { from: userId, roomId, reason: 'disconnected' });

                            if (call.sessionId) {
                                await CallSession.findByIdAndUpdate(call.sessionId, {
                                    status: 'completed',
                                    endedAt: new Date(),
                                }).catch(() => {});
                            }
                            activeCalls.delete(roomId);
                        }
                    }
                }
            }
        });
    });

    return io;
};

/**
 * Check if a user is currently online
 */
export const isUserOnline = (userId) => onlineUsers.has(userId.toString());

export default initSocket;
