
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import reportRoutes from '../Backend/routes/reportRoutes.js';
import authRoutes from '../Backend/routes/authRoutes.js';
import userRoutes from '../Backend/routes/userRoutes.js';
import alertRoutes from '../Backend/routes/alertRoutes.js';
import { auditLog, validateInput } from '../Backend/middleware/securityMiddleware.js';

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) { callback(null, true); },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  credentials: true
}));

app.use(helmet({ crossOriginResourcePolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }) as any);
app.use(auditLog);
app.use(validateInput);

// Mock io for serverless (no WebSocket support on Vercel)
app.set('io', { emit: () => {} });

// ---------- Cached MongoDB Connection for Serverless ----------
const MONGODB_URI = process.env.MONGODB_URI || '';
let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  if (!MONGODB_URI) {
    console.warn('No MONGODB_URI set');
    return null;
  }
  try {
    cachedConnection = await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected (serverless)');
    return cachedConnection;
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err.message);
    return null;
  }
}

// Middleware: ensure DB connection before every request
app.use(async (req: any, res: any, next: any) => {
  const conn = await connectToDatabase();
  req.app.set('isDbConnected', !!conn);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/api/health', (req: any, res: any) => {
  res.json({
    status: 'online',
    db: req.app.get('isDbConnected') ? 'connected' : 'offline',
    runtime: 'vercel-serverless'
  });
});

export default app;
