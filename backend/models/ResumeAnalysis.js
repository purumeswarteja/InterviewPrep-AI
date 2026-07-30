import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const resumeAnalysisSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  user_id: { type: String, required: true },
  file_name: { type: String, default: '' },
  resume_text: { type: String, default: '' },
  ats_score: { type: Number, default: 0 },
  grammar_score: { type: Number, default: 0 },
  keyword_score: { type: Number, default: 0 },
  overall_score: { type: Number, default: 0 },
  keywords_found: { type: [String], default: [] },
  keywords_missing: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  created_at: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
