import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Clock, Check, ArrowRight, RotateCcw, Code, Database, Cloud, GitBranch, Box, Network, Terminal, Atom, TrendingUp, Sparkles, Award, BookOpen, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, Button, Badge, ScoreRing, ProgressBar } from '../../components/ui';
import { cn } from '../../lib/utils';
import { mockQuestionBank, difficultyLevels } from '../../data/questions';
const iconMap = {
    Code, Database, Cloud, GitBranch, Box, Network, Terminal, Atom
};
const topics = Object.keys(mockQuestionBank).map((key) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
    icon: iconMap[key] || Code,
    count: mockQuestionBank[key].length,
}));
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'on', 'at', 'by',
    'for', 'with', 'about', 'as', 'into', 'like', 'through', 'after', 'over',
    'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around',
    'among', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we',
    'our', 'you', 'your', 'he', 'she', 'they', 'them', 'their', 'what', 'which',
    'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don',
    'now', 'from', 'if', 'then', 'also', 'because', 'while', 'here', 'there',
    'use', 'used', 'using', 'one', 'two', 'first', 'second',
]);
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
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
    keywords.forEach((kw) => {
        if (answerLower.includes(kw.toLowerCase()))
            matchedKeywords.push(kw);
        else
            missedKeywords.push(kw);
    });
    const keywordScore = keywords.length > 0 ? (matchedKeywords.length / keywords.length) * 100 : 0;
    let overlap = 0;
    modelTokens.forEach((t) => { if (answerTokens.has(t))
        overlap++; });
    const overlapScore = modelTokens.size > 0 ? Math.min(100, (overlap / modelTokens.size) * 130) : 0;
    const score = Math.round(keywordScore * 0.6 + overlapScore * 0.4);
    let feedback = '';
    if (score >= 85) {
        feedback = `Excellent answer! You covered ${matchedKeywords.length}/${keywords.length} key concepts. Concise and on point.`;
    }
    else if (score >= 65) {
        feedback = `Good answer. You covered ${matchedKeywords.length}/${keywords.length} key concepts. To strengthen it, add: ${missedKeywords.slice(0, 3).join(', ')}.`;
    }
    else if (score >= 40) {
        feedback = `Partial answer. You covered ${matchedKeywords.length}/${keywords.length} key concepts. Missing: ${missedKeywords.slice(0, 4).join(', ')}. Review the model answer below.`;
    }
    else {
        feedback = `This answer needs work. You covered ${matchedKeywords.length}/${keywords.length} key concepts. Focus on: ${missedKeywords.slice(0, 5).join(', ')}.`;
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
    const startInterview = () => {
        const pool = [...mockQuestionBank[topic]];
        const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5);
        setQuestions(shuffled);
        setCurrentIdx(0);
        setAnswers([]);
        setCurrentAnswer('');
        setStage('interview');
        setStartTime(Date.now());
        toast.success('Interview started! Good luck.');
    };
    const submitAnswer = () => {
        if (!currentAnswer.trim()) {
            toast.error('Please write an answer before continuing.');
            return;
        }
        const currentQ = questions[currentIdx];
        const { score, feedback, matchedKeywords } = generateFeedback(currentAnswer, currentQ.a, currentQ.keywords);
        const qa = {
            id: `q-${currentIdx}`,
            question: currentQ.q,
            answer: currentAnswer,
            feedback,
            score,
            model_answer: currentQ.a,
            tags: matchedKeywords,
        };
        const newAnswers = [...answers, qa];
        setAnswers(newAnswers);
        setCurrentAnswer('');
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        }
        else {
            finishInterview(newAnswers);
        }
    };
    const finishInterview = useCallback(async (allAnswers) => {
        setSaving(true);
        const avgScore = allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length;
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (user) {
            const { error } = await supabase.from('interview_sessions').insert({
                user_id: user.id,
                type: 'mock',
                topic,
                difficulty,
                score: avgScore,
                duration_seconds: duration,
                questions: allAnswers,
                answers: allAnswers,
                feedback: { summary: 'AI-generated feedback', avg_score: avgScore },
                status: 'completed',
            });
            if (!error) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (profile) {
                    const newTotal = (profile.total_interviews || 0) + 1;
                    const newAvg = ((profile.avg_score || 0) * (profile.total_interviews || 0) + avgScore) / newTotal;
                    const today = new Date().toISOString().split('T')[0];
                    let streak = profile.streak_count || 0;
                    let longest = profile.longest_streak || 0;
                    if (profile.last_active_date !== today) {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yStr = yesterday.toISOString().split('T')[0];
                        streak = profile.last_active_date === yStr ? streak + 1 : 1;
                        longest = Math.max(longest, streak);
                    }
                    await supabase.from('profiles').update({
                        total_interviews: newTotal,
                        avg_score: newAvg,
                        streak_count: streak,
                        longest_streak: longest,
                        last_active_date: today,
                    }).eq('user_id', user.id);
                    await refreshProfile();
                }
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
        return (_jsxs("div", { className: "max-w-4xl mx-auto animate-fade-in", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "AI Mock Interview" }), _jsx("p", { className: "text-ink-500 mt-1", children: "Choose a topic and difficulty to start your practice session." })] }), _jsxs(Card, { className: "mb-6", children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Select a Topic" }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3", children: topics.map((t) => (_jsxs("button", { onClick: () => setTopic(t.id), className: cn('p-4 rounded-xl border-2 text-left transition-all', topic === t.id ? 'border-brand-400 bg-brand-50' : 'border-ink-200 hover:border-ink-300'), children: [_jsx("div", { className: cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', topic === t.id ? 'bg-brand-500' : 'bg-ink-100'), children: _jsx(t.icon, { className: cn('w-5 h-5', topic === t.id ? 'text-white' : 'text-ink-600') }) }), _jsx("p", { className: "font-medium text-sm text-ink-900", children: t.name }), _jsxs("p", { className: "text-xs text-ink-500 mt-0.5", children: [t.count, " questions"] })] }, t.id))) })] }), _jsxs(Card, { className: "mb-6", children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Select Difficulty" }), _jsx("div", { className: "grid sm:grid-cols-3 gap-3", children: difficultyLevels.map((d) => (_jsxs("button", { onClick: () => setDifficulty(d.id), className: cn('p-4 rounded-xl border-2 text-left transition-all', difficulty === d.id ? 'border-brand-400 bg-brand-50' : 'border-ink-200 hover:border-ink-300'), children: [_jsx("p", { className: "font-semibold text-ink-900", children: d.name }), _jsx("p", { className: "text-xs text-ink-500 mt-1", children: d.description })] }, d.id))) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-ink-500", children: [_jsx(Clock, { className: "w-4 h-4" }), "5 questions \u2022 10-15 minutes"] }), _jsxs(Button, { size: "lg", onClick: startInterview, children: [_jsx(Sparkles, { className: "w-4 h-4" }), "Start Interview"] })] })] }));
    }
    if (stage === 'interview') {
        const progress = ((currentIdx + 1) / questions.length) * 100;
        return (_jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("h1", { className: "font-display font-bold text-xl text-ink-950", children: ["Question ", currentIdx + 1, " of ", questions.length] }), _jsxs("p", { className: "text-sm text-ink-500 capitalize", children: [topic.replace('-', ' '), " \u2022 ", difficulty] })] }), _jsx(Badge, { color: "brand", children: "In Progress" })] }), _jsx(ProgressBar, { value: progress, color: "brand" })] }), _jsx(Card, { className: "mb-4", children: _jsxs("div", { className: "flex items-start gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center flex-shrink-0", children: _jsx(Brain, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-brand-600 font-medium mb-1", children: "AI Interviewer" }), _jsx("p", { className: "text-ink-900 font-medium leading-relaxed", children: questions[currentIdx].q })] })] }) }), _jsxs(Card, { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-2", children: "Your Answer" }), _jsx("textarea", { value: currentAnswer, onChange: (e) => setCurrentAnswer(e.target.value), rows: 8, className: "w-full px-4 py-3 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none", placeholder: "Type your answer here. Be detailed and use examples where possible\u2026" }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("span", { className: "text-xs text-ink-500", children: [currentAnswer.trim().split(/\s+/).filter(Boolean).length, " words"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/app/dashboard'), children: [_jsx(ArrowRight, { className: "w-4 h-4 rotate-180" }), "Exit"] }), _jsx(Button, { onClick: submitAnswer, disabled: saving, children: currentIdx < questions.length - 1 ? (_jsxs(_Fragment, { children: ["Next Question ", _jsx(ArrowRight, { className: "w-4 h-4" })] })) : (_jsxs(_Fragment, { children: ["Finish Interview ", _jsx(Check, { className: "w-4 h-4" })] })) })] })] })] })] }));
    }
    // Feedback stage
    return (_jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 mb-4", children: _jsx(Award, { className: "w-8 h-8 text-brand-600" }) }), _jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Interview Complete!" }), _jsx("p", { className: "text-ink-500 mt-1", children: "Here's your performance breakdown with model answers." })] }), _jsxs(Card, { className: "mb-6 flex flex-col items-center", children: [_jsx(ScoreRing, { score: avgScore, size: 140 }), _jsx("p", { className: "mt-4 text-sm text-ink-500", children: avgScore >= 80 ? 'Outstanding performance!' : avgScore >= 60 ? 'Good effort, keep practicing!' : 'Keep working at it — review the model answers below.' }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsxs(Button, { variant: "outline", onClick: restart, children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "New Interview"] }), _jsxs(Button, { onClick: () => navigate('/app/history'), children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "View History"] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "Question-by-Question Feedback" }), answers.map((a, i) => (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "flex-shrink-0 w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center text-sm font-semibold text-ink-600", children: i + 1 }), _jsx("p", { className: "text-sm font-medium text-ink-900", children: a.question })] }), _jsx("div", { className: cn('px-2.5 py-1 rounded-lg text-sm font-semibold flex-shrink-0', a.score >= 80 ? 'bg-brand-100 text-brand-700' : a.score >= 60 ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-700'), children: a.score })] }), _jsxs("div", { className: "bg-ink-50 rounded-xl p-3 mb-3", children: [_jsx("p", { className: "text-xs text-ink-500 mb-1", children: "Your Answer" }), _jsx("p", { className: "text-sm text-ink-700", children: a.answer })] }), _jsxs("div", { className: "bg-brand-50 rounded-xl p-3 mb-3 border border-brand-100", children: [_jsxs("p", { className: "text-xs text-brand-600 font-medium mb-1 flex items-center gap-1", children: [_jsx(Lightbulb, { className: "w-3.5 h-3.5" }), " AI Feedback"] }), _jsx("p", { className: "text-sm text-ink-700", children: a.feedback })] }), _jsxs("div", { className: "bg-gradient-to-br from-sky-50 to-brand-50 rounded-xl p-3 border border-sky-100", children: [_jsxs("p", { className: "text-xs text-sky-600 font-medium mb-1 flex items-center gap-1", children: [_jsx(BookOpen, { className: "w-3.5 h-3.5" }), " Model Answer"] }), _jsx("p", { className: "text-sm text-ink-700 leading-relaxed", children: a.model_answer })] })] }, a.id)))] })] }));
}
