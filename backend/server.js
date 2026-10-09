import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';

import User from './models/User.js';
import Profile from './models/Profile.js';
import InterviewSession from './models/InterviewSession.js';
import ResumeAnalysis from './models/ResumeAnalysis.js';

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewprep';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// ─── AI Integration Routes (Google Gemini) ───────────────────────────────────

function cleanJsonResponse(text) {
  try {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(clean);
  } catch (err) {
    console.error('JSON parse error from AI response:', err.message, text);
    return null;
  }
}

async function callGeminiApi(prompt) {
  const model = 'gemini-flash-latest';
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`Gemini AI attempt ${attempt} failed (${err.message}). Retrying...`);
      lastError = err;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
    }
  }
  throw lastError || new Error('Gemini AI call failed after retries');
}



// 1. Dynamic AI Resume Analyzer
app.post('/api/ai/analyze-resume', async (req, res) => {
  try {
    const { resume_text, file_name } = req.body;
    if (!resume_text || resume_text.trim().length < 30) {
      return res.status(400).json({ error: 'Resume text is too short or missing.' });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) & Senior Hiring Manager. 
Analyze the following resume text carefully:

--- RESUME START ---
${resume_text.slice(0, 6000)}
--- RESUME END ---

Instructions:
1. Detect the candidate's primary domain/field (e.g., "Machine Learning", "Full Stack Development", "Data Science", "DevOps & Cloud", "Mobile Development", "Cybersecurity", "UI/UX", etc.).
2. Evaluate ATS compatibility, keyword relevance for their SPECIFIC domain, grammar/formatting, and overall strength.
3. Identify keywords that ARE PRESENT in the resume relevant to their domain.
4. Identify high-value RECOMMENDED MISSING KEYWORDS specifically relevant to their target domain (e.g. if Machine Learning, suggest PyTorch, MLOps, Model Deployment, etc. Do NOT suggest irrelevant web dev skills like React/Redis unless it's fullstack).
5. Provide actionable suggestions, strengths, and weaknesses.

Respond ONLY with a valid JSON object in this exact format (no extra text):
{
  "detected_domain": "string",
  "ats_score": number (0-100),
  "grammar_score": number (0-100),
  "keyword_score": number (0-100),
  "overall_score": number (0-100),
  "keywords_found": ["array of detected domain skills"],
  "keywords_missing": ["array of recommended missing domain skills"],
  "strengths": ["array of key strengths"],
  "weaknesses": ["array of areas to improve"],
  "suggestions": ["array of actionable recommendations"]
}`;

    const rawText = await callGeminiApi(prompt);
    const parsed = cleanJsonResponse(rawText);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse AI resume analysis output.' });
    }

    res.json({ analysis: parsed });
  } catch (err) {
    console.error('AI Resume Analysis Error:', err.message);
    res.status(500).json({ error: 'AI Resume Analysis failed: ' + err.message });
  }
});


// 2. Dynamic AI Interview Evaluator
app.post('/api/ai/evaluate-interview', async (req, res) => {
  try {
    const { question, answer, topic, difficulty, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    const prompt = `You are a Senior Technical Interviewer and Domain Expert in "${topic || 'Software Engineering'}".

Evaluate the following candidate interview response:
- Category/Domain: ${category || topic || 'Technical'}
- Difficulty Level: ${difficulty || 'medium'}
- Interview Question: "${question}"
- Candidate's Answer: "${answer}"

CRITICAL INSTRUCTIONS:
- Evaluate based on SEMANTIC CORRECTNESS, LOGIC, and TECHNICAL COMPLETENESS.
- DO NOT penalize the candidate simply because they didn't use exact hardcoded buzzwords if their logic and explanation are accurate.
- If the candidate's answer is correct, grant a high score (80-100%) and praise their conceptual understanding.
- If incomplete or incorrect, explain constructively what was missing.

Respond ONLY with a valid JSON object in this exact format (no extra markdown outside JSON):
{
  "score": number (0-100),
  "is_correct": boolean,
  "verdict": "string (e.g., 'Excellent', 'Good', 'Needs Improvement')",
  "strengths": ["array of what candidate explained well"],
  "missing_concepts": ["array of missing technical points or edge cases"],
  "improved_sample_answer": "string (ideal concise sample answer for this question)",
  "feedback_notes": "string (overall summary feedback for the candidate)"
}`;

    const rawText = await callGeminiApi(prompt);
    const parsed = cleanJsonResponse(rawText);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse AI evaluation output.' });
    }

    res.json({ evaluation: parsed });
  } catch (err) {
    console.error('AI Interview Evaluation Error:', err.message);
    res.status(500).json({ error: 'AI evaluation failed: ' + err.message });
  }
});

// 3. Dynamic AI HR Question & Adaptive Follow-Up Generator
app.post('/api/ai/generate-hr-question', async (req, res) => {
  try {
    const {
      role,
      topicId = 'introduction',
      topicName = 'Introduction',
      totalQuestions = 5,
      currentQuestion = 1,
      previousQuestions = [],
      previousAnswers = []
    } = req.body;

    const prevQAFormatted = (previousQuestions || []).map((q, idx) => {
      const a = (previousAnswers && previousAnswers[idx]) ? previousAnswers[idx] : '(Skipped / No response)';
      return `Question ${idx + 1}: ${q}\nAnswer ${idx + 1}: ${a}`;
    }).join('\n\n');

    const prompt = `You are a Senior HR Director and Behavioral Interviewer.
Target Role Context: ${role || 'General Position'}
HR Topic Block: ${topicName} (ID: ${topicId})
Total Questions Requested: ${totalQuestions}
Current Question Number: ${currentQuestion}

Previous Questions and Answers in this Interview:
${prevQAFormatted || 'None (This is the first question of the HR round)'}

CRITICAL RULES FOR ADAPTIVE HR INTERVIEWING:
1. Focus on the selected HR Topic Block: ${topicName}.
2. ADAPTIVE FOLLOW-UP RULE: Analyze the candidate's LAST answer (if present).
   - If the candidate mentioned a specific conflict, project detail, mistake, decision, or event that warrants deeper exploration, ask a natural, conversational FOLLOW-UP question about that specific lead.
   - Example: If candidate said "I had a conflict with a teammate regarding architecture", ask: "How did you handle that conflict with your teammate, and what was the ultimate outcome?"
3. STRICT NO REPEATED QUESTIONS OR CONCEPTS RULE:
   - Carefully examine the Previous Questions listed above.
   - NEVER re-ask a question, concept, or topic that was already asked in Previous Questions!
   - If the previous question was an adaptive follow-up (e.g. asking how candidate overcame a weakness or conflict), DO NOT return to the initial question about strengths/weaknesses or conflicts. Immediately move forward to a NEW, UNASKED question or competency!
4. Assess soft skills, communication clarity, situational judgment, STAR method structure, and culture fit.
5. Keep questions professional, engaging, and direct.

Respond ONLY with a valid JSON object in this exact format (no markdown formatting outside JSON):
{
  "question": "string (the HR question or adaptive follow-up question)",
  "is_followup": boolean (true if this question is a direct follow-up to the candidate's last answer, false otherwise),
  "focus_topic": "string (the topic block or competency evaluated)",
  "evaluation_of_previous": {
    "score": number (0-100 score for previous answer, or null if first question),
    "verdict": "string (e.g., 'Articulate STAR Response', 'Good Points', 'Needs Detail', 'Skipped')",
    "feedback": "string (constructive evaluation notes on candidate's previous response, or empty string if first question)"
  }
}`;

    let rawText;
    let parsed;
    try {
      rawText = await callGeminiApi(prompt);
      parsed = cleanJsonResponse(rawText);
    } catch (apiErr) {
      console.warn('Gemini API call failed for HR question, using topic fallback:', apiErr.message);
    }

    if (!parsed || !parsed.question) {
      // Topic Block Fallback Generator with No-Repeat Filter
      const fallbackQuestionsMap = {
        'introduction': [
          `Tell me about yourself, your background, and what key experiences led you to pursue a role as a ${role || 'candidate'}.`,
          `Walk me through your resume and highlight the achievements you are most proud of.`,
          `What aspect of your professional background makes you well-suited for this position?`
        ],
        'education-projects': [
          `Why did you choose your field of study/major, and how has it shaped your technical career?`,
          `Tell me about your primary project. What was your specific contribution and what challenges did you overcome?`,
          `If you had to rebuild your major project today, what design or technical choices would you change?`
        ],
        'strengths-weaknesses': [
          `What are your top 2-3 greatest professional strengths? Give a concrete example of how you applied one recently.`,
          `What is an area or weakness you are actively working to improve, and what concrete steps are you taking?`,
          `How do you handle situations where a task requires skills outside your current expertise?`
        ],
        'behavioral': [
          `Tell me about a time you faced a high-pressure situation or tight deadline. How did you handle it?`,
          `Describe a situation where you had a conflict with a teammate or stakeholder. How did you resolve it?`,
          `Tell me about a time you experienced a failure or mistake. How did you handle it and what did you learn?`
        ],
        'career-company': [
          `Why do you want to join our company, and what unique value would you bring to our team?`,
          `Why should we hire you over other qualified candidates for this position?`,
          `Where do you see yourself professionally in 3 to 5 years?`
        ],
        'situational': [
          `What would you do if a teammate was not contributing their fair share to a project with an urgent deadline?`,
          `How would you handle a situation where you strongly disagreed with your manager's decision?`,
          `How do you prioritize your work when managing multiple competing high-priority deadlines?`
        ],
        'closing': [
          `Do you have any questions for us regarding the team, role expectations, or company culture?`,
          `Is there anything else about your background or qualifications that we haven't covered today?`
        ]
      };

      const topicPool = fallbackQuestionsMap[topicId] || fallbackQuestionsMap['introduction'];
      const prevTexts = (previousQuestions || []).map(q => q.toLowerCase());
      const unusedPool = topicPool.filter(q => !prevTexts.some(pq => pq.includes(q.slice(0, 20).toLowerCase())));

      const fallbackQ = unusedPool.length > 0
        ? unusedPool[0]
        : topicPool[(currentQuestion - 1) % topicPool.length];

      const lastAns = previousAnswers && previousAnswers.length > 0 ? previousAnswers[previousAnswers.length - 1] : '';
      const isLastSkipped = !lastAns || lastAns.includes('(Skipped') || lastAns.trim() === '';

      parsed = {
        question: fallbackQ,
        is_followup: false,
        focus_topic: topicName,
        evaluation_of_previous: currentQuestion > 1 ? {
          score: isLastSkipped ? 0 : 75,
          verdict: isLastSkipped ? 'Skipped' : 'Good Communication',
          feedback: isLastSkipped ? 'Question was skipped with no candidate response.' : 'Response delivered with reasonable clarity.'
        } : null
      };
    }

    res.json({ result: parsed });
  } catch (err) {
    console.error('AI HR Question Error:', err.message);
    const fallbackQ = `Tell me about yourself, your background, and why you are interested in this position as a ${req.body.role || 'candidate'}.`;
    res.json({
      result: {
        question: fallbackQ,
        is_followup: false,
        focus_topic: req.body.topicName || 'Introduction',
        evaluation_of_previous: null
      }
    });
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
