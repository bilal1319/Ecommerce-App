import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Code = mongoose.model('EmailVerification', emailVerificationSchema);
export default Code;
