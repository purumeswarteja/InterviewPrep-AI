import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Clock, Check, ArrowRight, RotateCcw, Code, Database, Cloud,
  GitBranch, Box, Network, Terminal, Atom, TrendingUp, Sparkles, Award,
  BookOpen, Lightbulb, Search, Shield, Users, Briefcase, DollarSign, Heart, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, Badge, ScoreRing, ProgressBar } from '../../components/ui';
import { cn } from '../../lib/utils';
import { mockQuestionBank, difficultyLevels } from '../../data/questions';

const iconMap = {
  javascript: Code,
  react: Atom,
  python: Terminal,
  java: Code,
  cpp: Terminal,
  sql: Database,
  'data-structures': Box,
  algorithms: GitBranch,
  'system-design': Network,
  cloud: Cloud,
  'web-security': Shield,
  'machine-learning': Brain
};

const topics = Object.keys(mockQuestionBank).map((key) => ({
  id: key,
  name: key === 'cpp' ? 'C++' : key === 'sql' ? 'SQL & Databases' : key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  icon: iconMap[key] || Code,
  count: mockQuestionBank[key].length
}));

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'on', 'at', 'by',
  'for', 'with', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
  'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among', 'it',
  'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'he', 'she', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
  'whose', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'from',
  'if', 'then', 'also', 'because', 'while', 'here', 'there', 'use', 'used', 'using'
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function generateFeedback(answer, modelAnswer, keywords) {
  if (!answer.trim()) {
    return { score: 0, feedback: 'No answer provided. Review the model answer below and try again.', matchedKeywords: [], missedKeywords: keywords };
  }
  const answerTokens = new Set(tokenize(answer));
  const modelTokens = new Set(tokenize(modelAnswer));
  const matchedKeywords = [];
  const missedKeywords = [];
  const answerLower = answer.toLowerCase();

  keywords.forEach(kw => {
    if (answerLower.includes(kw.toLowerCase())) matchedKeywords.push(kw);
    else missedKeywords.push(kw);
  });

  const keywordScore = keywords.length > 0 ? (matchedKeywords.length / keywords.length) * 100 : 0;
  let overlap = 0;
  modelTokens.forEach(t => {
    if (answerTokens.has(t)) overlap++;
  });
  const overlapScore = modelTokens.size > 0 ? Math.min(100, (overlap / modelTokens.size) * 130) : 0;
  const score = Math.round(keywordScore * 0.6 + overlapScore * 0.4);

  let feedback = '';
  if (score >= 85) {
    feedback = `Excellent answer! You covered ${matchedKeywords.length}/${keywords.length} key concepts. Concise and technically accurate.`;
  } else if (score >= 65) {
    feedback = `Good answer. You covered ${matchedKeywords.length}/${keywords.length} key concepts. To strengthen it, include: ${missedKeywords.slice(0, 3).join(', ')}.`;
  } else if (score >= 40) {
    feedback = `Partial answer. You covered ${matchedKeywords.length}/${keywords.length} key concepts. Missing: ${missedKeywords.slice(0, 4).join(', ')}. Review the model answer below.`;
  } else {
    feedback = `Needs improvement. You covered ${matchedKeywords.length}/${keywords.length} key concepts. Focus on: ${missedKeywords.slice(0, 5).join(', ')}.`;
  }

  return { score: Math.min(98, Math.max(5, score)), feedback, matchedKeywords, missedKeywords };
}

