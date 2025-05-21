import express from 'express';
import { signup, login, logout, checkAuth } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
   sendResetCode,
   verifyResetCode,
   resetPassword,
   getResetCodeByEmail,
   sendVerificationCode,
   getVerifyCodeByEmail,
   verifyEmailCode
  
  } from '../controllers/auth.controller.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model.js';
import passport from 'passport';

dotenv.config();

const router = express.Router();

// Regular auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/checkAuth', protectRoute, checkAuth);
router.post('/forgot-password', sendResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/get-reset-code/:email', getResetCodeByEmail);
router.post('/send-verify-code', sendVerificationCode);
router.get('/get-verification-code/:email', getVerifyCodeByEmail);
router.post('/verify-email-code', verifyEmailCode);

// Google login with Google Identity Services (one-tap and sign-in button)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        googleId: payload.sub,
        type: 'google',
        // Generate a random password or handle passwordless auth
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
      });
    } else if (!user.googleId) {
      // If user exists but hasn't used Google auth before, update their Google ID
      user.googleId = payload.sub;
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
      }
      await user.save();
    }

    // Generate JWT
    const authToken = jwt.sign(
      { id: user._id, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('jwt', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ 
      message: 'Login successful', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'user'
      } 
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Traditional OAuth flow routes (if you want to keep this approach too)
router.get('/google/start', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login', 
    session: false 
  }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set JWT in HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    res.redirect(process.env.CLIENT_URL || '/');
  }
);

export default router;