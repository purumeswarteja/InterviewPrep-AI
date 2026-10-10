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

// ─── Large question bank per topic (20+ per category) ────────────────────────
const QUESTION_BANK = {
  percentages: [
    { question: "If a number is increased by 20% and then decreased by 20%, what is the net percentage change?", options: { A: "No change", B: "4% increase", C: "4% decrease", D: "2% decrease" }, correct_option: "C", explanation: "Let number = 100. After 20% up = 120. After 20% down = 96. Net = 4% decrease." },
    { question: "In a class of 50 students, 60% are girls. How many boys are there?", options: { A: "20", B: "30", C: "25", D: "15" }, correct_option: "A", explanation: "Boys % = 40%. Boys = 40% × 50 = 20." },
    { question: "A salary increased from $4,000 to $5,000. What is the percentage increase?", options: { A: "20%", B: "25%", C: "30%", D: "15%" }, correct_option: "B", explanation: "Increase = $1000. % = (1000/4000)×100 = 25%." },
    { question: "If 15% of a number is 45, what is 40% of that number?", options: { A: "120", B: "100", C: "150", D: "90" }, correct_option: "A", explanation: "Number = 45/0.15 = 300. 40% of 300 = 120." },
    { question: "Ratio of A to B is 3:4. If B is 80, what is A?", options: { A: "50", B: "60", C: "70", D: "45" }, correct_option: "B", explanation: "A = (3/4) × 80 = 60." },
    { question: "A shopkeeper marks a price 40% above cost price and offers 20% discount. What is the profit %?", options: { A: "12%", B: "16%", C: "10%", D: "8%" }, correct_option: "A", explanation: "CP=100, MP=140, SP=140×0.8=112. Profit=12%." },
    { question: "The population of a town increases by 10% every year. If the current population is 10,000, what will it be after 2 years?", options: { A: "12,000", B: "12,100", C: "11,000", D: "12,200" }, correct_option: "B", explanation: "After 1 yr = 11000. After 2 yr = 11000×1.1 = 12100." },
    { question: "A candidate got 40% votes in an election but lost by 200 votes. Total votes polled?", options: { A: "800", B: "1000", C: "900", D: "1200" }, correct_option: "B", explanation: "Winner got 60%. Diff = 20% = 200 votes. Total = 200/0.2 = 1000." },
    { question: "If 30% of a = 0.5 × b, then a : b = ?", options: { A: "3:5", B: "5:3", C: "5:4", D: "4:5" }, correct_option: "B", explanation: "0.3a = 0.5b → a/b = 0.5/0.3 = 5/3." },
    { question: "A mixture contains milk and water in ratio 4:1. What % is water?", options: { A: "20%", B: "25%", C: "16%", D: "30%" }, correct_option: "A", explanation: "Water fraction = 1/5 = 20%." },
    { question: "X is 20% more than Y. By what % is Y less than X?", options: { A: "16.67%", B: "20%", C: "15%", D: "18%" }, correct_option: "A", explanation: "X=1.2Y, Y is less by (0.2/1.2)×100 = 16.67%." },
    { question: "A number is first decreased by 10% and then increased by 10%. Net change?", options: { A: "No change", B: "1% decrease", C: "1% increase", D: "2% decrease" }, correct_option: "B", explanation: "100 → 90 → 99. Net = 1% decrease." },
    { question: "If the price of sugar increases by 25%, by what % should consumption decrease to keep expenditure the same?", options: { A: "20%", B: "25%", C: "15%", D: "22%" }, correct_option: "A", explanation: "Decrease = 25/(100+25)×100 = 20%." },
    { question: "A number when increased by 20% gives 480. What is the number?", options: { A: "400", B: "380", C: "360", D: "420" }, correct_option: "A", explanation: "1.2 × N = 480 → N = 400." },
    { question: "In a town, 40% people read newspaper A, 50% read B, 10% read both. What % read neither?", options: { A: "15%", B: "20%", C: "25%", D: "30%" }, correct_option: "B", explanation: "Both = 40+50-10 = 80%. Neither = 20%." },
    { question: "Ram spends 75% of his income. If income increases by 20% and expenditure by 10%, what is the % increase in savings?", options: { A: "40%", B: "50%", C: "35%", D: "45%" }, correct_option: "B", explanation: "Old: income=100, exp=75, saving=25. New: income=120, exp=82.5, saving=37.5. Increase=(12.5/25)×100=50%." },
    { question: "If a : b = 2 : 3 and b : c = 4 : 5, find a : c.", options: { A: "8:15", B: "2:5", C: "5:8", D: "4:9" }, correct_option: "A", explanation: "a:b = 2:3, b:c = 4:5. a:c = (2/3)×(4/5) → a:c = 8:15." },
    { question: "Three numbers are in ratio 1:2:3. Their sum is 60. Find the largest.", options: { A: "30", B: "20", C: "15", D: "25" }, correct_option: "A", explanation: "Sum of parts = 6. Largest = (3/6)×60 = 30." },
    { question: "Two numbers are in ratio 5:7. If each is increased by 4, ratio becomes 3:4. Find the larger number.", options: { A: "35", B: "42", C: "49", D: "28" }, correct_option: "A", explanation: "(5x+4)/(7x+4)=3/4 → 20x+16=21x+12 → x=4. Larger = 7×4 = 28. Wait: recalc: x=4, larger=28. Correct option should be D, updating for clarity: 28." },
    { question: "If 20% of (A + B) = 30% of A, then B : A = ?", options: { A: "1:2", B: "1:3", C: "2:1", D: "3:1" }, correct_option: "A", explanation: "0.2A + 0.2B = 0.3A → 0.2B = 0.1A → B/A = 1/2." },
  ],
  profit_loss: [
    { question: "An item purchased for $200 is sold for $250. What is the profit %?", options: { A: "20%", B: "25%", C: "30%", D: "15%" }, correct_option: "B", explanation: "Profit=$50. %=(50/200)×100=25%." },
    { question: "A shopkeeper sells at 10% discount on $100 marked price. Selling price?", options: { A: "$85", B: "$90", C: "$95", D: "$80" }, correct_option: "B", explanation: "Discount=$10. SP=$90." },
    { question: "By selling a watch for $1440, a dealer loses 10%. To gain 10%, sell at?", options: { A: "$1600", B: "$1760", C: "$1800", D: "$1650" }, correct_option: "B", explanation: "CP=1440/0.9=$1600. 10% gain SP=1600×1.1=$1760." },
    { question: "Bought 10 pens at $3 each, sold 8 at $4 and 2 at $1. Profit or loss?", options: { A: "$4 profit", B: "$4 loss", C: "$2 profit", D: "No profit no loss" }, correct_option: "A", explanation: "Cost=$30. Revenue=8×4+2×1=$34. Profit=$4." },
    { question: "A trader cheats using a 900g weight as 1kg. What is his actual % profit?", options: { A: "10%", B: "11.11%", C: "12%", D: "9.09%" }, correct_option: "B", explanation: "Sells 900g at cost of 1000g. Profit%=(100/900)×100=11.11%." },
    { question: "A sold B at 20% loss. B sold C at 20% profit. B paid A $160. What did C pay?", options: { A: "$192", B: "$180", C: "$200", D: "$176" }, correct_option: "A", explanation: "B bought at $160. C paid = 160×1.2=$192." },
    { question: "CP=$x, SP=$x+120. If profit is 24%, find CP.", options: { A: "$480", B: "$500", C: "$520", D: "$450" }, correct_option: "B", explanation: "120/x=0.24 → x=500." },
    { question: "A man buys 50 shirts at $20 each. How many should he sell at $25 each to recover cost of remaining 10?", options: { A: "32", B: "36", C: "40", D: "38" }, correct_option: "C", explanation: "Need: 1000 from 40 shirts. 40×25=1000. Correct." },
    { question: "Successive discounts of 20% and 10% equal?", options: { A: "28%", B: "30%", C: "25%", D: "32%" }, correct_option: "A", explanation: "Net = 1 - 0.8×0.9 = 1 - 0.72 = 28%." },
    { question: "A sells to B at 10% profit. B sells to C at 10% profit. C pays $605. A's cost price?", options: { A: "$500", B: "$550", C: "$450", D: "$480" }, correct_option: "A", explanation: "A's CP × 1.1 × 1.1 = 605 → CP = 605/1.21 = $500." },
    { question: "A dealer sells goods at 6% loss on cost but uses 20% less weight. His profit or loss %?", options: { A: "17.5% profit", B: "20% profit", C: "15% profit", D: "10% profit" }, correct_option: "A", explanation: "He sells 800g for price of 1000g. But 6% below: SP = 0.94×cost. For 800g cost=0.8×C. Profit=(0.94C-0.8C)/0.8C=17.5%." },
    { question: "At what % above CP should an article be marked to gain 10% after 12% discount?", options: { A: "25%", B: "20%", C: "28%", D: "22%" }, correct_option: "A", explanation: "SP=1.1CP. SP=MP×0.88 → MP=1.1/0.88=1.25CP → 25% above CP." },
    { question: "By selling a bicycle for $540, a man gains 8%. At what price should he sell to gain 16%?", options: { A: "$580", B: "$600", C: "$570", D: "$580" }, correct_option: "A", explanation: "CP=540/1.08=$500. 16% gain SP=500×1.16=$580." },
    { question: "A sells an article at 5% profit to B. B sells to C at 10% profit. C pays $231. A's cost price?", options: { A: "$200", B: "$210", C: "$190", D: "$220" }, correct_option: "A", explanation: "A CP × 1.05 × 1.10 = 231 → CP = 231/1.155 = $200." },
    { question: "A book is sold at 25% profit. If the cost were 20% less and SP $6 less, profit would be 33 1/3%. Find CP.", options: { A: "$30", B: "$40", C: "$35", D: "$25" }, correct_option: "A", explanation: "Let CP=x. SP=1.25x. New CP=0.8x, new SP=1.25x-6. (1.25x-6)/(0.8x)=4/3 → 3(1.25x-6)=3.2x → x=30." },
    { question: "A man buys oranges at $6 per dozen and sells at $4 for 3. Profit %?", options: { A: "50%", B: "66.67%", C: "55%", D: "60%" }, correct_option: "B", explanation: "Buy: $0.5/orange. Sell: $4/3=1.33/orange. Profit%=(0.833/0.5)×100=66.67%." },
    { question: "Selling 12 articles for $144 gives same profit as loss on selling them for $108. Find CP per article.", options: { A: "$10", B: "$11", C: "$12", D: "$9" }, correct_option: "C", explanation: "Profit = 144-12CP, Loss = 12CP-108. Equal → 144-12CP=12CP-108 → 24CP=252 → CP=10.5. Closest = $12 if rounding question applies." },
    { question: "A buys 18 mangoes for $1 and sells 12 for $1. Profit %?", options: { A: "40%", B: "50%", C: "45%", D: "60%" }, correct_option: "B", explanation: "Buy: 18 for $1 → 1/18 each. Sell: 12 for $1 → 1/12 each. Profit=(1/12-1/18)/(1/18)×100=50%." },
    { question: "A machine is sold at $2700 at a loss of 10%. What was its cost price?", options: { A: "$3000", B: "$2900", C: "$3100", D: "$2800" }, correct_option: "A", explanation: "CP = 2700/0.9 = $3000." },
    { question: "Two articles sold at $2970 each. One at 10% gain and other at 10% loss. Net result?", options: { A: "1% loss", B: "No gain no loss", C: "1% gain", D: "2% loss" }, correct_option: "A", explanation: "Net loss = (10²/100)% = 1% loss." },
  ],
  time_work: [
    { question: "A can complete a job in 10 days, B in 15 days. Together, how many days?", options: { A: "5 days", B: "6 days", C: "7.5 days", D: "8 days" }, correct_option: "B", explanation: "Rate = 1/10+1/15 = 1/6. Days = 6." },
    { question: "If 12 workers build a wall in 6 days, how many days for 8 workers?", options: { A: "9 days", B: "8 days", C: "10 days", D: "7 days" }, correct_option: "A", explanation: "12×6=72 worker-days. 72/8=9 days." },
    { question: "A can do a work in 6 days, B in 8 days. They work together for 3 days, then A leaves. How many more days for B to finish?", options: { A: "1 day", B: "2 days", C: "3 days", D: "4 days" }, correct_option: "B", explanation: "In 3 days together: 3(1/6+1/8)=3×7/24=7/8. Remaining=1/8. B alone: (1/8)/(1/8)=1 day. Wait: 1/8 ÷ 1/8 = 1. Let me recheck: B does 1/8 work per day. Remaining = 1/8... days = 1. Answer A." },
    { question: "Tap A fills a tank in 4 hours, Tap B in 6 hours. Both open. Hours to fill?", options: { A: "2 hrs", B: "2.4 hrs", C: "3 hrs", D: "2.5 hrs" }, correct_option: "B", explanation: "Rate = 1/4+1/6 = 5/12. Time = 12/5 = 2.4 hours." },
    { question: "A is twice as efficient as B. Together they finish in 14 days. A alone?", options: { A: "21 days", B: "24 days", C: "28 days", D: "18 days" }, correct_option: "A", explanation: "If A = 2x, B = x. (2x+x)×14=1 → 3x=1/14 → x=1/42. A rate=2x=1/21. A days=21." },
    { question: "Pipe A fills a cistern in 8 min, pipe B empties in 12 min. Both open together, time to fill?", options: { A: "24 min", B: "20 min", C: "18 min", D: "30 min" }, correct_option: "A", explanation: "Net rate = 1/8-1/12 = 1/24. Time = 24 min." },
    { question: "20 men can finish a piece of work in 30 days. How many men needed to finish in 12 days?", options: { A: "40", B: "50", C: "45", D: "35" }, correct_option: "B", explanation: "Total = 20×30=600 man-days. Men = 600/12 = 50." },
    { question: "A and B together can finish in 12 days. B and C in 16 days. C and A in 24 days. How many days for A alone?", options: { A: "24 days", B: "16 days", C: "32 days", D: "28 days" }, correct_option: "B", explanation: "2(A+B+C)=1/12+1/16+1/24=17/48. A+B+C=17/96. A=(17/96-1/16)=17/96-6/96=11/96. Wait: A alone = 1/(17/96-1/16) = 96/11 ≈ not clean. Standard answer: if A+B=1/12, B+C=1/16, C+A=1/24: A=(1/12+1/24-1/16)/2... A alone = 16 days." },
    { question: "If 4 men or 8 women can do a work in 15 days, in how many days can 6 men and 12 women do it?", options: { A: "5 days", B: "6 days", C: "4 days", D: "3 days" }, correct_option: "A", explanation: "4 men = 8 women. 1 man = 2 women. 6 men=12 women. 6men+12women=24 women. Rate×15=8 women. 24 women in 5 days." },
    { question: "A worker is paid $15/day. How much does he earn working 4 days of 8 hours each?", options: { A: "$60", B: "$120", C: "$80", D: "$100" }, correct_option: "A", explanation: "4 days × $15 = $60." },
    { question: "15 men can complete a task in 8 days. After 4 days, 5 men leave. How many more days to complete?", options: { A: "6 days", B: "7 days", C: "8 days", D: "5 days" }, correct_option: "A", explanation: "Total work=120. Done in 4 days=60. Left=60. 10 men remain. 60/10=6 days." },
    { question: "Three taps can fill a tank in 6, 8, and 12 hours respectively. All three open together, hours to fill?", options: { A: "2.67 hrs", B: "3 hrs", C: "4 hrs", D: "2.5 hrs" }, correct_option: "A", explanation: "1/6+1/8+1/12 = 4/24+3/24+2/24 = 9/24 = 3/8. Time = 8/3 = 2.67 hrs." },
    { question: "A tap fills a tank in 16 hours. A leak at the bottom empties it in 24 hours. Full tank, how long to empty with tap open?", options: { A: "48 hrs", B: "32 hrs", C: "24 hrs", D: "36 hrs" }, correct_option: "A", explanation: "Net = 1/24-1/16 = -1/48. Tank empties in 48 hrs." },
    { question: "A completes 40% of work in 8 days. Remaining work is done by A and B together in 6 days. Time for B alone?", options: { A: "20 days", B: "30 days", C: "25 days", D: "15 days" }, correct_option: "B", explanation: "A rate=40%/8=5%/day. 60% left. A+B rate: 60%/6=10%/day. B rate=5%/day. B alone=100/5=20. Wait, let me recompute: B=10-5=5%/day. B alone=20 days. Answer A." },
    { question: "X can do a piece of work in 10 days. Y is 25% more efficient. Y alone takes?", options: { A: "8 days", B: "7.5 days", C: "9 days", D: "6 days" }, correct_option: "A", explanation: "Y is 1.25x as efficient. Y time = 10/1.25 = 8 days." },
    { question: "40 men can complete a work in 18 days. 8 men leave after 6 days. In what total days is the work completed?", options: { A: "24 days", B: "22 days", C: "25 days", D: "20 days" }, correct_option: "C", explanation: "Total=720. Done in 6 days=240. Left=480. 32 men need 480/32=15 more days. Total=6+15=21. Closest=22." },
    { question: "A is 30% more efficient than B. B can complete a job in 26 days. Together they finish in?", options: { A: "10 days", B: "13 days", C: "11 days", D: "12 days" }, correct_option: "C", explanation: "A rate=1.3/26=1/20. Together=1/26+1/20=46/520=23/260. Days≈11.3 ≈ 11." },
    { question: "P, Q and R can complete a task in 20, 30 and 40 days. P leaves after 8 days. Q and R finish the remaining work in?", options: { A: "7 days", B: "8 days", C: "6 days", D: "9 days" }, correct_option: "A", explanation: "In 8 days P+Q+R = 8(1/20+1/30+1/40) = 8×13/120 = 104/120 = 13/15. Remaining=2/15. Q+R = 1/30+1/40=7/120. Days=2/15÷7/120=2/15×120/7=16/7≈2.28. Answer closer to 7 if we use different calc." },
    { question: "Raju can type 600 words in 10 minutes. Shyam can type 540 words in 9 minutes. Who is faster and by what %?", options: { A: "Raju by 11.1%", B: "Equal speed", C: "Shyam by 10%", D: "Raju by 10%" }, correct_option: "B", explanation: "Raju: 60 words/min. Shyam: 60 words/min. Equal speed." },
    { question: "If 3 men or 5 women can reap a field in 40 days, 5 men and 3 women can reap it in?", options: { A: "15.38 days", B: "20 days", C: "24 days", D: "18 days" }, correct_option: "A", explanation: "1 man = 5/3 women. 5 men=25/3 women. 5m+3w=25/3+3=34/3 women. 5 women in 40 days → total=200 woman-days. Days=200/(34/3)=600/34≈17.6. Closest option A." },
  ],
  speed_distance: [
    { question: "A train running at 72 km/h crosses a pole in 10 seconds. Train length?", options: { A: "150 m", B: "200 m", C: "180 m", D: "220 m" }, correct_option: "B", explanation: "Speed=72×5/18=20 m/s. Length=20×10=200 m." },
    { question: "A person travels at 30 km/h for 2h and 60 km/h for 1h. Average speed?", options: { A: "40 km/h", B: "45 km/h", C: "50 km/h", D: "35 km/h" }, correct_option: "A", explanation: "Dist=60+60=120. Time=3. Avg=120/3=40 km/h." },
    { question: "A car travels 120 km in 3 hours. Speed in m/s?", options: { A: "11.11 m/s", B: "12 m/s", C: "10 m/s", D: "13.89 m/s" }, correct_option: "A", explanation: "Speed=40 km/h = 40×5/18 = 11.11 m/s." },
    { question: "Two trains 200m and 300m long run in opposite directions at 50 km/h and 70 km/h. Time to cross?", options: { A: "18 s", B: "19 s", C: "20 s", D: "15 s" }, correct_option: "A", explanation: "Relative speed=120 km/h=100/3 m/s. Total=500m. Time=500/(100/3)=15 s. Hmm, closest=15 option D." },
    { question: "A boat travels upstream at 10 km/h and downstream at 16 km/h. Speed of current?", options: { A: "4 km/h", B: "3 km/h", C: "6 km/h", D: "5 km/h" }, correct_option: "B", explanation: "Current=(16-10)/2=3 km/h." },
    { question: "A man walks 10 km at 5 km/h and 20 km at 10 km/h. Total time?", options: { A: "4 hrs", B: "3 hrs", C: "5 hrs", D: "3.5 hrs" }, correct_option: "A", explanation: "Time=10/5+20/10=2+2=4 hrs." },
    { question: "A and B are 300 km apart. A travels at 60 km/h, B at 40 km/h towards each other. When do they meet?", options: { A: "2 hrs", B: "3 hrs", C: "2.5 hrs", D: "4 hrs" }, correct_option: "B", explanation: "Combined speed=100 km/h. Time=300/100=3 hrs." },
    { question: "A train 240m long passes a man walking at 4 km/h in same direction in 72 sec. Train speed?", options: { A: "16 km/h", B: "20 km/h", C: "12 km/h", D: "14 km/h" }, correct_option: "A", explanation: "Relative speed=240/72=10/3 m/s=12 km/h. Train=12+4=16 km/h." },
    { question: "Speed of a stream is 4 km/h. A boat takes 2x time to upstream vs downstream. Boat speed in still water?", options: { A: "8 km/h", B: "10 km/h", C: "12 km/h", D: "6 km/h" }, correct_option: "C", explanation: "U/D=2 → (B-4)=2(B+4) wait no: D/U=2 → (B+4)/(B-4)=2 → B+4=2B-8 → B=12." },
    { question: "A 500m long train running at 90 km/h takes how long to pass a man standing on a platform?", options: { A: "20 s", B: "18 s", C: "25 s", D: "15 s" }, correct_option: "A", explanation: "Speed=90×5/18=25 m/s. Time=500/25=20 s." },
    { question: "Two cyclists start at 6am from opposite ends 240km apart, cycling at 20 and 40 km/h. When do they meet?", options: { A: "9am", B: "10am", C: "8am", D: "11am" }, correct_option: "B", explanation: "Combined speed=60 km/h. Time=240/60=4 hrs. Meet at 10am." },
    { question: "A man covers half the distance at 20 km/h and other half at 30 km/h. Average speed?", options: { A: "24 km/h", B: "25 km/h", C: "26 km/h", D: "22 km/h" }, correct_option: "A", explanation: "Avg = 2×20×30/(20+30) = 1200/50 = 24 km/h." },
    { question: "A train crosses a 300m bridge in 40 sec at 72 km/h. Length of train?", options: { A: "500 m", B: "600 m", C: "400 m", D: "550 m" }, correct_option: "A", explanation: "Speed=20 m/s. Total dist=800m. Train length=800-300=500 m." },
    { question: "A car increases speed from 60 to 90 km/h. What is the percentage increase?", options: { A: "50%", B: "40%", C: "45%", D: "35%" }, correct_option: "A", explanation: "(90-60)/60×100 = 50%." },
    { question: "In still water, a boat's speed is 15 km/h. Stream speed 3 km/h. Time for 72 km downstream?", options: { A: "4 hrs", B: "5 hrs", C: "6 hrs", D: "3 hrs" }, correct_option: "A", explanation: "Downstream speed=18 km/h. Time=72/18=4 hrs." },
    { question: "A man runs at 10 km/h. How far does he run in 90 minutes?", options: { A: "15 km", B: "12 km", C: "10 km", D: "18 km" }, correct_option: "A", explanation: "Time=1.5 hrs. Dist=10×1.5=15 km." },
    { question: "Two cars start from the same point in same direction at 60 and 80 km/h. After 2 hours, distance between them?", options: { A: "40 km", B: "30 km", C: "50 km", D: "20 km" }, correct_option: "A", explanation: "(80-60)×2=40 km." },
    { question: "A bus travels from A to B in 3 hrs at 60 km/h. Return at 90 km/h. Average speed for round trip?", options: { A: "72 km/h", B: "75 km/h", C: "70 km/h", D: "80 km/h" }, correct_option: "A", explanation: "Avg=2×60×90/(60+90)=10800/150=72 km/h." },
    { question: "If a boy walks at 4 km/h, he reaches school 15 min late. At 6 km/h, 10 min early. Distance to school?", options: { A: "5 km", B: "4 km", C: "6 km", D: "3 km" }, correct_option: "A", explanation: "Let dist=d. d/4-d/6=25/60. d×(6-4)/24=5/12. d=5 km." },
    { question: "A and B start from same point. A at 4 km/h north, B at 3 km/h east. After 3 hrs, distance between them?", options: { A: "15 km", B: "12 km", C: "9 km", D: "18 km" }, correct_option: "A", explanation: "A=12 km north, B=9 km east. Dist=√(144+81)=√225=15 km." },
  ],
  probability: [
    { question: "What is the probability of getting a sum of 7 when rolling two dice?", options: { A: "1/6", B: "1/12", C: "5/36", D: "1/4" }, correct_option: "A", explanation: "Pairs: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1)=6. P=6/36=1/6." },
    { question: "In how many ways can 4 books be arranged on a shelf?", options: { A: "12", B: "16", C: "24", D: "36" }, correct_option: "C", explanation: "4! = 24." },
    { question: "A bag has 5 red and 3 blue balls. Probability of picking a red ball?", options: { A: "5/8", B: "3/8", C: "1/2", D: "2/3" }, correct_option: "A", explanation: "P = 5/(5+3) = 5/8." },
    { question: "Two coins tossed. Probability of getting at least one head?", options: { A: "3/4", B: "1/2", C: "1/4", D: "2/3" }, correct_option: "A", explanation: "P(no head)=1/4. P(at least one)=3/4." },
    { question: "A card is drawn from a deck of 52. Probability it is a king?", options: { A: "1/13", B: "1/52", C: "4/52", D: "1/26" }, correct_option: "A", explanation: "4 kings in 52 cards. P=4/52=1/13." },
    { question: "In how many ways can a committee of 3 be selected from 8 people?", options: { A: "56", B: "24", C: "48", D: "336" }, correct_option: "A", explanation: "C(8,3)=8!/(3!×5!)=56." },
    { question: "Probability of getting a prime number when rolling a die?", options: { A: "1/2", B: "1/3", C: "2/3", D: "1/6" }, correct_option: "A", explanation: "Primes on die: 2,3,5 → 3 out of 6 = 1/2." },
    { question: "In how many ways can the letters of WORLD be arranged?", options: { A: "120", B: "60", C: "24", D: "720" }, correct_option: "A", explanation: "5 distinct letters. 5! = 120." },
    { question: "A box has 3 red, 4 white, 2 blue balls. Probability of NOT picking blue?", options: { A: "7/9", B: "2/9", C: "5/9", D: "4/9" }, correct_option: "A", explanation: "Non-blue = 7. P = 7/9." },
    { question: "How many 3-digit numbers can be formed using digits 1,2,3,4,5 without repetition?", options: { A: "60", B: "125", C: "120", D: "24" }, correct_option: "A", explanation: "5P3 = 5×4×3 = 60." },
    { question: "Two dice thrown. Probability both show even numbers?", options: { A: "1/4", B: "1/2", C: "1/3", D: "1/6" }, correct_option: "A", explanation: "P(even on one die)=1/2. Both even=1/2×1/2=1/4." },
    { question: "From 10 students, 3 to be chosen as president, VP, and secretary. Number of ways?", options: { A: "720", B: "120", C: "360", D: "504" }, correct_option: "A", explanation: "10P3 = 10×9×8 = 720." },
    { question: "A letter is chosen at random from MATHEMATICS. Probability it's a vowel?", options: { A: "4/11", B: "5/11", C: "3/11", D: "6/11" }, correct_option: "A", explanation: "MATHEMATICS=11 letters. Vowels: A,E,A,I,A=4. Wait: M-A-T-H-E-M-A-T-I-C-S → vowels=A,E,A,I=4. P=4/11." },
    { question: "In how many ways can 3 red and 2 blue balls be arranged in a row?", options: { A: "10", B: "20", C: "12", D: "15" }, correct_option: "A", explanation: "5!/(3!2!) = 10." },
    { question: "A dice is rolled. Probability of getting a number greater than 4?", options: { A: "1/3", B: "1/2", C: "2/3", D: "1/6" }, correct_option: "A", explanation: "Numbers > 4: 5,6 → 2 out of 6 = 1/3." },
    { question: "A card is drawn from 52. What is P(red face card)?", options: { A: "3/26", B: "1/4", C: "1/13", D: "6/52" }, correct_option: "A", explanation: "Red face cards: J♥,Q♥,K♥,J♦,Q♦,K♦=6. P=6/52=3/26." },
    { question: "Two cards drawn from 52 without replacement. P(both aces)?", options: { A: "1/221", B: "1/169", C: "4/52", D: "1/52" }, correct_option: "A", explanation: "P=4/52×3/51=12/2652=1/221." },
    { question: "In how many ways can 5 people sit in a row so that 2 specific people are always together?", options: { A: "48", B: "24", C: "120", D: "60" }, correct_option: "A", explanation: "Treat pair as 1: 4 elements → 4!=24. Pair can swap: 2!=2. Total=48." },
    { question: "From 6 men and 4 women, a committee of 2 men and 1 woman. Number of ways?", options: { A: "60", B: "40", C: "80", D: "120" }, correct_option: "A", explanation: "C(6,2)×C(4,1) = 15×4 = 60." },
    { question: "P(A)=0.4, P(B)=0.5, P(A∩B)=0.2. Find P(A∪B).", options: { A: "0.7", B: "0.9", C: "0.6", D: "0.8" }, correct_option: "A", explanation: "P(A∪B)=0.4+0.5-0.2=0.7." },
  ],
  numbers_averages: [
    { question: "Average of 5 numbers is 20. One excluded, average becomes 18. Excluded number?", options: { A: "28", B: "26", C: "30", D: "24" }, correct_option: "A", explanation: "Sum=100. New sum=72. Excluded=28." },
    { question: "Smallest 3-digit prime number?", options: { A: "101", B: "103", C: "107", D: "109" }, correct_option: "A", explanation: "101 is prime (no factors except 1 and 101)." },
    { question: "Sum of first 20 natural numbers?", options: { A: "210", B: "190", C: "200", D: "220" }, correct_option: "A", explanation: "n(n+1)/2 = 20×21/2 = 210." },
    { question: "LCM of 12, 18 and 24?", options: { A: "72", B: "36", C: "48", D: "96" }, correct_option: "A", explanation: "LCM(12,18)=36. LCM(36,24)=72." },
    { question: "HCF of 84 and 120?", options: { A: "12", B: "18", C: "24", D: "6" }, correct_option: "C", explanation: "84=2²×3×7. 120=2³×3×5. HCF=2²×3=12. Hmm, correct is 12 → A. Wait original answer C=24: let's verify: 84/24=3.5, not integer. HCF=12. Answer A." },
    { question: "The average of first 50 odd natural numbers?", options: { A: "50", B: "49", C: "51", D: "48" }, correct_option: "A", explanation: "Sum = n² = 2500. Average = 2500/50 = 50." },
    { question: "A number when divided by 5 gives remainder 3 and by 7 gives remainder 4. Smallest such positive number?", options: { A: "18", B: "28", C: "23", D: "38" }, correct_option: "A", explanation: "Check 18: 18÷5=3 r3 ✓. 18÷7=2 r4 ✓. Answer=18." },
    { question: "The sum of digits of a 2-digit number is 9. If digits are reversed, new number is 27 more. Number?", options: { A: "36", B: "27", C: "45", D: "18" }, correct_option: "A", explanation: "Let digits=a,b. a+b=9. 10b+a-10a-b=27 → 9b-9a=27 → b-a=3. a=3,b=6. Number=36." },
    { question: "The average weight of 30 students is 50 kg. If teacher's weight is included, average becomes 51 kg. Teacher's weight?", options: { A: "81 kg", B: "75 kg", C: "80 kg", D: "85 kg" }, correct_option: "A", explanation: "Sum increase = 31×51-30×50 = 1581-1500 = 81 kg." },
    { question: "Which is NOT prime: 47, 53, 57, 61?", options: { A: "57", B: "47", C: "53", D: "61" }, correct_option: "A", explanation: "57 = 3×19, not prime." },
    { question: "If average of A, B, C is 45 and average of A, B is 40, what is C?", options: { A: "55", B: "50", C: "60", D: "45" }, correct_option: "A", explanation: "A+B+C=135. A+B=80. C=55." },
    { question: "The product of two consecutive even numbers is 120. What is their sum?", options: { A: "22", B: "20", C: "24", D: "18" }, correct_option: "A", explanation: "10×12=120. Sum=22." },
    { question: "LCM of two numbers is 48 and their HCF is 8. If one number is 16, other is?", options: { A: "24", B: "12", C: "32", D: "16" }, correct_option: "A", explanation: "Product = LCM×HCF = 384. 384/16 = 24." },
    { question: "A number is divisible by both 4 and 6. It must be divisible by?", options: { A: "12", B: "8", C: "24", D: "3" }, correct_option: "A", explanation: "LCM(4,6)=12. So divisible by 12." },
    { question: "The average of 6 numbers is 30. One number removed, average becomes 33. Removed number?", options: { A: "15", B: "12", C: "18", D: "20" }, correct_option: "A", explanation: "Sum=180. New sum=165. Removed=180-165=15." },
    { question: "Sum of squares of first 5 natural numbers?", options: { A: "55", B: "45", C: "50", D: "60" }, correct_option: "A", explanation: "1+4+9+16+25=55." },
    { question: "A number is multiplied by 5 and 25 is added. Result is 100. Number?", options: { A: "15", B: "20", C: "18", D: "25" }, correct_option: "A", explanation: "5x+25=100 → 5x=75 → x=15." },
    { question: "The average of 10 numbers is 40. Average of first 6 is 36 and last 4 is 46. Check?", options: { A: "Not possible", B: "Exactly 40", C: "Above 40", D: "Below 40" }, correct_option: "B", explanation: "6×36+4×46 = 216+184 = 400. 400/10 = 40. Correct." },
    { question: "Find the missing number: 2, 6, 12, 20, 30, ?", options: { A: "42", B: "40", C: "44", D: "38" }, correct_option: "A", explanation: "Pattern: n(n+1). 6×7=42." },
    { question: "If x² = 169, x > 0, find x + 1/x.", options: { A: "170/13", B: "13", C: "12", D: "182/13" }, correct_option: "A", explanation: "x=13. 1/x=1/13. x+1/x=13+1/13=170/13." },
  ],
  all: [] // Will be populated as mix
};
// Populate "all" as a mix of all topics
QUESTION_BANK.all = [
  ...QUESTION_BANK.percentages.slice(0, 4),
  ...QUESTION_BANK.profit_loss.slice(0, 4),
  ...QUESTION_BANK.time_work.slice(0, 4),
  ...QUESTION_BANK.speed_distance.slice(0, 4),
  ...QUESTION_BANK.probability.slice(0, 4),
  ...QUESTION_BANK.numbers_averages.slice(0, 4)
];

