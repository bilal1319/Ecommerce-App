import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists by Google ID or email
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Try to find by email
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Update existing user with Google ID
                user.googleId = profile.id;
                if (profile.photos && profile.photos[0] && !user.avatar) {
                    user.avatar = profile.photos[0].value;
                }
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    // Generate a random password or handle passwordless authentication
                    password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
                    role: 'user'
                });
            }
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});