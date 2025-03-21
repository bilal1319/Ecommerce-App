import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} from '../controllers/cart.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Get user's cart
router.get('/get-cart', getUserCart);

// Add product to cart
router.post('/add-product', addToCart);

// Update product quantity
router.put('/update/:productId', updateCartItem);

// Remove product from cart
router.delete('/remove/:productId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

export default router;
