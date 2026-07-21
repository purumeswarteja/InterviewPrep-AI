import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
export default function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
            toast.error(error.message.includes('Invalid login credentials')
                ? 'Invalid email or password.'
                : error.message);
        }
        else {
            toast.success('Welcome back!');
            navigate('/app/dashboard');
        }
    };
    return (_jsxs("div", { className: "min-h-screen grid lg:grid-cols-2", children: [_jsxs("div", { className: "hidden lg:flex flex-col justify-between p-12 bg-ink-900 text-white relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 mesh-bg opacity-30" }), _jsx("div", { className: "absolute inset-0 grid-pattern opacity-10" }), _jsxs(Link, { to: "/", className: "relative flex items-center gap-2.5", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-sky-400 flex items-center justify-center", children: _jsx(Brain, { className: "w-5 h-5 text-white" }) }), _jsx("span", { className: "font-display font-bold text-xl", children: "InterPrep AI" })] }), _jsxs("div", { className: "relative", children: [_jsxs("h2", { className: "font-display font-bold text-4xl leading-tight", children: ["Welcome back to your", _jsx("br", {}), "interview prep journey."] }), _jsx("p", { className: "mt-4 text-ink-300 text-lg max-w-md", children: "Pick up where you left off. Your next practice session is just a click away." }), _jsx("div", { className: "mt-8 space-y-3", children: ['AI-powered mock interviews', 'Real-time feedback & scoring', 'Track your progress over time'].map((t) => (_jsxs("div", { className: "flex items-center gap-3 text-ink-200", children: [_jsx("div", { className: "w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center", children: _jsx("div", { className: "w-2 h-2 rounded-full bg-brand-400" }) }), t] }, t))) })] }), _jsxs("p", { className: "relative text-sm text-ink-400", children: ["\u00A9 ", new Date().getFullYear(), " InterPrep AI"] })] }), _jsx("div", { className: "flex items-center justify-center p-6 sm:p-12 bg-ink-50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs(Link, { to: "/", className: "lg:hidden flex items-center gap-2.5 mb-8", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center", children: _jsx(Brain, { className: "w-5 h-5 text-white" }) }), _jsx("span", { className: "font-display font-bold text-xl", children: "InterPrep AI" })] }), _jsx("h1", { className: "font-display font-bold text-3xl text-ink-950", children: "Sign in" }), _jsx("p", { className: "mt-2 text-ink-500", children: "Enter your credentials to access your account." }), _jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" }), _jsx("input", { required: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full pl-11 pr-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all", placeholder: "you@example.com" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-ink-700", children: "Password" }), _jsx(Link, { to: "/forgot-password", className: "text-xs text-brand-600 hover:text-brand-700 font-medium", children: "Forgot password?" })] }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" }), _jsx("input", { required: true, type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full pl-11 pr-11 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2", children: loading ? 'Signing in…' : _jsxs(_Fragment, { children: ["Sign In ", _jsx(ArrowRight, { className: "w-4 h-4" })] }) })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-ink-500", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "text-brand-600 hover:text-brand-700 font-semibold", children: "Create one free" })] })] }) })] }));
}
