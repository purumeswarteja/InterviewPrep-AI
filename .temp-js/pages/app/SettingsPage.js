import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Bell, Shield, Target, Globe, LogOut, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, Button } from '../../components/ui';
import { cn } from '../../lib/utils';
export default function SettingsPage() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [weeklyGoal, setWeeklyGoal] = useState(profile?.weekly_goal || 5);
    const [monthlyGoal, setMonthlyGoal] = useState(profile?.monthly_goal || 20);
    const [notifications, setNotifications] = useState({ email: true, push: false, streak: true, weekly: true });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleSaveGoals = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ weekly_goal: weeklyGoal, monthly_goal: monthlyGoal })
            .eq('user_id', user?.id);
        setSaving(false);
        if (error)
            toast.error('Failed to save goals.');
        else
            toast.success('Goals updated!');
    };
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };
    const toggleItems = [
        { key: 'email', label: 'Email Notifications', desc: 'Receive emails about your activity', icon: Bell },
        { key: 'push', label: 'Push Notifications', desc: 'Get browser push notifications', icon: Bell },
        { key: 'streak', label: 'Streak Reminders', desc: 'Daily reminders to keep your streak', icon: Target },
        { key: 'weekly', label: 'Weekly Progress Report', desc: 'Summary of your week every Sunday', icon: Globe },
    ];
    return (_jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Settings" }), _jsx("p", { className: "text-ink-500 mt-1", children: "Manage your account, preferences, and goals." })] }), _jsxs(Card, { children: [_jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5 text-brand-500" }), " Interview Goals"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { className: "text-sm font-medium text-ink-700", children: "Weekly Goal" }), _jsxs("span", { className: "text-sm text-brand-600 font-semibold", children: [weeklyGoal, " sessions"] })] }), _jsx("input", { type: "range", min: "1", max: "20", value: weeklyGoal, onChange: (e) => setWeeklyGoal(Number(e.target.value)), className: "w-full accent-brand-500" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { className: "text-sm font-medium text-ink-700", children: "Monthly Goal" }), _jsxs("span", { className: "text-sm text-sky-600 font-semibold", children: [monthlyGoal, " sessions"] })] }), _jsx("input", { type: "range", min: "5", max: "100", value: monthlyGoal, onChange: (e) => setMonthlyGoal(Number(e.target.value)), className: "w-full accent-sky-500" })] })] }), _jsxs(Button, { onClick: handleSaveGoals, disabled: saving, className: "mt-4", children: [_jsx(Save, { className: "w-4 h-4" }), saving ? 'Saving…' : 'Save Goals'] })] }), _jsxs(Card, { children: [_jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [_jsx(Bell, { className: "w-5 h-5 text-sky-500" }), " Notifications"] }), _jsx("div", { className: "space-y-3", children: toggleItems.map((t) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-ink-100", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center", children: _jsx(t.icon, { className: "w-4 h-4 text-ink-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-ink-900", children: t.label }), _jsx("p", { className: "text-xs text-ink-500", children: t.desc })] })] }), _jsx("button", { onClick: () => setNotifications({ ...notifications, [t.key]: !notifications[t.key] }), className: cn('relative w-11 h-6 rounded-full transition-colors', notifications[t.key] ? 'bg-brand-500' : 'bg-ink-200'), children: _jsx("span", { className: cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm', notifications[t.key] ? 'translate-x-5' : 'translate-x-0.5') }) })] }, t.key))) })] }), _jsxs(Card, { children: [_jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5 text-accent-500" }), " Account"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-ink-100", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-ink-900", children: "Email Address" }), _jsx("p", { className: "text-xs text-ink-500", children: user?.email })] }), _jsx("span", { className: "text-xs text-brand-600 font-medium", children: "Verified" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-ink-100", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-ink-900", children: "Password" }), _jsx("p", { className: "text-xs text-ink-500", children: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsx("button", { onClick: () => setShowPassword(!showPassword), className: "text-ink-400 hover:text-ink-600", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] }), _jsxs("button", { onClick: handleSignOut, className: "w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sign Out"] })] })] }), _jsxs(Card, { className: "border-red-200", children: [_jsxs("h2", { className: "font-display font-semibold text-lg text-red-600 mb-2 flex items-center gap-2", children: [_jsx(Trash2, { className: "w-5 h-5" }), " Danger Zone"] }), _jsx("p", { className: "text-sm text-ink-500 mb-4", children: "Permanently delete your account and all associated data. This cannot be undone." }), _jsxs(Button, { variant: "danger", onClick: () => toast.error('Account deletion requires confirmation. Contact support.'), children: [_jsx(Trash2, { className: "w-4 h-4" }), "Delete Account"] })] })] }));
}
