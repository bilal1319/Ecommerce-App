import express from 'express';
import { isAdmin } from '../middleware/admin.middleware.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getUserOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Get orders for a specific user
router.get('/user-orders', getUserOrders);

// Create a new order
router.post('/create', createOrder);

// Admin-only routes
router.use(isAdmin);

// Get all orders (Admin)
router.get('/all-orders', getAllOrders);

// Update order status (Admin)
router.put('/update-status/:orderId', updateOrderStatus);

// Delete an order (Admin)
router.delete('/delete/:orderId', deleteOrder);

export default router;
