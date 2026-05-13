
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import reportRoutes from './routes/reportRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import alertRoutes from './routes/alertRoutes.ts';
import { auditLog, validateInput } from './middleware/securityMiddleware.ts';

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PATCH']
  }
});

const PORT = process.env.PORT || 5000;
app.set('io', io);

// Middleware
app.use(cors({
  origin: function(origin, callback) { callback(null, true); },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  credentials: true
}));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
// app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '50mb' }) as any);

// Security Tracking & Validation
app.use(auditLog);
app.use(validateInput);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoguardian';
let isDbConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully');
    isDbConnected = true;
  })
  .catch(err => {
    console.error('❌ MONGODB CONNECTION ERROR:', err.message);
    console.warn('⚠️  MONGODB OFFLINE: eco-sentinel network running in LOCAL-HEAVY mode.');
    console.log('   (Reports will be shared real-time via Socket.IO but not persistent without a database)');
  });

app.use((req, res, next) => {
  req.app.set('isDbConnected', isDbConnected);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'active', timestamp: new Date() }));

// Real-time communication
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('sendIntercom', (msg) => {
    socket.broadcast.emit('intercomMessage', msg);
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Real-time support`);
});

export { io };
export default app;
