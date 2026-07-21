import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Brain, Mic, FileText, Clock, Trash2, Eye, X, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, Button, Badge, EmptyState, ScoreRing } from '../../components/ui';
import { cn, timeAgo, formatDuration, formatDate, scoreColor } from '../../lib/utils';
const filters = [
    { id: 'all', label: 'All' },
    { id: 'mock', label: 'Mock' },
    { id: 'hr', label: 'HR' },
    { id: 'voice', label: 'Voice' },
];
export default function HistoryPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        supabase
            .from('interview_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
            setSessions(data || []);
            setLoading(false);
        });
    }, [user]);
    const filtered = filter === 'all' ? sessions : sessions.filter((s) => s.type === filter);
    const handleDelete = async (id) => {
        const { error } = await supabase.from('interview_sessions').delete().eq('id', id);
        if (error) {
            toast.error('Failed to delete session.');
        }
        else {
            setSessions((prev) => prev.filter((s) => s.id !== id));
            toast.success('Session deleted.');
        }
    };
    const typeIcon = (type) => type === 'mock' ? Brain : type === 'hr' || type === 'voice' ? Mic : FileText;
    return (_jsxs("div", { className: "max-w-5xl mx-auto animate-fade-in", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Interview History" }), _jsx("p", { className: "text-ink-500 mt-1", children: "Review all your past practice sessions and track your progress." })] }), _jsx("div", { className: "flex gap-2 mb-6 overflow-x-auto scrollbar-thin", children: filters.map((f) => (_jsx("button", { onClick: () => setFilter(f.id), className: cn('px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap', filter === f.id ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'), children: f.label }, f.id))) }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3, 4].map((i) => (_jsx("div", { className: "h-24 rounded-2xl bg-ink-100 animate-pulse" }, i))) })) : filtered.length === 0 ? (_jsx(Card, { children: _jsx(EmptyState, { icon: History, title: "No sessions found", description: filter === 'all' ? 'Start your first interview practice session to see it here.' : `No ${filter} interviews yet. Try one now!`, action: _jsx(Link, { to: "/app/mock-interview", children: _jsx(Button, { children: "Start Interview" }) }) }) })) : (_jsx("div", { className: "space-y-3", children: filtered.map((s) => {
                    const Icon = typeIcon(s.type);
                    return (_jsx(Card, { hover: true, className: "group", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', s.type === 'mock' ? 'bg-brand-100' : s.type === 'hr' ? 'bg-sky-100' : s.type === 'voice' ? 'bg-accent-100' : 'bg-ink-100'), children: _jsx(Icon, { className: cn('w-6 h-6', s.type === 'mock' ? 'text-brand-600' : s.type === 'hr' ? 'text-sky-600' : s.type === 'voice' ? 'text-accent-600' : 'text-ink-600') }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-semibold text-ink-900 truncate", children: s.topic }), _jsx(Badge, { color: s.type === 'mock' ? 'brand' : s.type === 'hr' ? 'sky' : 'accent', className: "capitalize", children: s.type })] }), _jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-ink-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), timeAgo(s.created_at)] }), s.duration_seconds && _jsx("span", { children: formatDuration(s.duration_seconds) }), _jsx("span", { className: "capitalize", children: s.difficulty })] })] }), s.score !== null && (_jsxs("div", { className: cn('text-center flex-shrink-0', scoreColor(s.score)), children: [_jsx("p", { className: "font-display font-bold text-xl", children: Math.round(s.score) }), _jsx("p", { className: "text-xs text-ink-500", children: "score" })] })), _jsxs("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => setSelected(s), className: "p-2 rounded-lg hover:bg-ink-100 text-ink-500", title: "View", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(s.id), className: "p-2 rounded-lg hover:bg-red-50 text-red-500", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, s.id));
                }) })), selected && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm", onClick: () => setSelected(null), children: _jsxs("div", { className: "bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-thin", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-ink-100 p-5 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display font-bold text-xl text-ink-950", children: selected.topic }), _jsxs("p", { className: "text-sm text-ink-500", children: [formatDate(selected.created_at), " \u2022 ", formatDuration(selected.duration_seconds || 0)] })] }), _jsx("button", { onClick: () => setSelected(null), className: "p-2 rounded-lg hover:bg-ink-100", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-5 space-y-4", children: [_jsx("div", { className: "flex justify-center", children: _jsx(ScoreRing, { score: selected.score || 0, size: 120 }) }), selected.questions && selected.questions.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-display font-semibold text-ink-900", children: "Questions & Answers" }), selected.questions.map((qa, i) => (_jsxs("div", { className: "border border-ink-100 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [_jsxs("p", { className: "text-sm font-medium text-ink-900", children: [i + 1, ". ", qa.question] }), _jsx("span", { className: cn('px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0', qa.score >= 80 ? 'bg-brand-100 text-brand-700' : qa.score >= 60 ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-700'), children: qa.score })] }), _jsx("p", { className: "text-sm text-ink-600 bg-ink-50 rounded-lg p-3 mt-2", children: qa.answer }), _jsxs("p", { className: "text-xs text-brand-600 mt-2 flex items-start gap-1", children: [_jsx(Award, { className: "w-3.5 h-3.5 flex-shrink-0 mt-0.5" }), qa.feedback] })] }, i)))] }))] })] }) }))] }));
}
