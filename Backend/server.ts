
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import reportRoutes from './routes/reportRoutes.ts';
import authRoutes from './routes/authRoutes.ts';

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
app.use(cors());
// Fixed: Explicitly cast express.json middleware to any to resolve a type mismatch with app.use overloads.
app.use(express.json({ limit: '50mb' }) as any);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoguardian';
let isDbConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully');
    isDbConnected = true;
  })
  .catch(err => {
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
