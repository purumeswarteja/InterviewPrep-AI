import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Award,
  Target,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, EmptyState, ProgressBar } from "../../components/ui";
import { cn, scoreColor } from "../../lib/utils";
const COLORS = ["#16b079", "#06a5f1", "#ff7d11", "#3a4156"];
function AnalyticsPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    api.getAnalytics().then((response) => {
      if (!response.error) {
        setSessions(response.sessions || []);
      }
      setLoading(false);
    });
  }, [user]);
  const stats = useMemo(() => {
    const total = sessions.length;
    const avgScore = total ? sessions.reduce((s, x) => s + (x.score || 0), 0) / total : 0;
    const totalDuration = sessions.reduce((s, x) => s + (x.duration_seconds || 0), 0);
    const byType = {};
    sessions.forEach((s) => {
      byType[s.type] = (byType[s.type] || 0) + 1;
    });
    const byTopic = {};
    sessions.forEach((s) => {
      if (!byTopic[s.topic]) byTopic[s.topic] = { count: 0, avg: 0 };
      byTopic[s.topic].count++;
      byTopic[s.topic].avg += s.score || 0;
    });
    Object.keys(byTopic).forEach((k) => {
      byTopic[k].avg = byTopic[k].avg / byTopic[k].count;
    });
    return { total, avgScore, totalDuration, byType, byTopic };
  }, [sessions]);
  const trendData = useMemo(() => {
    const recent = sessions.slice(-10);
    return recent.map((s, i) => ({
      name: `#${i + 1}`,
      score: Math.round(s.score || 0),
      topic: s.topic
    }));
  }, [sessions]);
  const typeData = useMemo(() => {
    return Object.entries(stats.byType).map(([name, value]) => ({ name, value }));
  }, [stats]);
  const topicData = useMemo(() => {
    return Object.entries(stats.byTopic).map(([name, v]) => ({ name, score: Math.round(v.avg), count: v.count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [stats]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-ink-100 rounded-lg animate-pulse" }),
      [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-64 bg-ink-100 rounded-2xl animate-pulse" }, i))
    ] });
  }
  if (sessions.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950 mb-6", children: "Performance Analytics" }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: BarChart3,
          title: "No data yet",
          description: "Complete a few interview sessions to unlock detailed analytics and insights."
        }
      ) })
    ] });
  }
  const fmtDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor(s % 3600 / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto animate-fade-in space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Performance Analytics" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Track your progress and identify areas for improvement." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-brand-600" }) }),
        /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl text-ink-950", children: stats.total }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: "Total Sessions" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5 text-sky-600" }) }),
        /* @__PURE__ */ jsx("p", { className: cn("font-display font-bold text-2xl", scoreColor(stats.avgScore)), children: Math.round(stats.avgScore) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: "Average Score" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-accent-600" }) }),
        /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl text-ink-950", children: fmtDuration(stats.totalDuration) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: "Total Practice Time" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(Award, { className: "w-5 h-5 text-brand-600" }) }),
        /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl text-ink-950", children: sessions.filter((s) => (s.score || 0) >= 80).length }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: "High Scores (80+)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Score Trend" }),
      /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(LineChart, { data: trendData, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eceef2" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "#7e899e", fontSize: 12 }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], stroke: "#7e899e", fontSize: 12 }),
        /* @__PURE__ */ jsx(
          Tooltip,
          {
            contentStyle: { borderRadius: "12px", border: "1px solid #eceef2", fontSize: "13px" }
          }
        ),
        /* @__PURE__ */ jsx(
          Line,
          {
            type: "monotone",
            dataKey: "score",
            stroke: "#16b079",
            strokeWidth: 3,
            dot: { fill: "#16b079", r: 5 },
            activeDot: { r: 7 }
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Sessions by Type" }),
        typeData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: typeData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 90, label: true, children: typeData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { borderRadius: "12px", border: "1px solid #eceef2", fontSize: "13px" } })
        ] }) }) : /* @__PURE__ */ jsx("p", { className: "text-ink-500 text-sm", children: "No data" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Topic Performance" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(BarChart, { data: topicData, layout: "vertical", children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eceef2", horizontal: false }),
          /* @__PURE__ */ jsx(XAxis, { type: "number", domain: [0, 100], stroke: "#7e899e", fontSize: 12 }),
          /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "name", stroke: "#7e899e", fontSize: 11, width: 90 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { borderRadius: "12px", border: "1px solid #eceef2", fontSize: "13px" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "score", radius: [0, 6, 6, 0], children: topicData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Target, { className: "w-5 h-5 text-brand-500" }),
        " Goals & Progress"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-ink-700", children: "Weekly Goal" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-ink-500", children: [
              sessions.filter((s) => {
                const d = new Date(s.created_at);
                const w = /* @__PURE__ */ new Date();
                w.setDate(w.getDate() - 7);
                return d > w;
              }).length,
              " / ",
              profile?.weekly_goal || 5
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            ProgressBar,
            {
              value: sessions.filter((s) => {
                const d = new Date(s.created_at);
                const w = /* @__PURE__ */ new Date();
                w.setDate(w.getDate() - 7);
                return d > w;
              }).length,
              max: profile?.weekly_goal || 5,
              color: "brand"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-ink-700", children: "Monthly Goal" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-ink-500", children: [
              sessions.filter((s) => {
                const d = new Date(s.created_at);
                const m = /* @__PURE__ */ new Date();
                m.setDate(m.getDate() - 30);
                return d > m;
              }).length,
              " / ",
              profile?.monthly_goal || 20
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            ProgressBar,
            {
              value: sessions.filter((s) => {
                const d = new Date(s.created_at);
                const m = /* @__PURE__ */ new Date();
                m.setDate(m.getDate() - 30);
                return d > m;
              }).length,
              max: profile?.monthly_goal || 20,
              color: "sky"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  AnalyticsPage as default
};
