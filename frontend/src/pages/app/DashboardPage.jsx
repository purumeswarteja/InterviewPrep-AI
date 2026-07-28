import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Mic, FileText, TrendingUp, Flame, Target, Award,
  ArrowRight, Clock, Play, Zap, ChevronRight, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ScoreRing, EmptyState } from '../../components/ui';
import { timeAgo, formatDuration } from '../../lib/utils';
import { dailyChallengeQuestions } from '../../data/questions';

const quickActions = [
  {
    to: '/app/mock-interview',
    icon: Brain,
    label: 'AI Mock Interview',
    desc: 'Technical deep-dive questions',
    gradient: 'linear-gradient(135deg, #16b079, #0c8f63)',
    shadow: 'rgba(22,176,121,0.35)',
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
    to: '/app/voice-interview',
    icon: Mic,
    label: 'Voice Interview',
    desc: 'Speak your answers aloud',
    gradient: 'linear-gradient(135deg, #ff7d11, #f06307)',
    shadow: 'rgba(255,125,17,0.35)',
  },
  {
    to: '/app/resume-analyzer',
    icon: FileText,
    label: 'Resume Analyzer',
    desc: 'ATS score & smart feedback',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    shadow: 'rgba(124,58,237,0.35)',
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

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [todayQuestion, setTodayQuestion] = useState(dailyChallengeQuestions[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dayIdx = new Date().getDate() % dailyChallengeQuestions.length;
    setTodayQuestion(dailyChallengeQuestions[dayIdx]);
    if (user) {
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
  const avgScore = profile?.avg_score ? Math.round(profile.avg_score) : null;
  const totalInterviews = profile?.total_interviews || 0;
  const bestStreak = profile?.longest_streak || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-7 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl" style={{ color: '#0c0f1a', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-base">Ready to sharpen your interview skills today?</p>
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
        style={{ background: 'linear-gradient(135deg, #0c4b3a 0%, #16b079 50%, #06a5f1 100%)' }}>
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
            <Play className="w-4 h-4" style={{ color: '#16b079' }} />
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
          bg="linear-gradient(135deg, #eefcf5, #d6f8e9)"
          iconBg="rgba(22,176,121,0.15)"
          iconColor="#0c8f63"
          textColor="#042a20"
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
          value={bestStreak}
          label="Best Streak"
          bg="linear-gradient(135deg, #fff1f2, #ffe4e6)"
          iconBg="rgba(239,68,68,0.15)"
          iconColor="#dc2626"
          textColor="#450a0a"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="font-bold text-lg mb-4" style={{ color: '#0c0f1a', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* ── Bottom Grid: Recent Sessions + Sidebar ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color: '#0c0f1a', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                Recent Sessions
              </h2>
              <Link to="/app/history"
                className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: '#0c8f63' }}>
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
                      style={{ background: 'linear-gradient(135deg, #16b079, #06a5f1)' }}>
                      Start Practicing
                    </button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 6).map((s) => {
                  const typeColors = {
                    mock: { bg: '#eefcf5', icon: '#0c8f63' },
                    hr: { bg: '#eff9ff', icon: '#0084d1' },
                    voice: { bg: '#fff8ed', icon: '#c74a08' },
                  };
                  const tc = typeColors[s.type] || { bg: '#f6f7f9', icon: '#5d6880' };
                  return (
                    <div key={s.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-default">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tc.bg }}>
                        <Brain className="w-5 h-5" style={{ color: tc.icon }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: '#0c0f1a' }}>{s.topic}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: '#5d6880' }}>
                          <span className="capitalize">{s.type} interview</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(s.created_at)}
                          </span>
                          {s.duration_seconds && <span>{formatDuration(s.duration_seconds)}</span>}
                        </div>
                      </div>
                      {s.score !== null && (
                        <div
                          className="px-2.5 py-1 rounded-lg text-sm font-bold flex-shrink-0"
                          style={{
                            background: s.score >= 80 ? '#eefcf5' : s.score >= 60 ? '#fff8ed' : '#fff1f2',
                            color: s.score >= 80 ? '#0c4b3a' : s.score >= 60 ? '#451706' : '#450a0a',
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

        {/* Right Sidebar */}
        <div className="space-y-5">

          {/* Daily Challenge */}
          <div className="rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #1f2333, #323748)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="font-bold" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Daily Challenge</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-300 mb-4">{todayQuestion}</p>
            <Link to="/app/mock-interview">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors">
                <Play className="w-4 h-4" style={{ color: '#16b079' }} />
                Take Challenge
              </button>
            </Link>
          </div>

          {/* Performance Ring */}
          {profile && profile.avg_score > 0 && (
            <div className="card-surface p-5 flex flex-col items-center text-center">
              <h3 className="font-bold text-base mb-4" style={{ color: '#0c0f1a', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                Your Performance
              </h3>
              <ScoreRing score={profile.avg_score} size={120} />
              <p className="text-sm mt-3" style={{ color: '#5d6880' }}>
                {profile.avg_score >= 80 ? '🎉 Excellent work!' : profile.avg_score >= 60 ? '📈 Good progress!' : '💪 Keep practicing!'}
              </p>
            </div>
          )}

          {/* Achievements */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: '#16b079' }} />
              <h2 className="font-bold text-base" style={{ color: '#0c0f1a', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                Achievements
              </h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'First Interview', earned: totalInterviews >= 1, icon: '🎯' },
                { label: '5-Day Streak', earned: bestStreak >= 5, icon: '🔥' },
                { label: '10 Interviews', earned: totalInterviews >= 10, icon: '🏆' },
                { label: 'High Scorer (80+)', earned: (profile?.avg_score || 0) >= 80, icon: '⭐' },
              ].map((a) => (
                <div
                  key={a.label}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                  style={{ background: a.earned ? '#eefcf5' : '#f6f7f9' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: a.earned ? 'rgba(22,176,121,0.15)' : 'rgba(0,0,0,0.06)', opacity: a.earned ? 1 : 0.5 }}
                  >
                    {a.icon}
                  </div>
                  <span className="text-sm font-medium" style={{ color: a.earned ? '#0c4b3a' : '#7e899e' }}>
                    {a.label}
                  </span>
                  {a.earned && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#16b079' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
