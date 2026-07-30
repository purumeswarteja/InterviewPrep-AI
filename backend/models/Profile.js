import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const profileSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  user_id: { type: String, required: true, unique: true },
  full_name: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin_url: { type: String, default: '' },
  github_url: { type: String, default: '' },
  portfolio_url: { type: String, default: '' },
  target_role: { type: String, default: '' },
  experience_level: { type: String, default: '' },
  skills: { type: [String], default: [] },
  avatar_url: { type: String, default: '' },
  streak_count: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  last_active_date: { type: String, default: null },
  weekly_goal: { type: Number, default: 5 },
  monthly_goal: { type: Number, default: 20 },
  total_interviews: { type: Number, default: 0 },
  avg_score: { type: Number, default: 0 },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model('Profile', profileSchema);
