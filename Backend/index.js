import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.route.js';
import cartRoutes from './src/routes/cart.route.js'
import productRoutes from './src/routes/products.route.js'
import categoryRoutes from './src/routes/category.route.js'
import orderRoutes from './src/routes/order.route.js'
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "https://ecommerce-app-48d1.onrender.com/", // Add your specific Render URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Preflight request handler
app.options('*', cors(corsOptions));

app.use(express.json({ limit: "20mb" })); 
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

dotenv.config();
connectDB()
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use('/api/auth', authRoutes)
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/category', categoryRoutes);
app.use('/api/order', orderRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../Frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../Frontend', 'dist', 'index.html'))
    })
  }

app.listen(PORT,  () => {
    console.log("Server is running on port " + PORT);
} )