import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Clock, ArrowRight, RotateCcw, Sparkles, Award,
  CheckCircle2, Mic, MicOff, SkipForward, Play, RefreshCw,
  AlertCircle, ChevronRight, FileText, Check, Layers, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, Badge, ScoreRing, ProgressBar } from '../../components/ui';
import { cn, formatDuration } from '../../lib/utils';
import { useSpeechRecognition } from '../../lib/useSpeechRecognition';

export default function MockInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // ─── Setup Form State (Empty by default per user requirement) ────────────────
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
    // Required Validation: User MUST fill/select all 4 inputs
    if (!role.trim()) {
      toast.error('Please enter your Preferred Role.');
      return;
    }
    if (!skill.trim()) {
      toast.error('Please enter your Primary Skill / Technology.');
      return;
    }
    if (!difficulty) {
      toast.error('Please select a Difficulty Level (Easy, Medium, or Hard).');
      return;
    }
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
    setLoadingMsg(`AI Interviewer is preparing Question 1 for ${skill}...`);

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
          previousAnswers: []
        }),
        9000
      );

      if (res && res.result && res.result.question) {
        setCurrentQuestionText(res.result.question);
        setCurrentFocusConcept(res.result.focus_concept || skill.trim());
        setQuestionsList([res.result.question]);
        questionSuccess = true;
      }
    } catch (err) {
      console.warn('AI start interview error/timeout, using fallback:', err.message);
    }

    // Safety Fallback if API fails or times out (Prevents stuck loading loop!)
    if (!questionSuccess) {
      const fallbackQ = `Explain the core principles and component lifecycle in ${skill.trim()}, and how you apply them as a ${role.trim()}.`;
      setCurrentQuestionText(fallbackQ);
      setCurrentFocusConcept(`${skill.trim()} Fundamentals`);
      setQuestionsList([fallbackQ]);
    }

    setStage('interview');
    toast.success(`Mock Interview Started! Focus: ${skill.trim()}`);
  };

  // Helper to detect non-answers / "I don't know" / empty answers
  const isNonAnswer = (text) => {
    if (!text || typeof text !== 'string') return true;
    const clean = text.trim().toLowerCase();
    if (!clean || clean === '(skipped by user)' || clean === '(no response)') return true;
    const nonAnswerRegex = /\b(i\s*don'?t\s*know|don'?t\s*know|dont\s*know|no\s*idea|dunno|not\s*sure|idk|i\s*do\s*not\s*know|have\s*no\s*idea|cannot\s*answer|can'?t\s*answer|no\s*answer|skip|blank|nothing|n\/a|na|i\s*dont\s*remember|dont\s*remember|i\s*don\s*tknow|don\s*tknow)\b/i;
    if (nonAnswerRegex.test(clean)) return true;
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length < 3 && clean.length < 15) return true;
    return false;
  };

  // ─── 2. Process Answer & Move to Next Question ─────────────────────────────
  const processAnswerSubmission = async (answerToSubmit, isSkipped = false) => {
    if (speechState === 'listening') {
      stopListening();
    }

    const finalAnswer = isSkipped ? '(Skipped by user)' : answerToSubmit.trim();

    if (!isSkipped && !finalAnswer) {
      toast.error('Please write or speak an answer before submitting, or click Skip.');
      return;
    }

    const newAnswers = [...answersList, finalAnswer];
    setAnswersList(newAnswers);
    setCurrentAnswerText('');
    resetSpeech();

    const candidateIsNonAnswer = isSkipped || isNonAnswer(finalAnswer);

    // Check if interview completed
    if (currentQuestionNum >= totalQuestions) {
      setStage('loading');
      setLoadingMsg('AI is calculating final interview evaluations...');

      let finalEval = {
        score: candidateIsNonAnswer ? 0 : 35,
        verdict: candidateIsNonAnswer ? 'Needs Improvement' : 'Evaluated',
        actual_answer: `For "${currentQuestionText}", an ideal answer covers the fundamental mechanisms, component architecture, error handling strategies, and production performance trade-offs in ${skill.trim()}.`
      };

      try {
        const evalRes = await fetchWithTimeout(
          api.evaluateInterviewWithAI({
            question: currentQuestionText,
            answer: finalAnswer,
            topic: skill,
            difficulty
          }),
          12000
        );

        if (evalRes?.evaluation) {
          finalEval = {
            score: candidateIsNonAnswer ? 0 : (evalRes.evaluation.score ?? 0),
            verdict: candidateIsNonAnswer ? 'Needs Improvement' : (evalRes.evaluation.verdict || 'Evaluated'),
            actual_answer: evalRes.evaluation.actual_answer || evalRes.evaluation.improved_sample_answer || evalRes.evaluation.feedback_notes || finalEval.actual_answer
          };
        }
      } catch (err) {
        console.warn('Final question evaluation timeout fallback:', err.message);
      }

      const updatedEvals = [...evaluationsList, finalEval];
      setEvaluationsList(updatedEvals);
      await finishAndSaveSession(questionsList, newAnswers, updatedEvals);
      return;
    }

    // Move to Next Question
    setStage('loading');
    setLoadingMsg(`AI is evaluating answer and preparing Question ${currentQuestionNum + 1}...`);

    let nextQText = '';
    let nextFocus = skill.trim();
    let prevEval = {
      score: candidateIsNonAnswer ? 0 : 35,
      verdict: candidateIsNonAnswer ? 'Needs Improvement' : 'Evaluated',
      actual_answer: `For "${currentQuestionText}", an ideal answer covers the fundamental mechanisms, component architecture, error handling strategies, and production performance trade-offs in ${skill.trim()}.`
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
          previousAnswers: newAnswers
        }),
        12000
      );

      if (res && res.result && res.result.question) {
        nextQText = res.result.question;
        nextFocus = res.result.focus_concept || skill.trim();
        if (res.result.evaluation_of_previous) {
          const evalPrev = res.result.evaluation_of_previous;
          prevEval = {
            score: candidateIsNonAnswer ? 0 : (evalPrev.score ?? 0),
            verdict: candidateIsNonAnswer ? 'Needs Improvement' : (evalPrev.verdict || 'Evaluated'),
            actual_answer: evalPrev.actual_answer || evalPrev.feedback || prevEval.actual_answer
          };
        }
      }
    } catch (err) {
      console.warn('Next question fetch timeout/error, using fallback:', err.message);
    }

    // Safety Fallback for next question
    if (!nextQText) {
      const fallbackQuestions = [
        `What are common performance bottlenecks when working with ${skill.trim()}, and how do you resolve them in ${role.trim()} projects?`,
        `How do you implement error handling, state management, or asynchronous tasks in ${skill.trim()}?`,
        `Describe how you test and maintain code quality when building applications with ${skill.trim()}.`
      ];
      nextQText = fallbackQuestions[currentQuestionNum % fallbackQuestions.length];
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

  // ─── 3. Finish & Save Session to Backend DB ──────────────────────────────────
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
        if (!res.error) {
          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }

    setStage('completed');
  };

  // Voice transcript helpers
  const handleApplySpeechTranscript = (replace = false) => {
    if (!transcript) return;
    if (replace) {
      setCurrentAnswerText(transcript);
    } else {
      setCurrentAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
    resetSpeech();
    toast.success('Speech inserted into answer box!');
  };

  // ─── RENDER: 1. SETUP STAGE ─────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-emerald-600" />
            AI Mock Interview Setup
          </h1>
        </div>

        {/* Priority Rule Alert */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5 text-sm text-emerald-900 shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-950">Primary Skill Focus Rule</p>
            <p className="text-emerald-800 text-xs mt-0.5 leading-relaxed">
              <strong>Skill / Technology</strong> is the main interview focus. <strong>Preferred Role</strong> provides secondary domain context. All fields below are required.
            </p>
          </div>
        </div>

        {/* Form Inputs Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Preferred Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Preferred Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Select or type role (e.g. Full Stack Developer)..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">Role context for scenario-based questions.</p>
            </div>

            {/* Skill / Technology */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Primary Skill / Technology <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Select or type skill (e.g. React, Node.js, Python)..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 font-medium transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">Questions will test technical depth in this skill.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            {/* Difficulty Level */}
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
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {!difficulty && (
                <p className="text-[11px] text-amber-600 mt-1">Please select difficulty level.</p>
              )}
            </div>

            {/* Number of Questions (Max 15) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Number of Questions (1-15) <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="number"
                  min={1}
                  max={15}
                  placeholder="Enter number (e.g. 5)"
                  value={totalQuestions}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setTotalQuestions('');
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setTotalQuestions(Math.max(1, Math.min(15, parsed)));
                      }
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-semibold text-gray-900 transition"
                />
              </div>
            </div>
          </div>

          {/* Quick Select Presets */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quick Select Role:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Full Stack Developer', 'Frontend Engineer', 'Backend Developer', 'Data Scientist', 'DevOps Lead', 'Mobile App Developer'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition border',
                      role === r
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quick Select Skill:
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Data Structures', 'System Design', 'Docker', 'Machine Learning'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkill(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition border',
                      skill.toLowerCase() === s.toLowerCase()
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Start CTA */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{totalQuestions ? `${totalQuestions} Questions` : 'Select parameters'} • Adaptive AI Interview</span>
          </div>
          <Button
            size="lg"
            onClick={handleStartInterview}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Play className="w-4 h-4" />
            <span>Start Mock Interview</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─── RENDER: 2. LOADING STATE ──────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
          <RefreshCw className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-gray-900">
            Generating Dynamic Question
          </h2>
          <p className="text-emerald-700 font-medium text-sm">
            {loadingMsg}
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Gemini is tailoring technical questions for <strong>{skill}</strong> ({role || 'General'}).
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: 3. ACTIVE INTERVIEW STAGE ─────────────────────────────────────
  if (stage === 'interview') {
    const progress = (currentQuestionNum / totalQuestions) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header Progress & Metadata Bar */}
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
                Role: <strong className="text-gray-800">{role || 'General'}</strong> • Skill: <strong className="text-emerald-700">{skill}</strong>
              </p>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>
          </div>

          <ProgressBar value={progress} color="brand" />
        </div>

        {/* AI Question Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  AI Technical Interviewer
                </p>
                {currentFocusConcept && (
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                    Topic: {currentFocusConcept}
                  </span>
                )}
              </div>
              <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed">
                {currentQuestionText}
              </p>
            </div>
          </div>
        </Card>

        {/* Answer Box & Voice Integration Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Your Technical Answer
            </label>

            {/* Speech-to-Text Mic Toggle */}
            <div className="flex items-center gap-2">
              {speechState === 'listening' ? (
                <button
                  type="button"
                  onClick={stopListening}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold transition animate-pulse"
                >
                  <MicOff className="w-3.5 h-3.5" />
                  Stop Voice Mic
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startListening}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  Speak Answer (Voice STT)
                </button>
              )}
            </div>
          </div>

          {/* Voice Speech Transcript Preview */}
          {transcript && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-600" />
                  Voice Recognition Transcript:
                </span>
                <span className="text-amber-700 text-[11px] font-normal">Review before submitting</span>
              </div>
              <p className="text-xs text-amber-950 italic leading-relaxed">
                "{transcript}"
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplySpeechTranscript(false)}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
                >
                  Append to Answer Box
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySpeechTranscript(true)}
                  className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-200 transition"
                >
                  Replace Answer Box
                </button>
                <button
                  type="button"
                  onClick={resetSpeech}
                  className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Transcript
                </button>
              </div>
            </div>
          )}

          {speechError && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
              {speechError}
            </p>
          )}

          {/* Text Area for Candidate Answer */}
          <textarea
            value={currentAnswerText}
            onChange={(e) => setCurrentAnswerText(e.target.value)}
            rows={7}
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 leading-relaxed transition resize-none"
            placeholder="Type your detailed answer here or use the Speak Answer button above..."
          />

          {/* Active Control Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              {currentAnswerText.trim().split(/\s+/).filter(Boolean).length} words written
            </span>

            <div className="flex items-center gap-2.5">
              {/* Skip Question Button */}
              <Button
                variant="outline"
                type="button"
                onClick={() => processAnswerSubmission('', true)}
                className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Question</span>
              </Button>

              {/* Submit Answer Button */}
              <Button
                type="button"
                onClick={() => processAnswerSubmission(currentAnswerText, false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-5 flex items-center gap-2 shadow-sm"
              >
                {currentQuestionNum < totalQuestions ? (
                  <>
                    <span>Submit & Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Complete Interview</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── RENDER: 4. INTERVIEW COMPLETED STAGE ──────────────────────────────────
  const validScores = evaluationsList.map(e => Number(e.score)).filter(s => !isNaN(s) && s !== null);
  const finalAvgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-1 shadow-sm">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
          Interview Completed!
        </h1>
        <p className="text-gray-500 text-sm">
          Your session data and evaluation scores have been saved to your account.
        </p>
      </div>

      {/* Summary Performance Ring Card */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-4">
        <ScoreRing score={finalAvgScore} size={130} />

        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">
            {finalAvgScore >= 75
              ? 'Outstanding performance!'
              : finalAvgScore >= 50
              ? 'Good effort! Keep practicing to strengthen key concepts.'
              : 'Keep practicing! Review the actual answers below to improve.'}
          </p>
          <p className="text-xs text-gray-500">
            Role: <strong>{role || 'General'}</strong> • Skill: <strong>{skill}</strong> • {totalQuestions} Questions • Duration: {formatDuration(elapsedSeconds)}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setStage('setup')}
            className="rounded-xl border-gray-200 text-gray-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Interview</span>
          </Button>
          <Button
            onClick={() => navigate('/app/history')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>View All History</span>
          </Button>
        </div>
      </Card>

      {/* Q&A Evaluation Breakdown List */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900">
          Question & Answer Breakdown
        </h2>

        {questionsList.map((qText, idx) => {
          const ansText = answersList[idx] || '(No response)';
          const evalObj = evaluationsList[idx] || {};
          const score = evalObj.score !== undefined && evalObj.score !== null ? Number(evalObj.score) : 0;
          const actualAnswerText = evalObj.actual_answer || evalObj.feedback || '';

          return (
            <Card key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{qText}</p>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold flex-shrink-0',
                    score >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : score >= 40
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  )}
                >
                  {score}% {evalObj.verdict ? `(${evalObj.verdict})` : ''}
                </span>
              </div>

              {/* Candidate Answer */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Candidate Answer
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {ansText}
                </p>
              </div>

              {/* Actual / Model Answer */}
              {actualAnswerText && (
                <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200/80 space-y-1.5 text-blue-950">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Actual Answer
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                    {actualAnswerText}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
