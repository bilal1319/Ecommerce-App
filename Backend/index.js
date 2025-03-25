import express from 'express';
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

// Load environment variables **at the top**
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Update this to match your React frontend URL
    credentials: true, // Allow cookies & authentication headers
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello world');
});

// **Ensure database connects**
connectDB();

// **Use Railway's dynamic port**
const PORT = process.env.PORT || 5000;  // Default to 5000 if Railway doesn’t provide a port

const __dirname = path.resolve();

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

// **Fix binding issue (use '0.0.0.0' instead of 'localhost')**
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
