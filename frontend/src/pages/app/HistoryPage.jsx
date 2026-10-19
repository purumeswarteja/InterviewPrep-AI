import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Brain, Mic, Clock, Trash2, X, FileText, Calculator, Puzzle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, Badge, EmptyState, ScoreRing } from '../../components/ui';
import { cn, timeAgo, formatDuration, formatDate, scoreColor } from '../../lib/utils';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'mock', label: 'Mock' },
  { id: 'hr', label: 'HR' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'reasoning', label: 'Reasoning' }
];

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
      verdictColor = 'bg-emerald-100 text-emerald-800';
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

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.getSessions().then((response) => {
      if (!response.error) {
        setSessions(response.sessions || []);
      }
      setLoading(false);
    });
  }, [user]);

  const filtered = filter === 'all' ? sessions : sessions.filter((s) => s.type === filter);

  const handleDelete = async (id) => {
    const response = await api.deleteSession(id);
    if (response.error) {
      toast.error('Failed to delete session.');
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Session deleted.');
    }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'mock': return Brain;
      case 'hr': return Mic;
      case 'aptitude': return Calculator;
      case 'reasoning': return Puzzle;
      default: return FileText;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">Interview History</h1>
        <p className="text-gray-500 mt-1 text-sm">Review all your past practice sessions and track your performance.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              filter === f.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={History}
            title="No sessions found"
            description={filter === 'all' ? 'Start your first interview practice session to see it here.' : `No ${filter} interviews yet. Try one now!`}
            action={
              <Link to="/app/mock-interview">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Start Mock Interview</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const Icon = typeIcon(s.type);
            const topicText = s.skill || s.topic || 'Practice';
            const roleText = s.role;

            return (
              <Card key={s.id} hover className="group cursor-pointer" onClick={() => setSelected(s)}>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelected(s)}>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      s.type === 'mock'
                        ? 'bg-emerald-100 text-emerald-700'
                        : s.type === 'hr'
                        ? 'bg-sky-100 text-sky-700'
                        : s.type === 'aptitude'
                        ? 'bg-teal-100 text-teal-700'
                        : s.type === 'reasoning'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate text-base">{topicText}</p>
                      <Badge color={s.type === 'mock' ? 'brand' : s.type === 'hr' ? 'sky' : s.type === 'aptitude' ? 'brand' : 'accent'} className="capitalize">
                        {s.type}
                      </Badge>
                      {roleText && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium hidden sm:inline-block">
                          Role: {roleText}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {timeAgo(s.created_at)}
                      </span>
                      {s.duration_seconds && <span>{formatDuration(s.duration_seconds)}</span>}
                      <span className="capitalize font-medium text-gray-600">{s.difficulty || 'Medium'}</span>
                    </div>
                  </div>

                  {s.score !== null && (
                    <div className={cn('text-center flex-shrink-0 px-3 py-1.5 rounded-xl border', scoreColor(s.score))}>
                      <p className="font-display font-bold text-lg leading-tight">{Math.round(s.score)}%</p>
                      <p className="text-[10px] uppercase font-semibold opacity-75">score</p>
                    </div>
                  )}

                  <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail View Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto scrollbar-thin shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">
                  {selected.skill || selected.topic || 'Interview Session'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Duration: {formatDuration(selected.duration_seconds || 0)} • Difficulty: {selected.difficulty || 'Medium'}
                  {selected.role && ` • Role: ${selected.role}`}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {selected.score !== null && (
                <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <ScoreRing score={selected.score} size={110} />
                  <p className="text-xs font-semibold text-gray-600 mt-2">
                    Overall Interview Score: <strong>{Math.round(selected.score)}%</strong>
                  </p>
                </div>
              )}

              {/* Session Summary */}
              {(() => {
                const summary = getSessionSummary(selected);
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

              {selected.questions && selected.questions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-gray-900 text-base">
                    Interview Questions & Evaluation Breakdown
                  </h3>
                  {selected.questions.map((qa, i) => {
                    const questionText = typeof qa === 'string' ? qa : qa.question || `Question ${i + 1}`;
                    const answerText = typeof qa === 'object' ? qa.answer : (selected.answers && selected.answers[i]) || '(No response)';
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
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex-shrink-0">
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
                          <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-100 text-xs text-emerald-950">
                            <p className="font-bold text-emerald-800 mb-0.5">AI Feedback</p>
                            <p className="text-gray-800 leading-relaxed">{feedback}</p>
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
