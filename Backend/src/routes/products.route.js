import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import {upload} from '../lib/multerConfig.js';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadImage
} from '../controllers/product.controller.js';

const router = express.Router();

// Public Routes
router.get('/getAll', getAllProducts);
router.get('/getOne/:id', getProductById);

// Admin Routes (Protected)
router.post('/create', protectRoute, isAdmin, createProduct);
router.post('/upload', protectRoute, isAdmin, upload.single('image'), uploadImage);
router.put('/update/:id', protectRoute, isAdmin, updateProduct);
router.delete('/delete/:id', protectRoute, isAdmin, deleteProduct);

export default router;
