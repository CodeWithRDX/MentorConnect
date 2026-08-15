import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import initSocket from './socket/index.js';
import { validateEnv } from './utils/validateEnv.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';

// Load env vars first
dotenv.config();

// Validate env vars
validateEnv();

// Connect to database
await connectDB();

const app = express();

// Secure security headers
app.use(helmet());

// Compress all responses
app.use(compression());

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Limit login/register attempts to 20 per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET)); // Sign cookies with JWT_SECRET

// Apply rate limits
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || (process.env.NODE_ENV !== 'production' && origin.startsWith(allowed))
    );
    
    // Dynamically allow Vercel subdomains (including preview URLs)
    const isVercelOrigin = origin.endsWith('.vercel.app') || origin === process.env.FRONTEND_URL;

    if (isAllowed || isVercelOrigin) {
      callback(null, true);
    } else {
      callback(null, false); // Let the browser handle the CORS block, don't crash the server
    }
  },
  credentials: true,
}));

// Set Cross-Origin-Opener-Policy headers globally
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Static uploads
app.use('/uploads', express.static('uploads'));

// REST Routes
app.use('/api/auth',        authRoutes);
app.use('/api/mentors',     mentorRoutes);
app.use('/api/bookings',    bookingRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/issues',      issueRoutes);
app.use('/api/goals',       goalRoutes);
app.use('/api/messages',    messageRoutes);
app.use('/api/contact',     contactRoutes);
app.use('/api/notes',       noteRoutes);
app.use('/api/permissions', permissionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// HTTP server + Socket.IO
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
