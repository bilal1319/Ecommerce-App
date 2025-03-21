import Product from '../models/product.model.js';
import cloudinary from '../lib/cloudinary.js'
import fs from 'fs';
import sharp from 'sharp';

// Create Product (Admin)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload Product Image (Admin)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const compressedImagePath = `uploads/compressed-${req.file.filename}`;

    // ✅ Compress image
    await sharp(req.file.path)
      .resize(800)
      .toFormat('webp')
      .webp({ quality: 80 })
      .toFile(compressedImagePath);

    let result;
    try {
      // ✅ Upload to Cloudinary
      result = await cloudinary.uploader.upload(compressedImagePath, {
        folder: 'products',
        resource_type: "image",
        format: "webp"
      });
    } catch (uploadError) {
      return res.status(500).json({ message: 'Cloudinary upload failed', error: uploadError.message });
    }

    // ✅ Delay File Deletion to Avoid "EBUSY"
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting file:", err); });
      if (fs.existsSync(compressedImagePath)) fs.unlink(compressedImagePath, (err) => { if (err) console.error("Error deleting file:", err); });
    }, 500); // 🔹 Delay 500ms before deletion

    res.json({ imageUrl: result.secure_url, public_id: result.public_id });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product (Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Product ID is required" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let updateData = { ...req.body };

    // 🛑 Check if an image is provided (either new file or existing one)
    if (!req.file && req.body.existingImage) {
      updateData.image = product.image; // ✅ Retain existing image
    }
    

    // ✅ If no new image is uploaded, retain the existing one
    if (!req.file) {
      updateData.image = product.image;
    } else {
      const compressedImagePath = `uploads/compressed-${req.file.filename}`;

      await sharp(req.file.path)
        .resize(800)
        .toFormat("webp")
        .webp({ quality: 80 })
        .toFile(compressedImagePath);

      const result = await cloudinary.uploader.upload(compressedImagePath, {
        folder: "products",
        resource_type: "image",
        format: "webp",
      });

      // ✅ Delete old Cloudinary image if exists
      if (product.image?.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      updateData.image = { url: result.secure_url, public_id: result.public_id };

      // ✅ Delete local images after upload
      setTimeout(() => {
        if (fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
        if (fs.existsSync(compressedImagePath)) fs.unlink(compressedImagePath, () => {});
      }, 500);
    }

    // ✅ Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// Delete Product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
