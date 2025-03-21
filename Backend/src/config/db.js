import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

// Ensure we don't attach multiple listeners
process.setMaxListeners(15);

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log(" Already connected to MongoDB");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);

    // Check admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(" Admin credentials not set in .env");
      return; // Don't force exit
    }

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log(" Admin user created");
    } else {
      console.log(" Admin user already exists");
    }
  } catch (error) {
    console.error(` Error connecting to DB: ${error.message}`);

    // Only exit if this is the first error
    if (!process.exitCode) {
      process.exit(1);
    }
  }
};

export default connectDB;
