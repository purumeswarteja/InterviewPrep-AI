import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator, Puzzle, Brain, Mic, FileText, TrendingUp, Flame, Target,
  ArrowRight, Clock, Play, ChevronRight, Star, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ScoreRing, EmptyState } from '../../components/ui';
import { cn, timeAgo, formatDuration } from '../../lib/utils';

const quickActions = [
  {
    to: '/app/aptitude',
    icon: Calculator,
    label: 'Quantitative Aptitude',
    desc: 'Math, ratios, speeds & logic',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    shadow: 'rgba(99,102,241,0.35)',
  },
  {
    to: '/app/reasoning',
    icon: Puzzle,
    label: 'Logical Reasoning',
    desc: 'Series, coding, blood relations',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    shadow: 'rgba(139,92,246,0.35)',
  },
  {
    to: '/app/mock-interview',
    icon: Brain,
    label: 'AI Mock Interview',
    desc: 'Technical deep-dive questions',
    gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    shadow: 'rgba(124,58,237,0.35)',
  },
  {
    to: '/app/hr-interview',
    icon: Mic,
    label: 'HR Interview',
    desc: 'Behavioral & culture fit prep',
    gradient: 'linear-gradient(135deg, #06a5f1, #0084d1)',
    shadow: 'rgba(6,165,241,0.35)',
  },
  {
    to: '/app/resume-analyzer',
    icon: FileText,
    label: 'Resume Analyzer',
    desc: 'ATS score & smart feedback',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    shadow: 'rgba(236,72,153,0.35)',
  },
];

