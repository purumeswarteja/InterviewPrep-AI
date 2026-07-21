import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 4000;
const dbPath = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

app.use(cors());
app.use(express.json());

const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], profiles: [], interview_sessions: [], resume_analyses: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

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
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const db = readDb();
  const existing = db.users.find((u) => u.email === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email: email.toLowerCase(), password: hashed, created_at: new Date().toISOString() };
  db.users.push(user);
  db.profiles.push({
    id: uuidv4(),
    user_id: user.id,
    full_name,
    bio: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    target_role: '',
    experience_level: 'junior',
    skills: [],
    streak_count: 0,
    longest_streak: 0,
    last_active_date: null,
    weekly_goal: 5,
    monthly_goal: 20,
    total_interviews: 0,
    avg_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  writeDb(db);
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const db = readDb();
  const profile = db.profiles.find((p) => p.user_id === req.user.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ user: { id: req.user.userId, email: req.user.email }, profile });
});

app.put('/api/profile', authMiddleware, (req, res) => {
  const db = readDb();
  const profile = db.profiles.find((p) => p.user_id === req.user.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  Object.assign(profile, req.body, { updated_at: new Date().toISOString() });
  writeDb(db);
  res.json({ profile });
});

app.get('/api/sessions', authMiddleware, (req, res) => {
  const db = readDb();
  const sessions = db.interview_sessions.filter((s) => s.user_id === req.user.userId);
  res.json({ sessions });
});

app.post('/api/sessions', authMiddleware, (req, res) => {
  const db = readDb();
  const session = {
    id: uuidv4(),
    user_id: req.user.userId,
    type: req.body.type || 'mock',
    topic: req.body.topic || 'Practice',
    difficulty: req.body.difficulty || 'medium',
    score: req.body.score || null,
    duration_seconds: req.body.duration_seconds || null,
    questions: req.body.questions || [],
    answers: req.body.answers || [],
    feedback: req.body.feedback || {},
    status: req.body.status || 'completed',
    created_at: new Date().toISOString()
  };
  db.interview_sessions.push(session);
  const profile = db.profiles.find((p) => p.user_id === req.user.userId);
  if (profile) {
    profile.total_interviews = (profile.total_interviews || 0) + 1;
    if (session.score !== null) {
      const userSessions = db.interview_sessions.filter((s) => s.user_id === req.user.userId && s.score !== null);
      profile.avg_score = userSessions.reduce((sum, item) => sum + Number(item.score), 0) / userSessions.length;
    }
    profile.updated_at = new Date().toISOString();
  }
  writeDb(db);
  res.json({ session });
});

app.delete('/api/sessions/:id', authMiddleware, (req, res) => {
  const db = readDb();
  const index = db.interview_sessions.findIndex((s) => s.id === req.params.id && s.user_id === req.user.userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }
  db.interview_sessions.splice(index, 1);
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/resume-analyses', authMiddleware, (req, res) => {
  const db = readDb();
  const analysis = {
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
    created_at: new Date().toISOString()
  };
  db.resume_analyses.push(analysis);
  writeDb(db);
  res.json({ analysis });
});

app.get('/api/analytics', authMiddleware, (req, res) => {
  const db = readDb();
  const sessions = db.interview_sessions.filter((s) => s.user_id === req.user.userId);
  res.json({ sessions });
});

app.post('/api/password-reset', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const db = readDb();
  const user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }
  res.json({ message: 'Password reset request received. (Not implemented in mock backend)' });
});

app.listen(port, () => {
  console.log(`Express backend running on http://localhost:${port}`);
});
