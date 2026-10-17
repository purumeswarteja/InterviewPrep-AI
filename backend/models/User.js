import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  otpHash: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  otpAttempts: { type: Number, default: 0 },
  otpLastSentAt: { type: Date, default: null },
  pendingEmail: { type: String, default: null, lowercase: true, trim: true },
  pendingEmailOtpHash: { type: String, default: null },
  pendingEmailOtpExpiresAt: { type: Date, default: null },
  pendingEmailOtpAttempts: { type: Number, default: 0 },
  pendingEmailOtpLastSentAt: { type: Date, default: null },
  passwordResetOtpHash: { type: String, default: null },
  passwordResetOtpExpiresAt: { type: Date, default: null },
  passwordResetOtpAttempts: { type: Number, default: 0 },
  passwordResetOtpLastSentAt: { type: Date, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetTokenExpiresAt: { type: Date, default: null },
  deleteAccountOtpHash: { type: String, default: null },
  deleteAccountOtpExpiresAt: { type: Date, default: null },
  deleteAccountOtpAttempts: { type: Number, default: 0 },
  deleteAccountOtpLastSentAt: { type: Date, default: null },
  created_at: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model('User', userSchema);