function StatCard({ icon: Icon, value, label, bg, iconBg, iconColor, textColor }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: bg, border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <TrendingUp className="w-4 h-4 opacity-30" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="font-bold text-2xl leading-none mb-1" style={{ color: textColor, fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          {value}
        </p>
        <p className="text-sm font-medium opacity-70" style={{ color: textColor }}>{label}</p>
      </div>
    </div>
  );
}

function getSessionSummary(session) {
  if (!session) return null;

  const questionsList = session.questions || [];
  const score = session.score !== null ? Math.round(session.score) : null;
  const topic = session.skill || session.topic || 'Interview';
  const role = session.role ? ` for ${session.role}` : '';

  let verdict = 'Completed';
  let verdictColor = 'bg-gray-100 text-gray-800';

  if (score !== null) {
    if (score >= 80) {
      verdict = 'Outstanding Performance';
      verdictColor = 'bg-violet-100 text-violet-800';
    } else if (score >= 60) {
      verdict = 'Proficient Performance';
      verdictColor = 'bg-amber-100 text-amber-800';
    } else {
      verdict = 'Needs Review';
      verdictColor = 'bg-rose-100 text-rose-800';
    }
  }

  let text = '';
  if (session.feedback && typeof session.feedback === 'object' && session.feedback.summary && !session.feedback.summary.startsWith('Interview completed') && !session.feedback.summary.endsWith('completed')) {
    text = session.feedback.summary;
  } else if (score !== null) {
    if (score >= 80) {
      text = `Outstanding performance in ${topic}${role}. Clear understanding of core concepts with well-structured answers across ${questionsList.length || 'all'} questions.`;
    } else if (score >= 60) {
      text = `Good performance in ${topic}${role}. Solid foundational knowledge shown; adding more practical examples and covering edge cases will help push your score higher.`;
    } else {
      text = `Practice completed for ${topic}${role}. Review the key concepts and recommended answers below to strengthen your fundamentals for subsequent rounds.`;
    }
  } else {
    text = `Completed practice session for ${topic}${role} with ${questionsList.length || 0} questions answered.`;
  }

  return { text, verdict, verdictColor };
}

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (user) {
      if (refreshProfile) refreshProfile();
      api.getSessions().then((response) => {
        if (!response.error) setSessions(response.sessions || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const weeklyCompleted = sessions.filter((s) => {
    const d = new Date(s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d > weekAgo;
  }).length;

  const weeklyGoal = profile?.weekly_goal || 5;
  const scoredSessions = sessions.filter((s) => s.score !== null && s.score !== undefined && !isNaN(Number(s.score)));
  const avgScore = loading
    ? (profile?.avg_score ? Math.round(profile.avg_score) : null)
    : (scoredSessions.length
        ? Math.round(scoredSessions.reduce((sum, s) => sum + Number(s.score || 0), 0) / scoredSessions.length)
        : null);
  const totalInterviews = loading ? (profile?.total_interviews || 0) : sessions.length;
  const bestStreak = profile?.longest_streak || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-7 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">Ready to sharpen your interview skills today?</p>
        </div>
        {profile?.streak_count > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-semibold text-sm"
            style={{ background: '#fff8ed', borderColor: '#ffdba8', color: '#c74a08' }}>
            <Flame className="w-5 h-5" />
            {profile.streak_count} day streak 🔥
          </div>
        )}
      </div>

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #6366f1 100%)' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">Daily Goal Tracker</span>
            </div>
            <h2 className="font-bold text-2xl sm:text-3xl mb-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
              Keep the momentum going!
            </h2>
            <p className="text-white/75 text-sm max-w-md">
              Pick a topic and difficulty for a focused practice session, or jump into today's challenge.
            </p>
            {/* Progress bar */}
            <div className="mt-4 max-w-xs">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Weekly progress</span>
                <span>{weeklyCompleted}/{weeklyGoal} sessions</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${Math.min(100, (weeklyCompleted / weeklyGoal) * 100)}%` }} />
              </div>
            </div>
          </div>
          <Link to="/app/mock-interview"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
            <Play className="w-4 h-4" style={{ color: '#7c3aed' }} />
            Start a Practice
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Brain}
          value={totalInterviews}
          label="Total Interviews"
          bg="linear-gradient(135deg, #f5f3ff, #ede9fe)"
          iconBg="rgba(124,58,237,0.15)"
          iconColor="#7c3aed"
          textColor="#2e1065"
        />
        <StatCard
          icon={Target}
          value={`${weeklyCompleted}/${weeklyGoal}`}
          label="Weekly Goal"
          bg="linear-gradient(135deg, #eff9ff, #def2ff)"
          iconBg="rgba(6,165,241,0.15)"
          iconColor="#0084d1"
          textColor="#072f4a"
        />
        <StatCard
          icon={TrendingUp}
          value={avgScore !== null ? `${avgScore}%` : '—'}
          label="Average Score"
          bg="linear-gradient(135deg, #fff8ed, #ffefd4)"
          iconBg="rgba(255,125,17,0.15)"
          iconColor="#c74a08"
          textColor="#451706"
        />
        <StatCard
          icon={Flame}
          value={profile?.streak_count || 0}
          label="Streak"
          bg="linear-gradient(135deg, #fff1f2, #ffe4e6)"
          iconBg="rgba(239,68,68,0.15)"
          iconColor="#dc2626"
          textColor="#450a0a"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="font-display font-bold text-lg mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((a) => (
            <Link to={a.to} key={a.to}>
              <div
                className="group h-full rounded-2xl p-5 text-white cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: a.gradient, boxShadow: `0 4px 20px ${a.shadow}` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <a.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-base text-white mb-1" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                  {a.label}
                </h3>
                <p className="text-white/80 text-sm">{a.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom Grid: Recent Sessions + Performance ── */}
      <div className={cn("grid gap-6", avgScore !== null && avgScore > 0 ? "lg:grid-cols-3" : "grid-cols-1")}>

        {/* Recent Sessions */}
        <div className={avgScore !== null && avgScore > 0 ? "lg:col-span-2" : "col-span-1"}>
          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                Recent Sessions
              </h2>
              <Link to="/app/history"
                className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: '#7c3aed' }}>
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="No interviews yet"
                description="Start your first practice session to see your history here."
                action={
                  <Link to="/app/mock-interview">
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                      Start Practicing
                    </button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 6).map((s) => {
                  const typeColors = {
                    mock: { bg: '#f5f3ff', icon: '#7c3aed', Icon: Brain },
                    hr: { bg: '#eff9ff', icon: '#0084d1', Icon: Mic },
                    aptitude: { bg: '#eefcf5', icon: '#059669', Icon: Calculator },
                    reasoning: { bg: '#f5f3ff', icon: '#7c3aed', Icon: Puzzle },
                  };
                  const tc = typeColors[s.type] || { bg: '#f6f7f9', icon: '#5d6880', Icon: Brain };
                  const SessionIcon = tc.Icon;
                  return (
                    <div key={s.id}
                      onClick={() => setSelectedSession(s)}
                      className="flex items-center gap-4 p-3.5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-ink-800 hover:bg-gray-50 dark:hover:bg-ink-800/50 transition-all cursor-pointer group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tc.bg }}>
                        <SessionIcon className="w-5 h-5" style={{ color: tc.icon }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {s.skill || s.topic || 'Practice'}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{s.type} interview</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(s.created_at)}
                          </span>
                          {s.duration_seconds && <span>{formatDuration(s.duration_seconds)}</span>}
                          {s.role && <span className="truncate max-w-[120px]">({s.role})</span>}
                        </div>
                      </div>
                      {s.score !== null && (
                        <div
                          className="px-2.5 py-1 rounded-lg text-sm font-bold flex-shrink-0"
                          style={{
                            background: s.score >= 80 ? '#f5f3ff' : s.score >= 60 ? '#fff8ed' : '#fff1f2',
                            color: s.score >= 80 ? '#5b21b6' : s.score >= 60 ? '#451706' : '#450a0a',
                          }}
                        >
                          {Math.round(s.score)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Performance Ring */}
        {avgScore !== null && avgScore > 0 && (
          <div className="space-y-5">
            <div className="card-surface p-5 flex flex-col items-center text-center">
              <h3 className="font-display font-bold text-base mb-4 text-gray-900 dark:text-white">
                Your Performance
              </h3>
              <ScoreRing score={avgScore} size={120} />
              <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
                {avgScore >= 80 ? '🎉 Excellent work!' : avgScore >= 60 ? '📈 Good progress!' : '💪 Keep practicing!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Session Modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto scrollbar-thin shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">
                  {selectedSession.skill || selectedSession.topic || 'Interview Session'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Duration: {formatDuration(selectedSession.duration_seconds || 0)} • Difficulty: {selectedSession.difficulty || 'Medium'}
                  {selectedSession.role && ` • Role: ${selectedSession.role}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedSession.score !== null && (
                <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <ScoreRing score={selectedSession.score} size={110} />
                  <p className="text-xs font-semibold text-gray-600 mt-2">
                    Overall Interview Score: <strong>{Math.round(selectedSession.score)}%</strong>
                  </p>
                </div>
              )}

              {/* Session Summary */}
              {(() => {
                const summary = getSessionSummary(selectedSession);
                return summary && summary.text ? (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-gray-900 text-sm">
                        Session Summary
                      </h3>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', summary.verdictColor)}>
                        {summary.verdict}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-800 leading-relaxed">{summary.text}</p>
                    </div>
                  </div>
                ) : null;
              })()}

              {selectedSession.questions && selectedSession.questions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-gray-900 text-base">
                    Interview Questions & Evaluation Breakdown
                  </h3>
                  {selectedSession.questions.map((qa, i) => {
                    const questionText = typeof qa === 'string' ? qa : qa.question || `Question ${i + 1}`;
                    const answerText = typeof qa === 'object' ? qa.answer : (selectedSession.answers && selectedSession.answers[i]) || '(No response)';
                    const score = typeof qa === 'object' ? qa.score : null;
                    const verdict = typeof qa === 'object' ? qa.verdict : null;
                    const feedback = typeof qa === 'object' ? (qa.feedback || qa.actual_answer || qa.explanation) : null;

                    return (
                      <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-gray-900">
                            {i + 1}. {questionText}
                          </p>
                          {score !== null && score !== undefined && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 flex-shrink-0">
                              {score}% {verdict ? `(${verdict})` : ''}
                            </span>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Your Response
                          </p>
                          <p className="text-xs text-gray-800 leading-relaxed">{answerText}</p>
                        </div>

                        {feedback && (
                          <div className="bg-violet-50/70 dark:bg-violet-950/40 rounded-xl p-3 border border-violet-100 dark:border-violet-900/50 text-xs text-violet-950 dark:text-violet-200">
                            <p className="font-bold text-violet-800 dark:text-violet-300 mb-0.5">AI Feedback</p>
                            <p className="text-gray-800 dark:text-slate-200 leading-relaxed">{feedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">No detailed question responses recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
