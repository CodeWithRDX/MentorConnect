import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import initSocket from './socket/index.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Load env vars first so everything below can use them
dotenv.config();

// Connect to database
await connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin === process.env.FRONTEND_URL;
    callback(null, allowed ? origin : false);
  },
  credentials: true,
}));

// Static uploads
app.use('/uploads', express.static('uploads'));

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// ── HTTP server + Socket.IO ──────────────────────────────────────────────────
const httpServer = http.createServer(app);

// Attach Socket.IO — returns the io instance (useful for emitting from controllers later)
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
