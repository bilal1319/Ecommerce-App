import Category from '../models/category.model.js';

// Create Category (Admin Only)
export const createCategory = async (req, res) => {
  const name = req.body.name?.trim().toLowerCase(); // Ensure name exists before calling methods

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const existing = await Category.findOne({ name });

    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get All Categories (Public)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Category (Admin Only)
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const normalizedName = name.trim().toLowerCase(); // Normalize case and trim

    // Check if another category with the same name already exists
    const existing = await Category.findOne({ name: normalizedName });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name: normalizedName },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Category (Admin Only)
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
