/**
 * HouseHub Backend Server
 * Main entry point for the Express.js API server
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Import configurations
const { connectDB, testConnection } = require('./config/database_mongodb');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const bookmarkRoutes = require('./routes/bookmarks');
const messageRoutes = require('./routes/messages');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// CORS configuration - allow multiple origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// Initialize Socket.IO for real-time messaging
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HouseHub API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO connection handling for real-time messaging
const userSockets = new Map(); // Map of userId -> socketId

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    userSockets.set(userId.toString(), socket.id);
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Send message event
  socket.on('send_message', (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = userSockets.get(receiverId.toString());
    
    if (receiverSocketId) {
      // Send to specific receiver
      io.to(receiverSocketId).emit('receive_message', message);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = userSockets.get(receiverId.toString());
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { isTyping });
    }
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    await testConnection();

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('🏠 ===================================');
      console.log('🏠   HouseHub API Server Started');
      console.log('🏠 ===================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💬 Socket.IO enabled for real-time messaging`);
      console.log('🏠 ===================================');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Start the server
startServer();

module.exports = { app, io };
