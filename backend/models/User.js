import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  created_at: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model('User', userSchema);
