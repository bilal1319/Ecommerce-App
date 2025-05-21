// models/user.model.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.type === "local"; // Required only if local auth
      },
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    type: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    resetCode: {
    type: String,
    default: null,
},
resetCodeExpires: {
  type: Number,
  default: null,
},
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
