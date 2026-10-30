import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Clock, ArrowRight, RotateCcw, Award,
  CheckCircle2, Mic, SkipForward, Play, RefreshCw,
  AlertCircle, FileText, Check, Layers, UserCheck, Square, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, Badge, ScoreRing, ProgressBar } from '../../components/ui';
import { cn, formatDuration } from '../../lib/utils';
import { useSpeechRecognition } from '../../lib/useSpeechRecognition';
import { speakText, stopSpeaking } from '../../lib/speech';
import { getFallbackQuestion, getActualAnswerForQuestion } from '../../lib/mockQuestionBank';

export default function MockInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // ─── localStorage helpers for cross-session question deduplication ─────────
  const loadAskedQuestions = (skillKey) => {
    try {
      const stored = localStorage.getItem(`mock_asked_${skillKey.toLowerCase().trim()}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveAskedQuestions = (skillKey, newQuestions) => {
    try {
      const existing = loadAskedQuestions(skillKey);
      // Keep last 30 unique questions per skill — allows natural recycling after ~5-8 sessions
      const merged = [...new Set([...existing, ...newQuestions])].slice(-30);
      localStorage.setItem(`mock_asked_${skillKey.toLowerCase().trim()}`, JSON.stringify(merged));
    } catch { /* ignore storage errors */ }
  };

  // ─── Setup Form State ────────────────────────────────────────────────────────
  const [role, setRole] = useState('');
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');

  // ─── Interview Active State ─────────────────────────────────────────────────
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'loading' | 'completed'
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentFocusConcept, setCurrentFocusConcept] = useState('');
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Recorded history for the session
  const [questionsList, setQuestionsList] = useState([]);
  const [answersList, setAnswersList] = useState([]);
  const [evaluationsList, setEvaluationsList] = useState([]);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Speech Recognition hook
  const {
    state: speechState,
    transcript,
    error: speechError,
    start: startListening,
    stop: stopListening,
    reset: resetSpeech
  } = useSpeechRecognition();

  const isRecording = speechState === 'listening' || speechState === 'recording_fallback';

  // ─── Recording Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRecording) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
      const t = setInterval(() => setRecordingTime((s) => s + 1), 1000);
      return () => clearInterval(t);
    } else {
      setRecordingTime(0);
    }
  }, [isRecording]);

  // ─── Auto-fill answer from live transcript ──────────────────────────────────
  useEffect(() => {
    if (transcript) {
      setCurrentAnswerText(transcript);
    }
  }, [transcript]);

  // ─── Auto-read question aloud when it appears ───────────────────────────────
  const speakQuestionVoice = useCallback((text) => {
    if (!text) return;
    stopSpeaking();
    setIsSpeakingQuestion(true);
    speakText(text, {
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => setIsSpeakingQuestion(false),
      onError: () => setIsSpeakingQuestion(false)
    }).catch(() => setIsSpeakingQuestion(false));
  }, []);

  useEffect(() => {
    if (stage === 'interview' && currentQuestionText) {
      speakQuestionVoice(currentQuestionText);
    }
    return () => { stopSpeaking(); };
  }, [stage, currentQuestionText, speakQuestionVoice]);

  // ─── Timer Controller ───────────────────────────────────────────────────────
  useEffect(() => {
    if (stage === 'interview' || stage === 'loading') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Helper with Timeout to prevent stuck loading loop
  const fetchWithTimeout = (apiPromise, timeoutMs = 8000) => {
    return Promise.race([
      apiPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs)
      )
    ]);
  };

  // ─── 1. Start Interview Flow ────────────────────────────────────────────────
  const handleStartInterview = async () => {
    if (!role.trim()) { toast.error('Please enter your Preferred Role.'); return; }
    if (!skill.trim()) { toast.error('Please enter your Primary Skill / Technology.'); return; }
    if (!difficulty) { toast.error('Please select a Difficulty Level.'); return; }
    const qCount = parseInt(totalQuestions, 10);
    if (isNaN(qCount) || qCount < 1 || qCount > 15) {
      toast.error('Please select Number of Questions (between 1 and 15).');
      return;
    }

    setTotalQuestions(qCount);
    setElapsedSeconds(0);
    setQuestionsList([]);
    setAnswersList([]);
    setEvaluationsList([]);
    setCurrentQuestionNum(1);
    setCurrentAnswerText('');
    resetSpeech();

    setStage('loading');
    setLoadingMsg(`AI is preparing a ${difficulty}-level question on ${skill.trim()}...`);

    // Load cross-session history for this skill
    const crossSessionHistory = loadAskedQuestions(skill.trim());

    let questionSuccess = false;

    try {
      const res = await fetchWithTimeout(
        api.generateNextQuestion({
          role: role.trim(),
          skill: skill.trim(),
          difficulty,
          totalQuestions: qCount,
          currentQuestion: 1,
          previousQuestions: [],
          previousAnswers: [],
          allPreviousQuestions: crossSessionHistory
        }),
        35000
      );

      if (res && res.result && res.result.question) {
        setCurrentQuestionText(res.result.question);
        setCurrentFocusConcept(res.result.focus_concept || `${skill.trim()} (${difficulty})`);
        setQuestionsList([res.result.question]);
        questionSuccess = true;
      }
    } catch (err) {
      console.warn('AI start interview error/timeout, using fallback:', err.message);
    }

    if (!questionSuccess) {
      const fallbackQ = getFallbackQuestion(skill.trim(), role.trim(), difficulty, [], 0);
      setCurrentQuestionText(fallbackQ);
      setCurrentFocusConcept(`${skill.trim()} (${difficulty})`);
      setQuestionsList([fallbackQ]);
    }

    setStage('interview');
    toast.success(`Mock Interview Started! Focus: ${skill.trim()} (${difficulty})`);
  };

  // Helper to detect non-answers
  const isNonAnswer = (text) => {
    if (!text || typeof text !== 'string') return true;
    const clean = text.trim().toLowerCase();
    if (!clean || clean === '(skipped by user)' || clean === '(no response)') return true;
    const nonAnswerRegex = /\b(i\s*don'?t\s*know|don'?t\s*know|dont\s*know|no\s*idea|dunno|not\s*sure|idk|i\s*do\s*not\s*know|have\s*no\s*idea|cannot\s*answer|can'?t\s*answer|no\s*answer|skip|blank|nothing|n\/a|na|i\s*dont\s*remember|dont\s*remember)\b/i;
    if (nonAnswerRegex.test(clean)) return true;
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length < 3 && clean.length < 15) return true;
    return false;
  };

  // ─── 2. Process Answer & Move to Next Question ─────────────────────────────
  const processAnswerSubmission = async (answerToSubmit, isSkipped = false) => {
    if (speechState === 'listening') { stopListening(); }

    const finalAnswer = isSkipped ? '(Skipped by user)' : answerToSubmit.trim();

    if (!isSkipped && !finalAnswer) {
      toast.error('Please speak or type your answer before submitting, or click Skip.');
      return;
    }

    const newAnswers = [...answersList, finalAnswer];
    setAnswersList(newAnswers);
    setCurrentAnswerText('');
    resetSpeech();
    stopSpeaking();

    const candidateIsNonAnswer = isSkipped || isNonAnswer(finalAnswer);

    if (currentQuestionNum >= totalQuestions) {
      setStage('loading');
      setLoadingMsg('AI is calculating final interview evaluations...');

      const fallbackActual = getActualAnswerForQuestion(currentQuestionText, skill.trim(), difficulty, role.trim());
      let finalEval = {
        score: candidateIsNonAnswer ? 0 : 35,
        verdict: candidateIsNonAnswer ? 'Needs Improvement' : 'Evaluated',
        actual_answer: fallbackActual
      };

      try {
        const evalRes = await fetchWithTimeout(
          api.evaluateInterviewWithAI({ question: currentQuestionText, answer: finalAnswer, topic: skill, difficulty }),
          35000
        );
        if (evalRes?.evaluation) {
          const evalActual = evalRes.evaluation.actual_answer || evalRes.evaluation.improved_sample_answer;
          const hasReal = evalActual && !evalActual.toLowerCase().includes('an ideal answer');
          finalEval = {
            score: candidateIsNonAnswer ? 0 : (evalRes.evaluation.score ?? 0),
            verdict: candidateIsNonAnswer ? 'Needs Improvement' : (evalRes.evaluation.verdict || 'Evaluated'),
            actual_answer: hasReal ? evalActual : fallbackActual
          };
        }
      } catch (err) { console.warn('Final question evaluation timeout fallback:', err.message); }

      const updatedEvals = [...evaluationsList, finalEval];
      setEvaluationsList(updatedEvals);
      await finishAndSaveSession(questionsList, newAnswers, updatedEvals);
      return;
    }

    setStage('loading');
    setLoadingMsg(`AI is evaluating your answer and preparing Question ${currentQuestionNum + 1} on ${skill.trim()} (${difficulty})...`);

    let nextQText = '';
    let nextFocus = `${skill.trim()} (${difficulty})`;
    const fallbackActual = getActualAnswerForQuestion(currentQuestionText, skill.trim(), difficulty, role.trim());
    let prevEval = {
      score: candidateIsNonAnswer ? 0 : 35,
      verdict: candidateIsNonAnswer ? 'Needs Improvement' : 'Evaluated',
      actual_answer: fallbackActual
    };

    try {
      const res = await fetchWithTimeout(
        api.generateNextQuestion({
          role: role.trim(),
          skill: skill.trim(),
          difficulty,
          totalQuestions,
          currentQuestion: currentQuestionNum + 1,
          previousQuestions: questionsList,
          previousAnswers: newAnswers,
          allPreviousQuestions: loadAskedQuestions(skill.trim())
        }),
        35000
      );

      if (res && res.result && res.result.question) {
        nextQText = res.result.question;
        nextFocus = res.result.focus_concept || `${skill.trim()} (${difficulty})`;
        if (res.result.evaluation_of_previous) {
          const evalPrev = res.result.evaluation_of_previous;
          const evalActual = evalPrev.actual_answer || evalPrev.feedback;
          const hasReal = evalActual && !evalActual.toLowerCase().includes('an ideal answer');
          prevEval = {
            score: candidateIsNonAnswer ? 0 : (evalPrev.score ?? 0),
            verdict: candidateIsNonAnswer ? 'Needs Improvement' : (evalPrev.verdict || 'Evaluated'),
            actual_answer: hasReal ? evalActual : fallbackActual
          };
        }
      }
    } catch (err) { console.warn('Next question fetch timeout/error, using fallback:', err.message); }

    if (!nextQText) {
      nextQText = getFallbackQuestion(skill.trim(), role.trim(), difficulty, questionsList, currentQuestionNum);
    }

    const newEvals = [...evaluationsList, prevEval];
    setEvaluationsList(newEvals);

    const newQuestions = [...questionsList, nextQText];
    setQuestionsList(newQuestions);
    setCurrentQuestionText(nextQText);
    setCurrentFocusConcept(nextFocus);
    setCurrentQuestionNum((prev) => prev + 1);
    setStage('interview');
  };

  // ─── 3. Finish & Save Session ─────────────────────────────────────────────
  const finishAndSaveSession = async (finalQuestions, finalAnswers, finalEvals) => {
    const validScores = finalEvals.map(e => Number(e.score)).filter(s => !isNaN(s) && s !== null);
    const avgScore = validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    const formattedQAs = finalQuestions.map((qText, idx) => ({
      id: `q-${idx + 1}`,
      question: qText,
      answer: finalAnswers[idx] || '(No response)',
      score: finalEvals[idx]?.score ?? 0,
      verdict: finalEvals[idx]?.verdict || 'Completed',
      actual_answer: finalEvals[idx]?.actual_answer || '',
      feedback: finalEvals[idx]?.actual_answer || 'Evaluation completed.'
    }));

    // Save all answered questions to localStorage for future session deduplication
    saveAskedQuestions(skill.trim(), finalQuestions);

    if (user) {
      try {
        const payload = {
          user_id: user.id,
          type: 'mock',
          role: role.trim(),
          skill: skill.trim(),
          topic: skill.trim(),
          difficulty: difficulty || 'Medium',
          numberOfQuestions: totalQuestions,
          score: avgScore,
          duration_seconds: elapsedSeconds,
          questions: formattedQAs,
          answers: finalAnswers,
          evaluations: finalEvals,
          feedback: { summary: `Interview completed for ${skill} (${difficulty})`, avg_score: avgScore },
          status: 'completed'
        };
        const res = await api.createSession(payload);
        if (!res.error) { await refreshProfile(); }
      } catch (err) { console.error('Failed to save session:', err); }
    }

    setStage('completed');
  };

  // ─── RENDER: 1. SETUP STAGE ─────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-violet-600" />
            AI Mock Interview Setup
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Configure your technical interview. Advanced AI generates adaptive, unique questions every session.
          </p>
        </div>

        {/* Config Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Preferred Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-violet-600" />
                Preferred Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Backend Engineer..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-900 transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">Role provides domain context for scenario-based questions.</p>
            </div>

            {/* Primary Skill */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-violet-600" />
                Primary Skill / Technology <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. System Design, React, Python..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-900 font-medium transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">All questions will test technical depth in this skill.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-semibold transition border text-center',
                      difficulty === d
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Number of Questions (1-15) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={15}
                placeholder="Enter number (e.g. 5)"
                value={totalQuestions}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') { setTotalQuestions(''); }
                  else {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) setTotalQuestions(Math.max(1, Math.min(15, parsed)));
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm font-semibold text-gray-900 transition"
              />
            </div>
          </div>

          {/* Quick Select Presets */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Select Role:</p>
              <div className="flex flex-wrap gap-2">
                {['Full Stack Developer', 'Frontend Engineer', 'Backend Developer', 'Data Scientist', 'DevOps Lead', 'Mobile App Developer'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition border',
                      role === r
                        ? 'bg-violet-100 text-violet-800 border-violet-300 font-bold dark:bg-violet-900/50 dark:text-violet-200 dark:border-violet-500'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-ink-800 dark:text-gray-300 dark:border-ink-700 dark:hover:bg-ink-700'
                    )}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Select Skill:</p>
              <div className="flex flex-wrap gap-2">
                {['System Design', 'React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Data Structures', 'Docker', 'Machine Learning'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkill(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition border',
                      skill.toLowerCase() === s.toLowerCase()
                        ? 'bg-violet-100 text-violet-800 border-violet-300 font-bold dark:bg-violet-900/50 dark:text-violet-200 dark:border-violet-500'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-ink-800 dark:text-gray-300 dark:border-ink-700 dark:hover:bg-ink-700'
                    )}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Start CTA */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-violet-600" />
            <span>{totalQuestions ? `${totalQuestions} Questions` : 'Select parameters'} • Adaptive AI Interview</span>
          </div>
          <Button
            size="lg"
            onClick={handleStartInterview}
            className="bg-violet-600 hover:bg-violet-700 text-white px-7 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-violet-600/20"
          >
            <Play className="w-4 h-4" />
            <span>Start Mock Interview</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─── RENDER: 2. LOADING STATE ───────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-violet-100 text-violet-600 shadow-inner">
          <RefreshCw className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-gray-900">Generating Dynamic Question</h2>
          <p className="text-violet-700 font-medium text-sm">{loadingMsg}</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            AI is tailoring unique technical questions for <strong>{skill}</strong> ({role || 'General'}).
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: 3. ACTIVE INTERVIEW STAGE (HR-style) ──────────────────────────
  if (stage === 'interview') {
    const progress = (currentQuestionNum / totalQuestions) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Progress & Info Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900">
                  Question {currentQuestionNum} of {totalQuestions}
                </span>
                <Badge color="brand">{difficulty}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Skill: <strong className="text-violet-700">{skill}</strong> {role ? `• Role: ${role}` : ''}
              </p>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>
          </div>
          <ProgressBar value={progress} color="brand" />
        </div>

        {/* AI Question Card (HR-style with speaking avatar & replay button) */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm border-l-4 border-l-violet-600">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all',
                  isSpeakingQuestion ? 'bg-violet-500 animate-bounce shadow-lg shadow-violet-200' : 'bg-violet-600 shadow-sm'
                )}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                    AI Technical Interviewer
                  </p>
                  {isSpeakingQuestion && (
                    <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Speaking...
                    </span>
                  )}
                  {currentFocusConcept && (
                    <span className="text-xs bg-violet-50 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-md font-medium ml-auto">
                      {currentFocusConcept}
                    </span>
                  )}
                </div>
                <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed">
                  {currentQuestionText}
                </p>
              </div>
            </div>
            {/* Replay voice button */}
            <button
              type="button"
              onClick={() => speakQuestionVoice(currentQuestionText)}
              className="p-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 transition flex-shrink-0"
              title="Replay question voice"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </Card>

        {/* Answer Card — HR-style centered mic + waveform */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5">
          {/* Large Centered Mic Button */}
          <div className="flex flex-col items-center justify-center py-4 border-b border-gray-100">
            <button
              type="button"
              onClick={isRecording ? stopListening : startListening}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg',
                isRecording
                  ? 'bg-red-500 animate-pulse scale-110 shadow-red-200'
                  : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20 hover:scale-105'
              )}
            >
              {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </button>

            <p className="mt-3 text-sm font-semibold text-gray-800">
              {isRecording
                ? `Recording Voice… ${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, '0')}`
                : 'Click microphone to speak your answer'}
            </p>

            {/* Audio Waveform Visualizer */}
            {isRecording && (
              <div className="flex items-center gap-1 mt-3">
                {[40, 70, 30, 90, 50, 80, 40, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDuration: `${0.4 + (i % 4) * 0.2}s` }}
                  />
                ))}
              </div>
            )}

            {speechError && (
              <div className="mt-3 flex items-start gap-2 max-w-md p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>{speechError}</span>
              </div>
            )}
          </div>

          {/* Editable Transcript Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-violet-600" />
                <span>Spoken Response & Editable Text</span>
              </label>
              <span className="text-xs text-gray-400">
                {currentAnswerText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={currentAnswerText}
              onChange={(e) => setCurrentAnswerText(e.target.value)}
              rows={5}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-900 leading-relaxed transition resize-none"
              placeholder="Your voice response will auto-fill here. You can also type or edit your answer..."
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              {currentAnswerText.trim().split(/\s+/).filter(Boolean).length} words written
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={() => processAnswerSubmission('', true)}
                className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Question</span>
              </Button>
              <Button
                type="button"
                onClick={() => processAnswerSubmission(currentAnswerText, false)}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold px-5 flex items-center gap-2 shadow-sm"
              >
                {currentQuestionNum < totalQuestions ? (
                  <><span>Submit & Next</span><ArrowRight className="w-4 h-4" /></>
                ) : (
                  <><span>Complete Interview</span><Check className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── RENDER: 4. COMPLETED STAGE ─────────────────────────────────────────────
  const validScores = evaluationsList.map(e => Number(e.score)).filter(s => !isNaN(s) && s !== null);
  const finalAvgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 mb-1 shadow-sm">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">Interview Completed!</h1>
        <p className="text-gray-500 text-sm">Your session data and evaluation scores have been saved to your account.</p>
      </div>

      {/* Score Summary Card */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-4">
        <ScoreRing score={finalAvgScore} size={130} />
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">
            {finalAvgScore >= 75 ? 'Outstanding performance!' : finalAvgScore >= 50 ? 'Good effort! Keep practicing to strengthen key concepts.' : 'Keep practicing! Review the actual answers below to improve.'}
          </p>
          <p className="text-xs text-gray-500">
            Skill: <strong>{skill}</strong> • Difficulty: <strong>{difficulty}</strong> • {totalQuestions} Questions • Duration: {formatDuration(elapsedSeconds)}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => { stopSpeaking(); setStage('setup'); }}
            className="rounded-xl border-gray-200 text-gray-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Interview</span>
          </Button>
          <Button
            onClick={() => navigate('/app/history')}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>View All History</span>
          </Button>
        </div>
      </Card>

      {/* Q&A Breakdown */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900">Question & Answer Breakdown</h2>
        {questionsList.map((qText, idx) => {
          const ansText = answersList[idx] || '(No response)';
          const evalObj = evaluationsList[idx] || {};
          const score = evalObj.score !== undefined && evalObj.score !== null ? Number(evalObj.score) : 0;
          const actualAnswerText = evalObj.actual_answer || evalObj.feedback || '';

          return (
            <Card key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{qText}</p>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold flex-shrink-0',
                  score >= 70 ? 'bg-violet-100 text-violet-800' : score >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                )}>
                  {score}% {evalObj.verdict ? `(${evalObj.verdict})` : ''}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Your Answer</p>
                <p className="text-sm text-gray-800 leading-relaxed">{ansText}</p>
              </div>

              {actualAnswerText && (
                <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5 text-blue-950 dark:text-blue-100">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Actual Answer / Solution
                  </p>
                  <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">{actualAnswerText}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
