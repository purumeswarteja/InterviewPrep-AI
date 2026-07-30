import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Profile from './models/Profile.js';
import InterviewSession from './models/InterviewSession.js';
import ResumeAnalysis from './models/ResumeAnalysis.js';

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewprep';

app.use(cors());
app.use(express.json());

// ─── DB Connection ───────────────────────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const user = await User.create({
      id: userId,
      email: email.toLowerCase(),
      password: hashed,
    });
    await Profile.create({
      id: uuidv4(),
      user_id: userId,
      full_name,
    });
    const token = jwt.sign({ userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: userId, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Credentials not matched. Please try again.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Credentials not matched. Please try again.' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user + profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ user: { id: req.user.userId, email: req.user.email }, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
app.delete('/api/auth/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    await User.deleteOne({ id: userId });
    await Profile.deleteOne({ user_id: userId });
    await InterviewSession.deleteMany({ user_id: userId });
    await ResumeAnalysis.deleteMany({ user_id: userId });
    res.json({ success: true, message: 'Account and all associated data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Profile Routes ───────────────────────────────────────────────────────────

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user.userId },
      { ...req.body, updated_at: new Date().toISOString() },
      { new: true }
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Interview Session Routes ─────────────────────────────────────────────────

app.get('/api/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user_id: req.user.userId }).sort({ created_at: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions', authMiddleware, async (req, res) => {
  try {
    const session = await InterviewSession.create({
      id: uuidv4(),
      user_id: req.user.userId,
      type: req.body.type || 'mock',
      topic: req.body.topic || 'Practice',
      difficulty: req.body.difficulty || 'medium',
      score: req.body.score ?? null,
      duration_seconds: req.body.duration_seconds ?? null,
      questions: req.body.questions || [],
      answers: req.body.answers || [],
      feedback: req.body.feedback || {},
      status: req.body.status || 'completed',
    });

    // Update profile stats
    const allSessions = await InterviewSession.find({ user_id: req.user.userId });
    const scoredSessions = allSessions.filter((s) => s.score !== null);
    const avg_score = scoredSessions.length
      ? scoredSessions.reduce((sum, s) => sum + Number(s.score), 0) / scoredSessions.length
      : 0;

    await Profile.findOneAndUpdate(
      { user_id: req.user.userId },
      {
        total_interviews: allSessions.length,
        avg_score,
        updated_at: new Date().toISOString(),
      }
    );

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await InterviewSession.findOneAndDelete({
      id: req.params.id,
      user_id: req.user.userId,
    });
    if (!result) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Resume Analysis Routes ───────────────────────────────────────────────────

app.post('/api/resume-analyses', authMiddleware, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.create({
      id: uuidv4(),
      user_id: req.user.userId,
      file_name: req.body.file_name || '',
      resume_text: req.body.resume_text || '',
      ats_score: req.body.ats_score || 0,
      grammar_score: req.body.grammar_score || 0,
      keyword_score: req.body.keyword_score || 0,
      overall_score: req.body.overall_score || 0,
      keywords_found: req.body.keywords_found || [],
      keywords_missing: req.body.keywords_missing || [],
      suggestions: req.body.suggestions || [],
      strengths: req.body.strengths || [],
      weaknesses: req.body.weaknesses || [],
    });
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Analytics Route ──────────────────────────────────────────────────────────

app.get('/api/analytics', authMiddleware, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user_id: req.user.userId }).sort({ created_at: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Password Reset (stub) ────────────────────────────────────────────────────

app.post('/api/password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  res.json({ message: 'Password reset request received. (Not implemented in mock backend)' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`🚀 Express backend running on http://localhost:${port}`);
});
