import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Brain, Award, Target, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, EmptyState, ProgressBar } from '../../components/ui';
import { cn, scoreColor } from '../../lib/utils';
const COLORS = ['#16b079', '#06a5f1', '#ff7d11', '#3a4156'];
export default function AnalyticsPage() {
    const { user, profile } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        supabase
            .from('interview_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
            setSessions(data || []);
            setLoading(false);
        });
    }, [user]);
    const stats = useMemo(() => {
        const total = sessions.length;
        const avgScore = total ? sessions.reduce((s, x) => s + (x.score || 0), 0) / total : 0;
        const totalDuration = sessions.reduce((s, x) => s + (x.duration_seconds || 0), 0);
        const byType = {};
        sessions.forEach((s) => { byType[s.type] = (byType[s.type] || 0) + 1; });
        const byTopic = {};
        sessions.forEach((s) => {
            if (!byTopic[s.topic])
                byTopic[s.topic] = { count: 0, avg: 0 };
            byTopic[s.topic].count++;
            byTopic[s.topic].avg += s.score || 0;
        });
        Object.keys(byTopic).forEach((k) => { byTopic[k].avg = byTopic[k].avg / byTopic[k].count; });
        return { total, avgScore, totalDuration, byType, byTopic };
    }, [sessions]);
    const trendData = useMemo(() => {
        const recent = sessions.slice(-10);
        return recent.map((s, i) => ({
            name: `#${i + 1}`,
            score: Math.round(s.score || 0),
            topic: s.topic,
        }));
    }, [sessions]);
    const typeData = useMemo(() => {
        return Object.entries(stats.byType).map(([name, value]) => ({ name, value }));
    }, [stats]);
    const topicData = useMemo(() => {
        return Object.entries(stats.byTopic)
            .map(([name, v]) => ({ name, score: Math.round(v.avg), count: v.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [stats]);
    if (loading) {
        return (_jsxs("div", { className: "max-w-6xl mx-auto space-y-4", children: [_jsx("div", { className: "h-8 w-48 bg-ink-100 rounded-lg animate-pulse" }), [1, 2, 3].map((i) => _jsx("div", { className: "h-64 bg-ink-100 rounded-2xl animate-pulse" }, i))] }));
    }
    if (sessions.length === 0) {
        return (_jsxs("div", { className: "max-w-6xl mx-auto animate-fade-in", children: [_jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950 mb-6", children: "Performance Analytics" }), _jsx(Card, { children: _jsx(EmptyState, { icon: BarChart3, title: "No data yet", description: "Complete a few interview sessions to unlock detailed analytics and insights." }) })] }));
    }
    const fmtDuration = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };
    return (_jsxs("div", { className: "max-w-6xl mx-auto animate-fade-in space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Performance Analytics" }), _jsx("p", { className: "text-ink-500 mt-1", children: "Track your progress and identify areas for improvement." })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3", children: _jsx(Brain, { className: "w-5 h-5 text-brand-600" }) }), _jsx("p", { className: "font-display font-bold text-2xl text-ink-950", children: stats.total }), _jsx("p", { className: "text-sm text-ink-500", children: "Total Sessions" })] }), _jsxs(Card, { children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-3", children: _jsx(TrendingUp, { className: "w-5 h-5 text-sky-600" }) }), _jsx("p", { className: cn('font-display font-bold text-2xl', scoreColor(stats.avgScore)), children: Math.round(stats.avgScore) }), _jsx("p", { className: "text-sm text-ink-500", children: "Average Score" })] }), _jsxs(Card, { children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center mb-3", children: _jsx(Clock, { className: "w-5 h-5 text-accent-600" }) }), _jsx("p", { className: "font-display font-bold text-2xl text-ink-950", children: fmtDuration(stats.totalDuration) }), _jsx("p", { className: "text-sm text-ink-500", children: "Total Practice Time" })] }), _jsxs(Card, { children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3", children: _jsx(Award, { className: "w-5 h-5 text-brand-600" }) }), _jsx("p", { className: "font-display font-bold text-2xl text-ink-950", children: sessions.filter((s) => (s.score || 0) >= 80).length }), _jsx("p", { className: "text-sm text-ink-500", children: "High Scores (80+)" })] })] }), _jsxs(Card, { children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Score Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(LineChart, { data: trendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eceef2" }), _jsx(XAxis, { dataKey: "name", stroke: "#7e899e", fontSize: 12 }), _jsx(YAxis, { domain: [0, 100], stroke: "#7e899e", fontSize: 12 }), _jsx(Tooltip, { contentStyle: { borderRadius: '12px', border: '1px solid #eceef2', fontSize: '13px' } }), _jsx(Line, { type: "monotone", dataKey: "score", stroke: "#16b079", strokeWidth: 3, dot: { fill: '#16b079', r: 5 }, activeDot: { r: 7 } })] }) })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Sessions by Type" }), typeData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: typeData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 90, label: true, children: typeData.map((_, i) => _jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) }), _jsx(Tooltip, { contentStyle: { borderRadius: '12px', border: '1px solid #eceef2', fontSize: '13px' } })] }) })) : _jsx("p", { className: "text-ink-500 text-sm", children: "No data" })] }), _jsxs(Card, { children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Topic Performance" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: topicData, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eceef2", horizontal: false }), _jsx(XAxis, { type: "number", domain: [0, 100], stroke: "#7e899e", fontSize: 12 }), _jsx(YAxis, { type: "category", dataKey: "name", stroke: "#7e899e", fontSize: 11, width: 90 }), _jsx(Tooltip, { contentStyle: { borderRadius: '12px', border: '1px solid #eceef2', fontSize: '13px' } }), _jsx(Bar, { dataKey: "score", radius: [0, 6, 6, 0], children: topicData.map((_, i) => _jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) })] }) })] })] }), _jsxs(Card, { children: [_jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5 text-brand-500" }), " Goals & Progress"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-ink-700", children: "Weekly Goal" }), _jsxs("span", { className: "text-sm text-ink-500", children: [sessions.filter((s) => { const d = new Date(s.created_at); const w = new Date(); w.setDate(w.getDate() - 7); return d > w; }).length, " / ", profile?.weekly_goal || 5] })] }), _jsx(ProgressBar, { value: sessions.filter((s) => { const d = new Date(s.created_at); const w = new Date(); w.setDate(w.getDate() - 7); return d > w; }).length, max: profile?.weekly_goal || 5, color: "brand" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-ink-700", children: "Monthly Goal" }), _jsxs("span", { className: "text-sm text-ink-500", children: [sessions.filter((s) => { const d = new Date(s.created_at); const m = new Date(); m.setDate(m.getDate() - 30); return d > m; }).length, " / ", profile?.monthly_goal || 20] })] }), _jsx(ProgressBar, { value: sessions.filter((s) => { const d = new Date(s.created_at); const m = new Date(); m.setDate(m.getDate() - 30); return d > m; }).length, max: profile?.monthly_goal || 20, color: "sky" })] })] })] })] }));
}
