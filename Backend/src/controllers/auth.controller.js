import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Code from '../models/emailVerification.model.js';

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
  const {  email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const tempUser  = await Code.findOne({ email });
    if (!tempUser) return res.status(400).json({ message: 'Something went wrong. Please try again.' });
    const name = tempUser.name;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
    });

    // ✅ Delete email verification code after successful signup
    await Code.deleteOne({ email });

    const token = generateToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      message: 'User registered',
      user: { id: user._id, name, email, role: user.role },
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

    if (user.type === 'google') {
      return res.status(400).json({ message: 'User is registered with Google. Please login using Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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

export const sendVerificationCode = async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findOne({ email });

  if (user) return res.status(400).json({ message: 'User already exists' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await Code.findOneAndUpdate(
  { email },
  {
    name,
    code,
    expiresAt: Date.now() + 2 * 60 * 1000,
  },
  { upsert: true, new: true }
);

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
    to: email,
    subject: "📩 Email Verification Code",
    html: `<p>Your email verification code is: <strong>${code}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ success: true, message: "Verification code sent to email" });
};

export const verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  const record = await Code.findOne({ email });

  if (
    !record ||
    record.code !== code ||
    record.expiresAt < Date.now()
  ) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }


  res.json({ success: true, message: "Email verified successfully" });
};

export const getVerifyCodeByEmail = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user || !user.emailVerificationCode) {
    return res.status(404).json({ error: "No valid verification code found" });
  }

  return res.json({ success: true, code: user.emailVerificationCode });
};

export const sendResetCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.type === "google") {
    return res.status(400).json({ message: "User is registered with Google" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = code;
  user.resetCodeExpires = Date.now() + 2 * 60 * 1000;
  await user.save();

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
    to: email,
    subject: "🔐 Password Reset Code",
    html: `<p>Your password reset code is: <strong>${code}</strong></p>`
  };

  await transporter.sendMail(mailOptions);

  res.json({ success: true, message: "Reset code sent to email" });
};

export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.resetCode !== code || Date.now() > user.resetCodeExpires) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  res.json({ success: true, message: "Code verified" });
};

export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.resetCode !== code || Date.now() > user.resetCodeExpires) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: "Invalid new password" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = null;
  user.resetCodeExpires = null;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
};

export const getResetCodeByEmail = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user || !user.resetCode ) {
    return res.status(404).json({ error: "No valid reset code found" });
  }

  return res.json({ success: true, code: user.resetCode });
};
