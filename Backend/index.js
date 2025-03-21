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
    res.send('Hello world')
})


dotenv.config();
connectDB()

// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.url}`, req.body);
//   next();
// });

app.use('/api/auth', authRoutes)
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/category', categoryRoutes);
app.use('/api/order', orderRoutes);

app.listen(3000, 'localhost', () => {
    console.log("Server is running on port 3000");
    
} )