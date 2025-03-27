import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// Get User's Cart
export const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');
    if (!cart) return res.status(200).json({ cartItems: [] });
    res.json(cart);
  } catch (error) {
    console.log("user cart", error);
    
    res.status(500).json({ message: error.message });
  }
};

// Add Product to Cart
export const addToCart = async (req, res) => {
  console.log("Received Request Body:", req.body);
  console.log("Authenticated User ID:", req.user?._id);
  
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, cartItems: [] });
    }

    const existingItem = cart.cartItems.find(item => item.product._id.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.cartItems.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('cartItems.product');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Cart Item Quantity

export const updateCartItem = async (req, res) => {
  console.log(req.body);
  console.log("Received productId:", req.params.productId);

  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    // Find the cart and the item
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.cartItems.find(item => item._id.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    // If quantity becomes 0, remove the item
    if (item.quantity + quantity <= 0) {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { cartItems: { _id: productId } } },
        { new: true }
      ).populate("cartItems.product");
    } else {
      // Otherwise, update quantity
      await Cart.findOneAndUpdate(
        { user: req.user._id, "cartItems._id": productId },
        { $inc: { "cartItems.$.quantity": quantity } },
        { new: true }
      );
    }

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product");
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};




// Remove Product from Cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const initialLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(item => item._id.toString() !== productId);

    if (cart.cartItems.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    await cart.save();
    await cart.populate("cartItems.product");
    res.status(200).json({ cartItems: cart.cartItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Clear Entire Cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.cartItems = [];
    await cart.save();

    res.status(200).json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
