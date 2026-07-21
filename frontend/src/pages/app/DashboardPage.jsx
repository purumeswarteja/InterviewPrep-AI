import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Mic,
  FileText,
  TrendingUp,
  Flame,
  Target,
  Award,
  ArrowRight,
  Clock,
  Play,
  Zap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button, ProgressBar, ScoreRing, EmptyState } from "../../components/ui";
import { cn, timeAgo, formatDuration, scoreColor } from "../../lib/utils";
import { dailyChallengeQuestions } from "../../data/questions";
const quickActions = [
  { to: "/app/mock-interview", icon: Brain, label: "AI Mock Interview", desc: "Practice technical questions", color: "from-brand-500 to-sky-500" },
  { to: "/app/hr-interview", icon: Mic, label: "HR Interview", desc: "Behavioral & HR round prep", color: "from-sky-500 to-brand-400" },
  { to: "/app/voice-interview", icon: Mic, label: "Voice Interview", desc: "Speak your answers aloud", color: "from-accent-500 to-accent-400" },
  { to: "/app/resume-analyzer", icon: FileText, label: "Resume Analyzer", desc: "ATS score & feedback", color: "from-brand-400 to-accent-400" }
];
function DashboardPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [todayQuestion, setTodayQuestion] = useState(dailyChallengeQuestions[0]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const dayIdx = (/* @__PURE__ */ new Date()).getDate() % dailyChallengeQuestions.length;
    setTodayQuestion(dailyChallengeQuestions[dayIdx]);
    if (user) {
      api.getSessions().then((response) => {
        if (!response.error) {
          setSessions(response.sessions || []);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const weeklyCompleted = sessions.filter((s) => {
    const d = new Date(s.created_at);
    const weekAgo = /* @__PURE__ */ new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d > weekAgo;
  }).length;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto space-y-6 animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: [
          "Welcome back, ",
          firstName,
          "!"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Ready to sharpen your interview skills today?" })
      ] }),
      profile?.streak_count ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-50 text-accent-700 border border-accent-200", children: [
        /* @__PURE__ */ jsx(Flame, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
          profile.streak_count,
          " day streak"
        ] })
      ] }) : null
    ] }),
    /* Hero banner with color */
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-6 bg-gradient-to-r from-brand-500 via-sky-500 to-accent-500 text-white shadow-lg", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-2xl", children: "Keep the momentum going" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm opacity-90", children: "Pick a topic and difficulty for a focused practice session, or take today's challenge." })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/app/mock-interview", className: "inline-block mt-4", children: /* @__PURE__ */ jsx(Button, { className: "bg-white text-ink-900 shadow-sm", children: "Start a Practice" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "bg-gradient-to-br from-brand-50 to-brand-100 border-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-brand-600" }) }) }),
        /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl text-brand-700", children: profile?.total_interviews || 0 }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-600", children: "Total Interviews" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "bg-gradient-to-br from-sky-50 to-sky-100 border-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(Target, { className: "w-5 h-5 text-sky-600" }) }) }),
        /* @__PURE__ */ jsxs("p", { className: "font-display font-bold text-2xl text-sky-700", children: [
          weeklyCompleted,
          "/",
          profile?.weekly_goal || 5
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-sky-600", children: "Weekly Goal" }),
        /* @__PURE__ */ jsx(ProgressBar, { value: weeklyCompleted, max: profile?.weekly_goal || 5, color: "sky", className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "bg-gradient-to-br from-accent-50 to-accent-100 border-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5 text-accent-600" }) }) }),
        /* @__PURE__ */ jsx("p", { className: cn("font-display font-bold text-2xl", scoreColor(profile?.avg_score || 0)), children: profile?.avg_score ? Math.round(profile.avg_score) : "\u2014" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-accent-600", children: "Avg Score" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "bg-gradient-to-br from-rose-50 to-rose-100 border-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(Flame, { className: "w-5 h-5 text-brand-600" }) }) }),
        /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl text-rose-700", children: profile?.longest_streak || 0 }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600", children: "Best Streak" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Quick Actions" }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4", children: quickActions.map((a) => /* @__PURE__ */ jsx(Link, { to: a.to, children: /* @__PURE__ */ jsxs("div", { className: cn("group h-full rounded-xl p-5 shadow-lg transition-transform transform hover:-translate-y-1", a.color && "bg-gradient-to-br text-white"), children: [
        /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`, children: /* @__PURE__ */ jsx(a.icon, { className: "w-6 h-6 text-white" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-white", children: a.label }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90 mt-1", children: a.desc }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-white/90", children: [
          "Start ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
        ] })
      ] }) }, a.to)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "Recent Sessions" }),
          /* @__PURE__ */ jsxs(Link, { to: "/app/history", className: "text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1", children: [
            "View all ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
          ] })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-20 rounded-xl bg-ink-100 animate-pulse" }, i)) }) : sessions.length === 0 ? /* @__PURE__ */ jsx(
          EmptyState,
          {
            icon: Brain,
            title: "No interviews yet",
            description: "Start your first practice session to see your history here.",
            action: /* @__PURE__ */ jsx(Link, { to: "/app/mock-interview", children: /* @__PURE__ */ jsx(Button, { children: "Start Practicing" }) })
          }
        ) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sessions.map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50 transition-all", children: [
          /* @__PURE__ */ jsx("div", { className: cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            s.type === "mock" ? "bg-brand-100" : s.type === "hr" ? "bg-sky-100" : s.type === "voice" ? "bg-accent-100" : "bg-ink-100"
          ), children: s.type === "mock" ? /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-brand-600" }) : s.type === "hr" ? /* @__PURE__ */ jsx(Mic, { className: "w-5 h-5 text-sky-600" }) : s.type === "voice" ? /* @__PURE__ */ jsx(Mic, { className: "w-5 h-5 text-accent-600" }) : /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-ink-600" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-sm text-ink-900 truncate", children: s.topic }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-0.5 text-xs text-ink-500", children: [
              /* @__PURE__ */ jsxs("span", { className: "capitalize", children: [
                s.type,
                " interview"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                timeAgo(s.created_at)
              ] }),
              s.duration_seconds && /* @__PURE__ */ jsx("span", { children: formatDuration(s.duration_seconds) })
            ] })
          ] }),
          s.score !== null && /* @__PURE__ */ jsx("div", { className: cn("px-2.5 py-1 rounded-lg text-sm font-semibold", s.score >= 80 ? "bg-brand-100 text-brand-700" : s.score >= 60 ? "bg-accent-100 text-accent-700" : "bg-red-100 text-red-700"), children: Math.round(s.score) })
        ] }, s.id)) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "bg-gradient-to-br from-ink-900 to-ink-800 text-white border-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5 text-accent-400" }),
            /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold", children: "Daily Challenge" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-300 leading-relaxed mb-4", children: todayQuestion }),
          /* @__PURE__ */ jsx(Link, { to: "/app/mock-interview", children: /* @__PURE__ */ jsxs(Button, { className: "w-full bg-white text-ink-900 hover:bg-ink-100", children: [
            /* @__PURE__ */ jsx(Play, { className: "w-4 h-4" }),
            "Take Challenge"
          ] }) })
        ] }),
        profile && profile.avg_score > 0 && /* @__PURE__ */ jsxs(Card, { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-ink-900 mb-3", children: "Your Performance" }),
          /* @__PURE__ */ jsx(ScoreRing, { score: profile.avg_score, size: 120 }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500 mt-3", children: profile.avg_score >= 80 ? "Excellent work!" : profile.avg_score >= 60 ? "Good progress!" : "Keep practicing!" })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Award, { className: "w-5 h-5 text-brand-500" }),
            /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-ink-900", children: "Achievements" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
            { label: "First Interview", earned: (profile?.total_interviews || 0) >= 1 },
            { label: "5-Day Streak", earned: (profile?.longest_streak || 0) >= 5 },
            { label: "10 Interviews", earned: (profile?.total_interviews || 0) >= 10 },
            { label: "High Scorer (80+)", earned: (profile?.avg_score || 0) >= 80 }
          ].map((a) => /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-3 p-2.5 rounded-lg", a.earned ? "bg-brand-50" : "bg-ink-50"), children: [
            /* @__PURE__ */ jsx("div", { className: cn("w-8 h-8 rounded-lg flex items-center justify-center", a.earned ? "bg-brand-200" : "bg-ink-200"), children: /* @__PURE__ */ jsx(Award, { className: cn("w-4 h-4", a.earned ? "text-brand-700" : "text-ink-400") }) }),
            /* @__PURE__ */ jsx("span", { className: cn("text-sm font-medium", a.earned ? "text-brand-700" : "text-ink-400"), children: a.label })
          ] }, a.label)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DashboardPage as default
};
