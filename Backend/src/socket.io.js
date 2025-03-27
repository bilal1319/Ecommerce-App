// socket.io.js
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const httpServer = createServer(); // Create an HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://ecommerce-app-48d1.onrender.com",
      "https://ecommerce-app-production-45fd.up.railway.app"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('deleteOrder', (orderId) => {
    io.emit('orderDeleted', orderId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Export io and httpServer
export { io, httpServer };
