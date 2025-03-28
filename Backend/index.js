import express from 'express';
import { httpServer, io } from './src/socket.io.js';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.route.js';
import cartRoutes from './src/routes/cart.route.js';
import productRoutes from './src/routes/products.route.js';
import categoryRoutes from './src/routes/category.route.js';
import orderRoutes from './src/routes/order.route.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || VITE_URL,
    RENDER_URL,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// Attach socket.io instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/order', orderRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../Frontend', 'dist', 'index.html'));
  });
}

// Start the server
httpServer.on('request', app); // Attach Express to the existing HTTP server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
