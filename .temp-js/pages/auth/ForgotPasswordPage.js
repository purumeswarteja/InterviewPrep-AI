import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        setLoading(false);
        if (error) {
            toast.error(error.message);
        }
        else {
            setSent(true);
            toast.success('Reset link sent to your email.');
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-ink-50 p-6", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2.5 mb-8 justify-center", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center", children: _jsx(Brain, { className: "w-5 h-5 text-white" }) }), _jsx("span", { className: "font-display font-bold text-xl", children: "InterPrep AI" })] }), _jsx("div", { className: "card-surface p-8", children: sent ? (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4", children: _jsx(Mail, { className: "w-8 h-8 text-brand-600" }) }), _jsx("h1", { className: "font-display font-bold text-2xl text-ink-950", children: "Check your email" }), _jsxs("p", { className: "mt-2 text-ink-500", children: ["We've sent a password reset link to ", _jsx("strong", { className: "text-ink-700", children: email }), ". Click the link to reset your password."] }), _jsxs(Link, { to: "/login", className: "mt-6 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to sign in"] })] })) : (_jsxs(_Fragment, { children: [_jsx("h1", { className: "font-display font-bold text-2xl text-ink-950", children: "Reset your password" }), _jsx("p", { className: "mt-2 text-ink-500", children: "Enter your email and we'll send you a reset link." }), _jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" }), _jsx("input", { required: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full pl-11 pr-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all", placeholder: "you@example.com" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2", children: loading ? 'Sending…' : _jsxs(_Fragment, { children: ["Send Reset Link ", _jsx(ArrowRight, { className: "w-4 h-4" })] }) })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-ink-500", children: ["Remember your password?", ' ', _jsx(Link, { to: "/login", className: "text-brand-600 hover:text-brand-700 font-semibold", children: "Sign in" })] })] })) })] }) }));
}
