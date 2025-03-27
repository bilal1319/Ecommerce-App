import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||  "https://ecommerce-app-48d1.onrender.com" || 'http://localhost:3000';

export const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Handle errors
socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
});

socket.on('connect', () => {
  console.log('Socket.IO connected successfully');
});

socket.on('disconnect', (reason) => {
  console.log('Socket.IO disconnected:', reason);
});
