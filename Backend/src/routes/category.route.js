import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';

const router = express.Router();

// Public - Get all categories
router.get('/', getAllCategories);

// Admin Routes - Protected
router.post('/create', protectRoute, isAdmin, createCategory);
router.put('/update/:id', protectRoute, isAdmin, updateCategory);
router.delete('/delete/:id', protectRoute, isAdmin, deleteCategory);

export default router;
