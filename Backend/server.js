
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import reportRoutes from './routes/reportRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

const PORT = process.env.PORT || 5000;
app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoguardian';
let isDbConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully');
    isDbConnected = true;
  })
  .catch(err => {
    console.warn('⚠️  MONGODB OFFLINE: demo mode active.');
  });

app.use((req, res, next) => {
  req.app.set('isDbConnected', isDbConnected);
  next();
});

app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'active' }));

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('sendIntercom', (msg) => socket.broadcast.emit('intercomMessage', msg));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Real-time support`);
});

export default app;
