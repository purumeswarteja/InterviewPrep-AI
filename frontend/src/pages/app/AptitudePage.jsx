import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Percent, TrendingUp, Clock, Zap, Target,
  Check, X, HelpCircle, ChevronRight, RotateCcw, FileText,
  AlertCircle, BookOpen, Timer, Award, Lightbulb, Play, ArrowRight,
  ShieldCheck, Layers, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, Badge, ScoreRing, ProgressBar } from '../../components/ui';
import { cn, formatDuration } from '../../lib/utils';

// ─── Topics List ─────────────────────────────────────────────────────────────
const aptitudeTopics = [
  {
    id: 'percentages',
    name: 'Percentages, Ratios & Proportions',
    icon: Percent,
    color: 'emerald',
    desc: 'Ratio conversions, percentage growth, mixtures & proportion problems.'
  },
  {
    id: 'profit_loss',
    name: 'Profit, Loss & Discounts',
    icon: TrendingUp,
    color: 'sky',
    desc: 'Cost price, marked price, trade discount & profit margin formulas.'
  },
  {
    id: 'time_work',
    name: 'Time and Work',
    icon: Clock,
    color: 'amber',
    desc: 'Efficiency rates, combined work, pipe inlets and cistern problems.'
  },
  {
    id: 'speed_distance',
    name: 'Speed, Time and Distance',
    icon: Zap,
    color: 'purple',
    desc: 'Train crossing scenarios, relative velocity, boats and streams.'
  },
  {
    id: 'probability',
    name: 'Probability and Permutations',
    icon: Target,
    color: 'indigo',
    desc: 'Combinations, card & dice probability, arrangement logic.'
  },
  {
    id: 'numbers_averages',
    name: 'Number Systems and Averages',
    icon: Calculator,
    color: 'rose',
    desc: 'Divisibility rules, prime factors, mean averages & series sums.'
  },
  {
    id: 'all',
    name: 'Mixed Aptitude Challenge',
    icon: Layers,
    color: 'brand',
    desc: 'Comprehensive quantitative test featuring questions across all topics.'
  }
];

// Difficulty Time Configurations
const difficultyTimeConfig = {
  Easy: { label: 'Easy', secPerQ: 45, desc: '45 sec / question' },
  Medium: { label: 'Medium', secPerQ: 60, desc: '1 min / question' },
  Hard: { label: 'Hard', secPerQ: 90, desc: '1.5 min / question' }
};

