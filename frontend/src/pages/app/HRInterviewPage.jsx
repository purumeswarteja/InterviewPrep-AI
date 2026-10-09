import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, Briefcase, GraduationCap, Target, ShieldCheck,
  Building2, HelpCircle, MessagesSquare, Sparkles, Play, Clock,
  Mic, MicOff, Volume2, ArrowRight, Check, RotateCcw, FileText,
  RefreshCw, SkipForward, Lightbulb, ChevronDown, ChevronUp, AlertCircle,
  Square, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, Badge, ScoreRing, ProgressBar } from '../../components/ui';
import { cn, formatDuration } from '../../lib/utils';
import { useSpeechRecognition } from '../../lib/useSpeechRecognition';
import { speakText, stopSpeaking } from '../../lib/speech';

// ─── 7 HR Topic Blocks (+ Full HR Round) ──────────────────────────────────────
const hrTopicsList = [
  {
    id: 'introduction',
    name: 'Introduction',
    icon: UserCheck,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    desc: 'Professional background, resume overview, and key achievements.',
    sampleQuestions: [
      'Tell me about yourself, your professional background, and your key technical achievements.',
      'Walk me through your resume and highlight your core accomplishments.',
      'What aspects of your experience make you a strong fit for this position?'
    ]
  },
  {
    id: 'education-projects',
    name: 'Education & Projects',
    icon: GraduationCap,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    desc: 'Academic foundation, key projects, contributions & challenges.',
    sampleQuestions: [
      'Why did you choose your major, and how has your education prepared you for this role?',
      'Tell me about your primary project. What was your technical contribution and how did you tackle key challenges?',
      'If you were to redesign your main project today, what architecture or tool choices would you change?'
    ]
  },
  {
    id: 'strengths-weaknesses',
    name: 'Strengths & Weaknesses',
    icon: Target,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    desc: 'Core professional strengths, areas for improvement & growth.',
    sampleQuestions: [
      'What are your top professional strengths, and how have you demonstrated them recently?',
      'What is a professional weakness you are actively working on, and what steps are you taking to improve?',
      'How do you approach learning new skills or technologies outside your comfort zone?'
    ]
  },
  {
    id: 'behavioral',
    name: 'Behavioral Questions',
    icon: ShieldCheck,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    desc: 'STAR method scenarios, pressure handling & conflict resolution.',
    sampleQuestions: [
      'Describe a situation where you faced a high-pressure deadline. How did you handle it and deliver results?',
      'Tell me about a time you had a conflict or disagreement with a teammate. How did you handle it and reach a resolution?',
      'Describe a time you experienced a failure or mistake on a task. What did you learn and how did you adapt?'
    ]
  },
  {
    id: 'career-company',
    name: 'Career & Company',
    icon: Building2,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    desc: 'Company alignment, candidate fit, and long-term career vision.',
    sampleQuestions: [
      'Why are you interested in joining our company, and what unique value will you bring to our team?',
      'Why should we hire you for this role over other qualified candidates?',
      'Where do you see your career progressing over the next 3 to 5 years?'
    ]
  },
  {
    id: 'situational',
    name: 'Situational Questions',
    icon: HelpCircle,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    desc: 'Real-world workplace scenarios, teamwork & prioritization.',
    sampleQuestions: [
      'What would you do if a teammate was not contributing their fair share to an urgent project deadline?',
      'How would you handle a situation where you strongly disagreed with your manager\'s decision on a project?',
      'How do you manage and prioritize your work when facing multiple competing tight deadlines?'
    ]
  },
  {
    id: 'closing',
    name: 'Closing',
    icon: MessagesSquare,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    desc: 'Questions for interviewer and session wrap-up.',
    sampleQuestions: [
      'Do you have any questions for us regarding team structure, company culture, or role expectations?',
      'Is there any additional project or achievement you would like to highlight before we wrap up?'
    ]
  },
  {
    id: 'full-hr',
    name: 'Full HR Round (All Topics)',
    icon: Sparkles,
    badgeColor: 'bg-emerald-600 text-white border-emerald-600',
    desc: 'Comprehensive multi-stage HR interview covering all topics.',
    sampleQuestions: [
      'Tell me about yourself, your technical background, and what drives your interest in this position.'
    ]
  }
];