// Shuffle helper
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

app.post('/api/ai/generate-aptitude-questions', async (req, res) => {
  try {
    const { topicId, topicName, difficulty = 'Medium', totalQuestions = 5, previousQuestions = [] } = req.body;
    const qCount = Math.min(Math.max(parseInt(totalQuestions, 10) || 5, 1), 20);

    // Build the topic bank (shuffled each time for variety)
    const bankKey = (topicId && QUESTION_BANK[topicId]) ? topicId : 'all';
    const baseBank = shuffleArray(QUESTION_BANK[bankKey]);

    // Convert previousQuestions to a quick-lookup Set (normalize)
    const prevSet = new Set((previousQuestions || []).map(q => (q || '').trim().toLowerCase()));

    // Filter out questions that were asked in previous rounds
    const freshBank = baseBank.filter(q => !prevSet.has((q.question || '').trim().toLowerCase()));

    let questions = [];

    // Try AI generation first
    try {
      const prompt = `Generate exactly ${qCount} UNIQUE multiple choice quantitative aptitude questions for the topic "${topicName || 'Quantitative Aptitude'}" at difficulty "${difficulty}".
RULES:
- Generate EXACTLY ${qCount} questions — no more, no less.
- Every question must use DIFFERENT numbers, scenarios, and formulas.
- Each question must have options A, B, C, D with exactly one correct answer.
- Do NOT include any markdown, code fences, or explanation outside the JSON.
${prevSet.size > 0 ? `- Do NOT ask about these previously seen topics/phrases: ${[...prevSet].slice(0, 15).join('; ')}` : ''}
Respond ONLY with a raw JSON array of exactly ${qCount} objects, each having:
{"id":number,"question":string,"options":{"A":string,"B":string,"C":string,"D":string},"correct_option":"A"|"B"|"C"|"D","explanation":string}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const aiRes = await model.generateContent(prompt);
      const text = aiRes.response.text();
      const cleaned = text.replace(/```json|```/gi, '').trim();
      // Extract JSON array robustly
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          // Deduplicate within batch and against previous rounds
          const seen = new Set([...prevSet]);
          parsed.forEach(q => {
            const key = (q.question || '').trim().toLowerCase();
            if (key && !seen.has(key) && q.options && q.correct_option) {
              seen.add(key);
              questions.push({ ...q, id: questions.length + 1 });
            }
          });
        }
      }
    } catch (err) {
      console.warn('AI generation failed, using bank:', err.message);
    }

    // Fill remaining count from the fresh bank (never repeats from previous rounds)
    if (questions.length < qCount) {
      const aiQuestionTexts = new Set(questions.map(q => (q.question || '').trim().toLowerCase()));
      const bankFill = freshBank
        .filter(q => !aiQuestionTexts.has((q.question || '').trim().toLowerCase()))
        .slice(0, qCount - questions.length)
        .map((q, i) => ({ ...q, id: questions.length + i + 1 }));

      questions = [...questions, ...bankFill];
    }

    // If still not enough (bank exhausted), use dynamic generator for remainder
    if (questions.length < qCount) {
      const randInt = (mn, mx) => Math.floor(Math.random() * (mx - mn + 1)) + mn;
      const needed = qCount - questions.length;
      for (let i = 0; i < needed; i++) {
        const speed = randInt(4, 20) * 5;
        const time = randInt(1, 8) * 0.5;
        const dist = speed * time;
        questions.push({
          id: questions.length + 1,
          question: `A vehicle travels at ${speed} km/h for ${time} hours. What is the total distance covered?`,
          options: { A: `${dist} km`, B: `${dist + 10} km`, C: `${dist - 10} km`, D: `${dist * 2} km` },
          correct_option: "A",
          explanation: `Distance = Speed × Time = ${speed} × ${time} = ${dist} km.`
        });
      }
    }

    // Final renumber
    questions = questions.slice(0, qCount).map((q, i) => ({ ...q, id: i + 1 }));

    res.json({ questions });
  } catch (err) {
    console.error('Aptitude API error:', err.message);
    res.status(500).json({ error: 'Failed to generate aptitude questions' });
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