export default function AptitudePage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Setup Options State (Empty Defaults - User MUST select/enter)
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCountInput, setQuestionCountInput] = useState('');
  const [mode, setMode] = useState(''); // 'timed' | 'practice'

  // Validation Error States
  const [validationError, setValidationError] = useState('');

  // Interview Flow State
  const [stage, setStage] = useState('setup'); // 'setup' | 'loading' | 'active' | 'completed'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: 'A' | 'B' | 'C' | 'D' }
  const [showExplanationMap, setShowExplanationMap] = useState({}); // Practice mode toggle
  const [loadingMsg, setLoadingMsg] = useState('');

  // Timed Test Mode Timer State
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(600);
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Calculate suggested total time based on difficulty and count
  const parsedCount = parseInt(questionCountInput, 10) || 0;
  const secPerQ = difficultyTimeConfig[difficulty]?.secPerQ || 60;
  const computedSuggestedSeconds = parsedCount * secPerQ;
  const suggestedMinutes = Math.round(computedSuggestedSeconds / 60);

  // Timer Effect for Timed Test Mode
  useEffect(() => {
    if (stage === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        if (mode === 'timed') {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              toast.error('Time expired! Automatically submitting test...');
              finishTest();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, mode]);

  // Start Aptitude Test / Practice with strict validation
  const handleStartAptitude = async () => {
    setValidationError('');

    if (!mode) {
      const msg = 'Please select a Test Mode (Practice Mode or Timed Test Mode).';
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (!difficulty) {
      const msg = 'Please select a Difficulty level (Easy, Medium, or Hard).';
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (!parsedCount || parsedCount < 1 || parsedCount > 20) {
      const msg = 'Please enter or select a valid Question Count between 1 and 20.';
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (!selectedTopicId) {
      const msg = 'Please select a Quantitative Topic Area.';
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    const activeTopicObj = aptitudeTopics.find((t) => t.id === selectedTopicId);
    const totalSec = parsedCount * secPerQ;

    setTotalTimeSeconds(totalSec);
    setRemainingSeconds(totalSec);
    setElapsedSeconds(0);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowExplanationMap({});

    // Read stored question history to prevent duplicates
    let historyQuestions = [];
    try {
      const stored = localStorage.getItem('aptitude_question_history');
      if (stored) historyQuestions = JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read question history');
    }

    setStage('loading');
    setLoadingMsg(`AI Question Generator is preparing ${parsedCount} ${difficulty} Aptitude questions for ${activeTopicObj.name}...`);

    try {
      const res = await api.generateAptitudeQuestions({
        topicId: activeTopicObj.id,
        topicName: activeTopicObj.name,
        difficulty,
        totalQuestions: parsedCount,
        previousQuestions: historyQuestions
      });

      if (res?.questions && res.questions.length > 0) {
        setQuestions(res.questions);

        // Update local history
        const newQuestionTexts = res.questions.map((q) => q.question);
        const updatedHistory = Array.from(new Set([...historyQuestions, ...newQuestionTexts])).slice(-100);
        try {
          localStorage.setItem('aptitude_question_history', JSON.stringify(updatedHistory));
        } catch (e) {
          /* ignore */
        }

        setStage('active');
        toast.success(`Aptitude test started! (${mode === 'timed' ? 'Timed Test Mode' : 'Practice Mode'})`);
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      console.warn('Aptitude questions load error, using fallback:', err.message);
      toast.error('Using dynamic offline math questions.');
      setStage('active');
    }
  };

  // Option Select Handler
  const handleOptionSelect = (optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionKey
    }));
  };

  // Finish & Save Session
  const finishTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const qDetails = questions.map((q, idx) => {
      const userAns = selectedAnswers[idx] || null;
      const isCorrect = userAns === q.correct_option;
      if (isCorrect) correctCount++;
      return {
        id: `q-${idx + 1}`,
        question: q.question,
        options: q.options,
        user_answer: userAns,
        correct_answer: q.correct_option,
        is_correct: isCorrect,
        explanation: q.explanation
      };
    });

    const scorePercentage = Math.round((correctCount / (questions.length || 1)) * 100);
    const activeTopicObj = aptitudeTopics.find((t) => t.id === selectedTopicId) || aptitudeTopics[0];

    if (user) {
      try {
        const payload = {
          user_id: user.id,
          type: 'aptitude',
          role: 'Quantitative Candidate',
          skill: activeTopicObj.name,
          topic: activeTopicObj.name,
          difficulty: difficulty,
          numberOfQuestions: questions.length,
          score: scorePercentage,
          duration_seconds: elapsedSeconds,
          questions: qDetails.map((q) => ({
            id: q.id,
            question: q.question,
            answer: q.user_answer ? `Option ${q.user_answer}: ${q.options[q.user_answer] || ''}` : '(Unanswered)',
            score: q.is_correct ? 100 : 0,
            verdict: q.is_correct ? 'Correct' : 'Incorrect',
            feedback: q.explanation
          })),
          feedback: {
            summary: `Aptitude Test (${activeTopicObj.name}) - ${correctCount}/${questions.length} Correct`,
            accuracy: `${scorePercentage}%`
          },
          status: 'completed'
        };

        const res = await api.createSession(payload);
        if (!res.error) {
          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to save aptitude session:', err);
      }
    }

    setStage('completed');
  };

  const activeTopicObj = aptitudeTopics.find((t) => t.id === selectedTopicId);

  // ─── RENDER 1: SETUP STAGE ──────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-emerald-600" />
            Quantitative Aptitude & Reasoning
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Master problem-solving, numerical reasoning, formulas, and competitive exam math topics.
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Configuration Setup Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
          {/* Mode Selection (Required, No default) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>Select Test Mode <span className="text-red-500">*</span></span>
              {!mode && <span className="text-[10px] text-amber-600 font-normal">Selection required</span>}
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setMode('practice'); setValidationError(''); }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer',
                  mode === 'practice'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', mode === 'practice' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500')}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Practice Mode (Untimed)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Learn at your own pace with immediate step-by-step mathematical explanations.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setMode('timed'); setValidationError(''); }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer',
                  mode === 'timed'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', mode === 'timed' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500')}>
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Timed Test Mode (Exam Timer)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Real exam experience with countdown timer and automatic test submission.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Difficulty & Number of Questions */}
          <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                <span>Difficulty Level <span className="text-red-500">*</span></span>
                {!difficulty && <span className="text-[10px] text-amber-600 font-normal">Selection required</span>}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(difficultyTimeConfig).map((diffKey) => {
                  const isSelected = difficulty === diffKey;
                  const cfg = difficultyTimeConfig[diffKey];
                  return (
                    <button
                      key={diffKey}
                      type="button"
                      onClick={() => { setDifficulty(diffKey); setValidationError(''); }}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-xs font-semibold transition text-center',
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div>{cfg.label}</div>
                      <div className={cn('text-[10px] font-normal mt-0.5', isSelected ? 'text-emerald-100' : 'text-gray-400')}>
                        {cfg.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count Input (Up to max 20) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                <span>Number of Questions (Max 20) <span className="text-red-500">*</span></span>
                {!questionCountInput && <span className="text-[10px] text-amber-600 font-normal">Input required</span>}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Enter questions count (e.g. 5, 10, 15, 20)"
                value={questionCountInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 20)) {
                    setQuestionCountInput(val);
                    setValidationError('');
                  } else if (parseInt(val, 10) > 20) {
                    setQuestionCountInput('20');
                    toast.error('Maximum limit is 20 questions per test');
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Topic Selection Grid (Required, No default) */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>Select Quantitative Topic Area <span className="text-red-500">*</span></span>
              {!selectedTopicId && <span className="text-[10px] text-amber-600 font-normal">Selection required</span>}
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {aptitudeTopics.map((topicItem) => {
                const Icon = topicItem.icon;
                const isSelected = selectedTopicId === topicItem.id;
                return (
                  <button
                    key={topicItem.id}
                    type="button"
                    onClick={() => { setSelectedTopicId(topicItem.id); setValidationError(''); }}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3.5 cursor-pointer relative overflow-hidden',
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-gray-900">{topicItem.name}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{topicItem.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Start Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 shadow-sm gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
              ⏱️
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
                Suggested Total Time: <span className="text-emerald-700 font-bold text-sm">{suggestedMinutes || 0} Minutes</span>
              </p>
              <p className="text-xs text-gray-500">
                Topic: <strong>{activeTopicObj?.name || 'None selected'}</strong> • {parsedCount || 0} Qs ({difficulty || 'None'} mode)
              </p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleStartAptitude}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Aptitude Test</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─── RENDER 2: LOADING STAGE ────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
          <Calculator className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-gray-900">
            Generating Unique Aptitude Questions
          </h2>
          <p className="text-emerald-700 font-medium text-sm max-w-md mx-auto">
            {loadingMsg}
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER 3: ACTIVE TEST STAGE ───────────────────────────────────────────
  if (stage === 'active' && questions.length > 0) {
    const currentQ = questions[currentIdx];
    const userSelected = selectedAnswers[currentIdx];
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressVal = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Top Controls Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline-block">
                Topic: <strong>{activeTopicObj?.name}</strong>
              </span>
            </div>

            {/* Mode & Timer Badge */}
            {mode === 'timed' ? (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold font-mono border',
                  remainingSeconds < 60
                    ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Practice Mode (Untimed)
              </span>
            )}
          </div>

          <ProgressBar value={progressVal} color="brand" />
        </div>

        {/* Question Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              Problem {currentIdx + 1}
            </span>
            <h3 className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed pt-1">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {Object.entries(currentQ.options || {}).map(([optKey, optText]) => {
              const isSelected = userSelected === optKey;
              return (
                <button
                  key={optKey}
                  type="button"
                  onClick={() => handleOptionSelect(optKey)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3.5 cursor-pointer',
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-medium shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                  )}
                >
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition',
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {optKey}
                  </span>
                  <span className="text-sm flex-1 leading-relaxed">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Practice Mode Explanation Toggle */}
          {mode === 'practice' && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <button
                type="button"
                onClick={() =>
                  setShowExplanationMap((prev) => ({
                    ...prev,
                    [currentIdx]: !prev[currentIdx]
                  }))
                }
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showExplanationMap[currentIdx] ? 'Hide Solution' : 'Show Step-by-Step Explanation'}</span>
              </button>

              {showExplanationMap[currentIdx] && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950 animate-fade-in">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Correct Option: Option {currentQ.correct_option}
                  </p>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            className="rounded-xl border-gray-200 text-gray-600"
          >
            Previous
          </Button>

          <span className="text-xs text-gray-400 font-medium">
            {answeredCount} of {questions.length} Answered
          </span>

          {currentIdx < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIdx((prev) => prev + 1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 font-semibold flex items-center gap-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={finishTest}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-semibold flex items-center gap-2 shadow-sm"
            >
              <span>Submit Aptitude Test</span>
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER 4: COMPLETED STAGE ──────────────────────────────────────────────
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correct_option) correctCount++;
  });
  const scorePercentage = Math.round((correctCount / (questions.length || 1)) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header Summary */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-1 shadow-sm">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
          Aptitude Test Completed!
        </h1>
        <p className="text-gray-500 text-sm">
          Quantitative evaluation completed for <strong>{activeTopicObj?.name}</strong>.
        </p>
      </div>

      {/* Summary Score Ring Card */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-4">
        <ScoreRing score={scorePercentage} size={130} />

        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">
            {scorePercentage >= 80
              ? 'Outstanding mathematical problem solving!'
              : scorePercentage >= 60
              ? 'Good performance! Review detailed solutions below.'
              : 'Keep practicing! Check formulas and step-by-step explanations below.'}
          </p>
          <p className="text-xs text-gray-500">
            Accuracy: <strong>{correctCount} / {questions.length} Correct</strong> ({scorePercentage}%) • Duration: {formatDuration(elapsedSeconds)}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setStage('setup')}
            className="rounded-xl border-gray-200 text-gray-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Aptitude Test</span>
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

      {/* Detailed Solution Breakdown List */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Detailed Solution Breakdown ({questions.length} Problems)
        </h2>

        {questions.map((q, idx) => {
          const userAns = selectedAnswers[idx] || null;
          const isCorrect = userAns === q.correct_option;

          return (
            <Card key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed pt-0.5">
                    {q.question}
                  </p>
                </div>

                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 flex items-center gap-1',
                    isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  )}
                >
                  {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                </span>
              </div>

              {/* Options Breakdown */}
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(q.options || {}).map(([optKey, optText]) => {
                  const isUserPick = userAns === optKey;
                  const isCorrectOpt = q.correct_option === optKey;
                  return (
                    <div
                      key={optKey}
                      className={cn(
                        'p-2.5 rounded-xl border flex items-center justify-between',
                        isCorrectOpt
                          ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-950'
                          : isUserPick
                          ? 'bg-red-50 border-red-300 font-semibold text-red-950'
                          : 'bg-gray-50 border-gray-100 text-gray-700'
                      )}
                    >
                      <span>Option {optKey}: {optText}</span>
                      {isCorrectOpt && <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">Correct Answer</span>}
                      {isUserPick && !isCorrectOpt && <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">Your Pick</span>}
                    </div>
                  );
                })}
              </div>

              {/* Step by step formula & explanation */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-1">
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  Step-by-Step Explanation:
                </p>
                <p className="leading-relaxed">{q.explanation}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