export default function MockInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState('setup');
  const [topic, setTopic] = useState('javascript');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const filteredTopics = topics.filter(t => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return t.name.toLowerCase().includes(query) ||
           t.id.toLowerCase().includes(query) ||
           (mockQuestionBank[t.id] && mockQuestionBank[t.id].some(q => q.keywords.some(kw => kw.toLowerCase().includes(query))));
  });

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const startInterview = () => {
    const allPool = mockQuestionBank[topic] || [];
    if (allPool.length === 0) {
      toast.error('No questions available for this topic yet.');
      return;
    }
    const desired = Math.max(1, Math.min(questionCount, allPool.length));
    
    // Shuffle all questions to guarantee variety and prevent repetition
    let poolByDiff = allPool.filter(q => q.difficulty === difficulty);
    let selectedPool = shuffleArray(poolByDiff);

    if (selectedPool.length < desired) {
      const others = shuffleArray(allPool.filter(q => q.difficulty !== difficulty));
      for (let i = 0; selectedPool.length < desired && i < others.length; i++) {
        if (!selectedPool.includes(others[i])) selectedPool.push(others[i]);
      }
    }

    const final = shuffleArray(selectedPool).slice(0, desired);
    setQuestions(final);
    setCurrentIdx(0);
    setAnswers([]);
    setCurrentAnswer('');
    setStage('interview');
    setStartTime(Date.now());
    toast.success(`Interview started with ${final.length} questions! Good luck.`);
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please write an answer before continuing.');
      return;
    }
    const currentQ = questions[currentIdx];
    const { score, feedback, matchedKeywords } = generateFeedback(
      currentAnswer,
      currentQ.a,
      currentQ.keywords
    );
    const qa = {
      id: `q-${currentIdx}`,
      question: currentQ.q,
      answer: currentAnswer,
      feedback,
      score,
      model_answer: currentQ.a,
      tags: matchedKeywords
    };
    const newAnswers = [...answers, qa];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishInterview(newAnswers);
    }
  };

  const finishInterview = useCallback(async (allAnswers) => {
    setSaving(true);
    const avgScore = allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length;
    const duration = Math.floor((Date.now() - startTime) / 1000);

    if (user) {
      const data = await api.createSession({
        user_id: user.id,
        type: 'mock',
        topic,
        difficulty,
        score: avgScore,
        duration_seconds: duration,
        questions: allAnswers,
        answers: allAnswers,
        feedback: { summary: 'AI-generated feedback', avg_score: avgScore },
        status: 'completed'
      });
      if (!data.error) {
        await refreshProfile();
      }
    }
    setSaving(false);
    setStage('feedback');
  }, [user, topic, difficulty, startTime, refreshProfile]);

  const restart = () => {
    setStage('setup');
    setCurrentIdx(0);
    setAnswers([]);
    setCurrentAnswer('');
  };

  const avgScore = answers.length ? answers.reduce((s, a) => s + a.score, 0) / answers.length : 0;

  if (stage === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
            AI Technical Mock Interview
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Select a skill topic, difficulty, and question count to launch your mock interview.
          </p>
        </div>

        {/* Search Skill & Number of Questions Controls Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <div className="grid sm:grid-cols-[1fr_220px] gap-4 items-start">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Search Skill / Topic
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search skills or topics (e.g., React, SQL)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                />
              </div>
            </div>

            {/* Number of Questions Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Questions Selected
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 bg-white transition cursor-pointer font-medium"
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (In-depth)</option>
                <option value={10}>10 Questions (Comprehensive)</option>
                <option value={15}>15 Questions (Marathon)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
            <span>
              {filteredTopics.length} matching {filteredTopics.length === 1 ? 'skill topic' : 'skill topics'} available
            </span>
            <span>Questions are randomly sampled to prevent repetition</span>
          </div>
        </Card>

        {/* Topic Selection */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-display font-semibold text-lg text-gray-900">Select Skill Topic</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTopics.map((t) => {
              const Icon = t.icon;
              const isSelected = topic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3.5',
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
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
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.count} questions in bank</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Difficulty Selection */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-display font-semibold text-lg text-gray-900">Select Difficulty</h2>
          <div className="grid sm:grid-cols-3 gap-3.5">
            {difficultyLevels.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  )}
                >
                  <p className="font-semibold text-sm text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{d.description}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Start CTA */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{questionCount} questions • ~{questionCount * 2-3} minutes estimated</span>
          </div>
          <Button
            size="lg"
            onClick={startInterview}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Interview</span>
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'interview') {
    const progress = ((currentIdx + 1) / questions.length) * 100;
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header Progress */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-gray-900">
                Question {currentIdx + 1} of {questions.length}
              </h1>
              <p className="text-xs text-gray-500 capitalize">
                {topic.replace('-', ' ')} • {difficulty} difficulty
              </p>
            </div>
            <Badge color="brand">In Progress</Badge>
          </div>
          <ProgressBar value={progress} color="brand" />
        </div>

        {/* Question Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                AI Technical Interviewer
              </p>
              <p className="text-gray-900 font-medium text-base leading-relaxed">
                {questions[currentIdx].q}
              </p>
            </div>
          </div>
        </Card>

        {/* Answer Textarea */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Your Technical Answer
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={8}
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 leading-relaxed transition resize-none"
            placeholder="Type your detailed answer here. Mention key concepts, code structure, or real-world examples..."
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words typed
            </span>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                onClick={() => navigate('/app/dashboard')}
                className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Exit
              </Button>
              <Button
                onClick={submitAnswer}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-5 flex items-center gap-2"
              >
                {currentIdx < questions.length - 1 ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Finish Interview</span>
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
          Interview Complete!
        </h1>
        <p className="text-gray-500 text-sm">
          Here is your detailed performance breakdown with AI feedback and model answers.
        </p>
      </div>

      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <ScoreRing score={avgScore} size={140} />
        <p className="mt-4 text-sm font-medium text-gray-700">
          {avgScore >= 80
            ? 'Outstanding performance!'
            : avgScore >= 60
            ? 'Good effort! Review missed keywords below to reach 80%+.'
            : 'Keep practicing! Check model answers below.'}
        </p>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={restart} className="rounded-xl border-gray-200 text-gray-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Interview
          </Button>
          <Button onClick={() => navigate('/app/history')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            <TrendingUp className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900">Question Breakdown & Feedback</h2>
        {answers.map((a, i) => (
          <Card key={a.id} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-gray-900">{a.question}</p>
              </div>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold flex-shrink-0',
                  a.score >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : a.score >= 60
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                )}
              >
                {a.score}%
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Your Answer</p>
              <p className="text-sm text-gray-800">{a.answer}</p>
            </div>

            <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                AI Feedback
              </p>
              <p className="text-sm text-gray-800">{a.feedback}</p>
            </div>

            <div className="bg-sky-50/60 rounded-xl p-3.5 border border-sky-100">
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Model Answer
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{a.model_answer}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
