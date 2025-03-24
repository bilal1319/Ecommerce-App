import Order from '../models/order.model.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const { userEmail, order } = req.body;

    if (!userEmail || typeof userEmail !== "string" || !userEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Invalid recipient email" });
    }

    console.log("📧 Sending email to:", userEmail);

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587, 
      secure: false, 
      auth: {
        user: process.env.BREVO_EMAIL, 
        pass: process.env.BREVO_PASS,  
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    

    const mailOptions = {
      from: `"Ecommerce Store" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🎉 Your Order Has Been Placed Successfully!",
      text: `Hi there, your order (ID: ${order._id}) has been successfully placed. We'll notify you when it's shipped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
          <div style="text-align: center; padding-bottom: 20px;">
            <h2 style="color: #2c3e50;">🛒 Order Confirmation</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Hi there,</p>
          <p style="font-size: 16px; color: #333;">Your order <strong>(ID: ${order._id})</strong> has been successfully placed. We'll notify you when it's shipped!</p>
          <div style="margin: 20px 0; padding: 15px; background: #ecf0f1; border-radius: 5px; text-align: center;">
            <p style="font-size: 18px; margin: 0;">📦 Order ID: <strong>${order._id}</strong></p>
          </div>
          <p style="font-size: 14px; color: #555;">Thank you for shopping with us! If you have any questions, feel free to reply to this email.</p>
          <div style="text-align: center; padding-top: 20px;">
            <a href="https://yourstore.com" style="text-decoration: none; background: #27ae60; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">Visit Store</a>
          </div>
        </div>
      `
    };
    

    await transporter.sendMail(mailOptions);
    console.log("✅ Order confirmation email sent successfully");

    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress } = req.body;
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

    res.status(201).json(newOrder);
  } catch (error) {
    // console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Orders for a Specific User
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'name price image description'
      })
      .sort({ createdAt: -1 })
      .lean();

    const ordersWithComplete = orders.map(order => ({
      ...order,
      shippingAddress: order.shippingAddress || {}
    }));

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

    const updatedOrders = await Order.find();
    res.status(200).json({ message: "Order deleted successfully", orders: updatedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
