import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const interviewSessionSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  user_id: { type: String, required: true },
  type: { type: String, default: 'mock' },
  topic: { type: String, default: 'Practice' },
  difficulty: { type: String, default: 'medium' },
  score: { type: Number, default: null },
  duration_seconds: { type: Number, default: null },
  questions: { type: mongoose.Schema.Types.Mixed, default: [] },
  answers: { type: mongoose.Schema.Types.Mixed, default: [] },
  feedback: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'completed' },
  created_at: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model('InterviewSession', interviewSessionSchema);
