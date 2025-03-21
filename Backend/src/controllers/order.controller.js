// controllers/order.controller.js

import Order from '../models/order.model.js';

// Get Orders for a Specific User
// Get Orders for a Specific User
// Get Orders for a Specific User
export const getUserOrders = async (req, res) => {
  try {
    // Use lean() to get plain JavaScript objects instead of Mongoose documents
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'name price image description' // Include all needed product fields
      })
      .sort({ createdAt: -1 })
      .lean(); // Using lean() for better performance
    
    // Make sure all orders have the shipping address details
    // This is a safety check in case there are old orders without shipping details
    const ordersWithComplete = orders.map(order => {
      // Ensure the order has all fields even if they were created before you added shippingAddress
      return {
        ...order,
        shippingAddress: order.shippingAddress || {}
      };
    });
    
    res.status(200).json(ordersWithComplete);
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a New Order
// Create a New Order
// Create a New Order
export const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress } = req.body;
    
    console.log('Request body:', req.body);
    console.log('Shipping address received:', shippingAddress);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items cannot be empty' });
    }

    const newOrder = await Order.create({
      userId: req.user._id,
      items,
      totalPrice,
      shippingAddress,
      status: 'Pending'
    });
    
    console.log('New order created:', newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Order (Admin)
export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const updatedOrders = await Order.find(); // Fetch updated orders
    res.status(200).json({ message: "Order deleted successfully", orders: updatedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

