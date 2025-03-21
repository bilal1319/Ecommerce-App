import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // Include role
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Signup Controller
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
    });

    const token = generateToken(user);
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    res.status(201).json({
      message: 'User registered',
      user: { id: user._id, name, email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout Controller
export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// Check Authenticated User
export const checkAuth = (req, res) => {
  try {
      res.status(200).json(req.user)
  } catch (error) {
      console.log("error in checkAuth controller", error);
      res.status(500).json({message: "Interval Server Error "})
  }
}
