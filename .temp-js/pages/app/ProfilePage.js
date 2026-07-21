import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Briefcase, Github, Linkedin, Globe, Save, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, Button } from '../../components/ui';
import { cn, getInitials } from '../../lib/utils';
export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const [form, setForm] = useState({
        full_name: '',
        bio: '',
        phone: '',
        location: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        target_role: '',
        experience_level: 'junior',
        skills: [],
    });
    const [skillInput, setSkillInput] = useState('');
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                phone: profile.phone || '',
                location: profile.location || '',
                linkedin_url: profile.linkedin_url || '',
                github_url: profile.github_url || '',
                portfolio_url: profile.portfolio_url || '',
                target_role: profile.target_role || '',
                experience_level: profile.experience_level || 'junior',
                skills: profile.skills || [],
            });
        }
    }, [profile]);
    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) {
            setForm({ ...form, skills: [...form.skills, s] });
            setSkillInput('');
        }
    };
    const removeSkill = (s) => {
        setForm({ ...form, skills: form.skills.filter((x) => x !== s) });
    };
    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({
            full_name: form.full_name,
            bio: form.bio,
            phone: form.phone,
            location: form.location,
            linkedin_url: form.linkedin_url,
            github_url: form.github_url,
            portfolio_url: form.portfolio_url,
            target_role: form.target_role,
            experience_level: form.experience_level,
            skills: form.skills,
            updated_at: new Date().toISOString(),
        })
            .eq('user_id', user?.id);
        setSaving(false);
        if (error) {
            toast.error('Failed to update profile.');
        }
        else {
            toast.success('Profile updated successfully!');
            refreshProfile();
        }
    };
    const levels = ['junior', 'mid', 'senior', 'lead'];
    return (_jsxs("div", { className: "max-w-4xl mx-auto animate-fade-in space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "My Profile" }), _jsx("p", { className: "text-ink-500 mt-1", children: "Update your personal information and career details." })] }), _jsx(Card, { className: "bg-gradient-to-br from-ink-900 to-ink-800 text-white border-0", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-6", children: [_jsx("div", { className: "w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-sky-500 flex items-center justify-center text-2xl font-bold flex-shrink-0", children: getInitials(form.full_name || user?.email) }), _jsxs("div", { className: "flex-1 text-center sm:text-left", children: [_jsx("h2", { className: "font-display font-bold text-xl", children: form.full_name || 'User' }), _jsx("p", { className: "text-ink-300 text-sm", children: user?.email }), form.target_role && (_jsxs("p", { className: "text-brand-300 text-sm mt-1 flex items-center gap-1.5 justify-center sm:justify-start", children: [_jsx(Briefcase, { className: "w-4 h-4" }), " ", form.target_role] })), _jsxs("div", { className: "flex gap-4 mt-4 justify-center sm:justify-start", children: [_jsxs("div", { className: "text-center sm:text-left", children: [_jsx("p", { className: "font-display font-bold text-lg", children: profile?.total_interviews || 0 }), _jsx("p", { className: "text-xs text-ink-400", children: "Interviews" })] }), _jsxs("div", { className: "text-center sm:text-left", children: [_jsxs("p", { className: "font-display font-bold text-lg flex items-center gap-1", children: [_jsx(Flame, { className: "w-4 h-4 text-accent-400" }), profile?.streak_count || 0] }), _jsx("p", { className: "text-xs text-ink-400", children: "Streak" })] }), _jsxs("div", { className: "text-center sm:text-left", children: [_jsx("p", { className: "font-display font-bold text-lg", children: profile?.avg_score ? Math.round(profile.avg_score) : '—' }), _jsx("p", { className: "text-xs text-ink-400", children: "Avg Score" })] })] })] })] }) }), _jsxs(Card, { children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Personal Information" }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }), _jsx("input", { value: form.full_name, onChange: (e) => setForm({ ...form, full_name: e.target.value }), className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm", placeholder: "Jane Doe" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }), _jsx("input", { value: user?.email || '', disabled: true, className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 bg-ink-50 text-ink-500 text-sm" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Phone" }), _jsx("input", { value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }), className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm", placeholder: "+1 (555) 012-3456" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Location" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }), _jsx("input", { value: form.location, onChange: (e) => setForm({ ...form, location: e.target.value }), className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm", placeholder: "San Francisco, CA" })] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Bio" }), _jsx("textarea", { value: form.bio, onChange: (e) => setForm({ ...form, bio: e.target.value }), rows: 3, className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm resize-none", placeholder: "Tell us about yourself\u2026" })] })] }), _jsxs(Card, { children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Career Details" }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Target Role" }), _jsx("input", { value: form.target_role, onChange: (e) => setForm({ ...form, target_role: e.target.value }), className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm", placeholder: "Senior Software Engineer" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Experience Level" }), _jsx("div", { className: "flex gap-2", children: levels.map((l) => (_jsx("button", { onClick: () => setForm({ ...form, experience_level: l }), className: cn('flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all', form.experience_level === l ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'), children: l }, l))) })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Skills" }), _jsxs("div", { className: "flex gap-2 mb-3", children: [_jsx("input", { value: skillInput, onChange: (e) => setSkillInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && (e.preventDefault(), addSkill()), className: "flex-1 px-4 py-2 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm", placeholder: "Type a skill and press Enter" }), _jsx(Button, { variant: "outline", onClick: addSkill, children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: form.skills.map((s) => (_jsxs("button", { onClick: () => removeSkill(s), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors", children: [s, " \u00D7"] }, s))) })] })] }), _jsxs(Card, { children: [_jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Links" }), _jsx("div", { className: "space-y-4", children: [
                            { key: 'linkedin_url', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
                            { key: 'github_url', icon: Github, placeholder: 'https://github.com/username' },
                            { key: 'portfolio_url', icon: Globe, placeholder: 'https://yourportfolio.com' },
                        ].map((l) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5 capitalize", children: l.key.replace('_url', '').replace('_', ' ') }), _jsxs("div", { className: "relative", children: [_jsx(l.icon, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }), _jsx("input", { value: form[l.key], onChange: (e) => setForm({ ...form, [l.key]: e.target.value }), className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm", placeholder: l.placeholder })] })] }, l.key))) })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { size: "lg", onClick: handleSave, disabled: saving, children: [_jsx(Save, { className: "w-4 h-4" }), saving ? 'Saving…' : 'Save Changes'] }) })] }));
}