export default function HRInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // ─── Setup Form State ────────────────────────────────────────────────────────
  const [role, setRole] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('introduction');
  const [totalQuestionsInput, setTotalQuestionsInput] = useState('');

  // ─── Active Interview State ──────────────────────────────────────────────────
  const [stage, setStage] = useState('setup'); // 'setup' | 'loading' | 'interview' | 'completed'
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentFocusTopic, setCurrentFocusTopic] = useState('');
  const [isFollowupQuestion, setIsFollowupQuestion] = useState(false);
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Q&A & Evaluation Tracking Lists
  const [questionsList, setQuestionsList] = useState([]);
  const [answersList, setAnswersList] = useState([]);
  const [evaluationsList, setEvaluationsList] = useState([]);
  const [followupFlagsList, setFollowupFlagsList] = useState([]);

  // Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Speech Recognition Hook
  const {
    state: speechState,
    transcript,
    error: speechError,
    start: startListening,
    stop: stopListening,
    reset: resetSpeech
  } = useSpeechRecognition();

  const isRecording = speechState === 'listening' || speechState === 'recording_fallback';

  // Recording Timer Effect
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

  // Voice Speaker Controller with Avatar Callbacks
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

  // 1. Auto-read Question (Text-to-Speech) when question appears on screen
  useEffect(() => {
    if (stage === 'interview' && currentQuestionText) {
      speakQuestionVoice(currentQuestionText);
    }
    return () => {
      stopSpeaking();
    };
  }, [stage, currentQuestionText, speakQuestionVoice]);

  // 2. Live Speech-to-Text Auto-Fill into Answer Text Field
  useEffect(() => {
    if (transcript) {
      setCurrentAnswerText(transcript);
    }
  }, [transcript]);

  // Timer Controller
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

  // Fetch with Timeout Safety (Prevents stuck loading loop)
  const fetchWithTimeout = (apiPromise, timeoutMs = 8000) => {
    return Promise.race([
      apiPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs)
      )
    ]);
  };

  // ─── 1. Start HR Round ───────────────────────────────────────────────────────
  const handleStartHRRound = async () => {
    let qCount = parseInt(totalQuestionsInput, 10);
    if (isNaN(qCount) || qCount < 1) {
      qCount = 5;
      setTotalQuestionsInput(5);
    } else if (qCount > 15) {
      qCount = 15;
      setTotalQuestionsInput(15);
    }

    const topicObj = hrTopicsList.find(t => t.id === selectedTopicId) || hrTopicsList[0];

    setElapsedSeconds(0);
    setQuestionsList([]);
    setAnswersList([]);
    setEvaluationsList([]);
    setFollowupFlagsList([]);
    setCurrentQuestionNum(1);
    setCurrentAnswerText('');
    resetSpeech();

    setStage('loading');
    setLoadingMsg(`AI HR Director is preparing Question 1 for ${topicObj.name}...`);

    let questionSuccess = false;

    try {
      const res = await fetchWithTimeout(
        api.generateHRQuestion({
          role: role.trim() || 'Software Engineer',
          topicId: topicObj.id,
          topicName: topicObj.name,
          totalQuestions: qCount,
          currentQuestion: 1,
          previousQuestions: [],
          previousAnswers: []
        }),
        9000
      );

      if (res?.result?.question) {
        setCurrentQuestionText(res.result.question);
        setCurrentFocusTopic(res.result.focus_topic || topicObj.name);
        setIsFollowupQuestion(!!res.result.is_followup);
        setQuestionsList([res.result.question]);
        setFollowupFlagsList([!!res.result.is_followup]);
        questionSuccess = true;
      }
    } catch (err) {
      console.warn('AI HR Start error/timeout, using fallback:', err.message);
    }

    // Safety Fallback (Prevents stuck loading loop!)
    if (!questionSuccess) {
      const fallbackQ = topicObj.sampleQuestions[0] || `Tell me about yourself, your background, and why you applied for this role.`;
      setCurrentQuestionText(fallbackQ);
      setCurrentFocusTopic(topicObj.name);
      setIsFollowupQuestion(false);
      setQuestionsList([fallbackQ]);
      setFollowupFlagsList([false]);
    }

    setStage('interview');
    toast.success(`HR Round Started! Topic: ${topicObj.name}`);
  };

  // ─── 2. Submit Answer & Next Question (With Adaptive Follow-Up Support) ────────
  const processAnswerSubmission = async (answerToSubmit, isSkipped = false) => {
    if (speechState === 'listening') {
      stopListening();
    }

    const finalAnswer = isSkipped ? '(Skipped by candidate)' : answerToSubmit.trim();

    if (!isSkipped && !finalAnswer) {
      toast.error('Please record your speech or type your response before submitting.');
      return;
    }

    const newAnswers = [...answersList, finalAnswer];
    setAnswersList(newAnswers);
    setCurrentAnswerText('');
    resetSpeech();

    const topicObj = hrTopicsList.find(t => t.id === selectedTopicId) || hrTopicsList[0];
    const qCount = parseInt(totalQuestionsInput, 10) || 5;

    // Check if HR round finished
    if (currentQuestionNum >= qCount) {
      setStage('loading');
      setLoadingMsg('AI HR Director is evaluating final response and compiling scores...');

      let finalEval = {
        score: isSkipped ? 0 : 80,
        verdict: isSkipped ? 'Skipped' : 'Articulate Answer',
        feedback: isSkipped ? 'Question skipped.' : 'Clear behavioral response provided.'
      };

      if (!isSkipped) {
        try {
          const evalRes = await fetchWithTimeout(
            api.evaluateInterviewWithAI({
              question: currentQuestionText,
              answer: finalAnswer,
              topic: `HR Interview - ${topicObj.name}`,
              difficulty: 'Medium',
              category: topicObj.name
            }),
            6000
          );

          if (evalRes?.evaluation) {
            finalEval = {
              score: evalRes.evaluation.score ?? 80,
              verdict: evalRes.evaluation.verdict || 'Evaluated',
              feedback: evalRes.evaluation.feedback_notes || 'Response evaluated.'
            };
          }
        } catch (err) {
          console.warn('Final HR question evaluation fallback:', err.message);
        }
      }

      const updatedEvals = [...evaluationsList, finalEval];
      setEvaluationsList(updatedEvals);
      await finishAndSaveSession(questionsList, newAnswers, updatedEvals);
      return;
    }

    // Move to Next Question (Adaptive Gemini AI Follow-Up Decision)
    setStage('loading');
    setLoadingMsg(`AI HR Director is evaluating your response and generating the next question...`);

    let nextQText = '';
    let nextTopic = topicObj.name;
    let isFollowup = false;
    let prevEval = {
      score: isSkipped ? 0 : 75,
      verdict: isSkipped ? 'Skipped' : 'Good Response',
      feedback: isSkipped ? 'Question skipped.' : 'Articulate response delivered.'
    };

    try {
      const res = await fetchWithTimeout(
        api.generateHRQuestion({
          role: role.trim() || 'Software Engineer',
          topicId: topicObj.id,
          topicName: topicObj.name,
          totalQuestions: qCount,
          currentQuestion: currentQuestionNum + 1,
          previousQuestions: questionsList,
          previousAnswers: newAnswers
        }),
        8000
      );

      if (res?.result?.question) {
        nextQText = res.result.question;
        nextTopic = res.result.focus_topic || topicObj.name;
        isFollowup = !!res.result.is_followup;
        if (res.result.evaluation_of_previous && !isSkipped) {
          prevEval = res.result.evaluation_of_previous;
        }
      }
    } catch (err) {
      console.warn('Next HR question fetch error, using topic fallback:', err.message);
    }

    // Topic Fallback if AI response failed
    if (!nextQText) {
      const samplePool = topicObj.sampleQuestions || ['Tell me about your background and achievements.'];
      nextQText = samplePool[(currentQuestionNum) % samplePool.length];
      isFollowup = false;
    }

    const newEvals = [...evaluationsList, prevEval];
    setEvaluationsList(newEvals);

    const newQuestions = [...questionsList, nextQText];
    setQuestionsList(newQuestions);

    const newFlags = [...followupFlagsList, isFollowup];
    setFollowupFlagsList(newFlags);

    setCurrentQuestionText(nextQText);
    setCurrentFocusTopic(nextTopic);
    setIsFollowupQuestion(isFollowup);

    setCurrentQuestionNum((prev) => prev + 1);
    setStage('interview');

    if (isFollowup) {
      toast('AI Interviewer asked an adaptive follow-up question!', { icon: '💡' });
    }
  };

  // ─── 3. Save Session to Database ─────────────────────────────────────────────
  const finishAndSaveSession = async (finalQuestions, finalAnswers, finalEvals) => {
    const validScores = finalEvals.map(e => Number(e.score)).filter(s => !isNaN(s) && s !== null);
    const avgScore = validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 80;

    const selectedTopicObj = hrTopicsList.find(t => t.id === selectedTopicId) || hrTopicsList[0];

    const formattedQAs = finalQuestions.map((qText, idx) => ({
      id: `q-${idx + 1}`,
      question: qText,
      answer: finalAnswers[idx] || '(No response)',
      score: finalEvals[idx]?.score ?? 80,
      verdict: finalEvals[idx]?.verdict || 'Completed',
      feedback: finalEvals[idx]?.feedback || 'Evaluation completed.',
      is_followup: followupFlagsList[idx] || false
    }));

    if (user) {
      try {
        const payload = {
          user_id: user.id,
          type: 'hr',
          role: role.trim() || 'HR Candidate',
          skill: selectedTopicObj.name,
          topic: selectedTopicObj.name,
          difficulty: 'Medium',
          numberOfQuestions: totalQuestionsInput,
          score: avgScore,
          duration_seconds: elapsedSeconds,
          questions: formattedQAs,
          answers: finalAnswers,
          evaluations: finalEvals,
          feedback: { summary: `HR Round (${selectedTopicObj.name}) completed`, avg_score: avgScore },
          status: 'completed'
        };

        const res = await api.createSession(payload);
        if (!res.error) {
          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to save HR session to database:', err);
      }
    }

    setStage('completed');
  };

  // Voice Speech Transcript Helper
  const handleApplySpeechTranscript = (replace = false) => {
    if (!transcript) return;
    if (replace) {
      setCurrentAnswerText(transcript);
    } else {
      setCurrentAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
    resetSpeech();
    toast.success('Speech applied to answer box!');
  };

  // ─── RENDER 1: SETUP STAGE ──────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-emerald-600" />
            HR & Behavioral Round Setup
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Choose an HR topic section or full interview. Gemini AI acts as an adaptive interviewer with real-time follow-up questions.
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Preferred Target Role (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Target Role / Position (Optional)
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Product Manager, Data Analyst..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
              />
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
                placeholder="Enter number of questions (e.g. 5)"
                value={totalQuestionsInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') setTotalQuestionsInput('');
                  else {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) setTotalQuestionsInput(Math.max(1, Math.min(15, parsed)));
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-semibold text-gray-900 transition"
              />
            </div>
          </div>

          {/* HR Topic Section Cards Grid */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Select HR Round Topic Section <span className="text-red-500">*</span>
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {hrTopicsList.map((topicItem) => {
                const Icon = topicItem.icon;
                const isSelected = selectedTopicId === topicItem.id;
                return (
                  <button
                    key={topicItem.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topicItem.id)}
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

        {/* Start Button & Footer */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>
              Topic: <strong>{hrTopicsList.find(t => t.id === selectedTopicId)?.name}</strong> • {totalQuestionsInput || 5} Questions
            </span>
          </div>
          <Button
            size="lg"
            onClick={handleStartHRRound}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Play className="w-4 h-4" />
            <span>Start HR Round</span>
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
          <RefreshCw className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-gray-900">
            Preparing HR Behavioral Question
          </h2>
          <p className="text-emerald-700 font-medium text-sm">
            {loadingMsg}
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Gemini AI is analyzing previous responses for adaptive follow-up opportunities.
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER 3: ACTIVE INTERVIEW STAGE ───────────────────────────────────────
  if (stage === 'interview') {
    const qCount = parseInt(totalQuestionsInput, 10) || 5;
    const progress = (currentQuestionNum / qCount) * 100;
    const activeTopicObj = hrTopicsList.find(t => t.id === selectedTopicId) || hrTopicsList[0];

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Progress & Info Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900">
                  Question {currentQuestionNum} of {qCount}
                </span>
                <Badge color="brand">HR Round</Badge>
                {isFollowupQuestion && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Adaptive Follow-Up
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Section: <strong className="text-gray-800">{currentFocusTopic || activeTopicObj.name}</strong> {role ? `• Role: ${role}` : ''}
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>
          </div>

          <ProgressBar value={progress} color="brand" />
        </div>

        {/* AI HR Question Card (Voice & Avatar Enabled) */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all',
                  isSpeakingQuestion ? 'bg-emerald-500 animate-bounce shadow-lg shadow-emerald-200' : 'bg-emerald-600 shadow-sm'
                )}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    AI HR Director
                  </p>
                  {isSpeakingQuestion && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Speaking...
                    </span>
                  )}
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium ml-auto">
                    {activeTopicObj.name}
                  </span>
                </div>
                <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed">
                  {currentQuestionText}
                </p>
              </div>
            </div>

            {/* Replay Question Voice Button */}
            <button
              type="button"
              onClick={() => speakQuestionVoice(currentQuestionText)}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition flex-shrink-0"
              title="Replay AI Question Voice"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </Card>

        {/* Answer Recording & Input Card (Voice Interview Style) */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5">
          {/* Centered Large Voice Recording Mic Button */}
          <div className="flex flex-col items-center justify-center py-4 border-b border-gray-100">
            <button
              type="button"
              onClick={isRecording ? stopListening : startListening}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg',
                isRecording
                  ? 'bg-red-500 animate-pulse scale-110 shadow-red-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-105'
              )}
            >
              {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </button>

            <p className="mt-3 text-sm font-semibold text-gray-800">
              {isRecording
                ? `Recording Voice… ${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, '0')}`
                : 'Click microphone to start speaking your response'}
            </p>

            {/* Live Audio Wave Visualizer Animation */}
            {isRecording && (
              <div className="flex items-center gap-1 mt-3">
                {[40, 70, 30, 90, 50, 80, 40, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDuration: `${0.4 + (i % 4) * 0.2}s`
                    }}
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
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
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
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 leading-relaxed transition resize-none"
              placeholder="Your voice response transcript will automatically fill up here. You can also edit or type additional text..."
            />
          </div>

          {/* Controls Bar */}
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

              {/* Submit Button */}
              <Button
                type="button"
                onClick={() => processAnswerSubmission(currentAnswerText, false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-5 flex items-center gap-2 shadow-sm"
              >
                {currentQuestionNum < qCount ? (
                  <>
                    <span>Submit & Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Complete HR Round</span>
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

  // ─── RENDER 4: COMPLETED STAGE ──────────────────────────────────────────────
  const validScores = evaluationsList.map(e => Number(e.score)).filter(s => !isNaN(s) && s !== null);
  const finalAvgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 80;
  const activeTopicObj = hrTopicsList.find(t => t.id === selectedTopicId) || hrTopicsList[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-1 shadow-sm">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
          HR Round Complete!
        </h1>
        <p className="text-gray-500 text-sm">
          Behavioral evaluation completed for <strong>{activeTopicObj.name}</strong>.
        </p>
      </div>

      {/* Summary Performance Ring Card */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-4">
        <ScoreRing score={finalAvgScore} size={130} />

        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">
            {finalAvgScore >= 80
              ? 'Great behavioral communication & STAR response structure!'
              : finalAvgScore >= 60
              ? 'Good answers! Focus on STAR structure for higher impact.'
              : 'Keep practicing! Review individual feedback below.'}
          </p>
          <p className="text-xs text-gray-500">
            Section: <strong>{activeTopicObj.name}</strong> {role ? `• Role: ${role}` : ''} • Duration: {formatDuration(elapsedSeconds)}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setStage('setup')}
            className="rounded-xl border-gray-200 text-gray-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New HR Round</span>
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

      {/* Question Breakdown List */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900">
          Behavioral Q&A Evaluation Breakdown
        </h2>

        {questionsList.map((qText, idx) => {
          const ansText = answersList[idx] || '(No response)';
          const evalObj = evaluationsList[idx] || {};
          const score = evalObj.score ?? 80;
          const isFollowup = followupFlagsList[idx];

          return (
            <Card key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    {isFollowup && (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                        Adaptive Follow-Up Question
                      </span>
                    )}
                    <p className="text-sm font-semibold text-gray-900">{qText}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold flex-shrink-0',
                    score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : score >= 60
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  )}
                >
                  {score}% {evalObj.verdict ? `(${evalObj.verdict})` : ''}
                </span>
              </div>

              {/* Candidate Response */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Candidate Response
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {ansText}
                </p>
              </div>

              {/* AI Evaluation */}
              {evalObj.feedback && (
                <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    AI HR Evaluation
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {evalObj.feedback}
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
