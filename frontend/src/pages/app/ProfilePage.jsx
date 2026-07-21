import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { User, Mail, MapPin, Briefcase, Github, Linkedin, Globe, Save, Flame } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button } from "../../components/ui";
import { cn, getInitials } from "../../lib/utils";
function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    target_role: "",
    experience_level: "junior",
    skills: []
  });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
        target_role: profile.target_role || "",
        experience_level: profile.experience_level || "junior",
        skills: profile.skills || []
      });
    }
  }, [profile]);
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput("");
    }
  };
  const removeSkill = (s) => {
    setForm({ ...form, skills: form.skills.filter((x) => x !== s) });
  };
  const handleSave = async () => {
    setSaving(true);
    const response = await api.updateProfile({
      full_name: form.full_name,
      bio: form.bio,
      phone: form.phone,
      location: form.location,
      linkedin_url: form.linkedin_url,
      github_url: form.github_url,
      portfolio_url: form.portfolio_url,
      target_role: form.target_role,
      experience_level: form.experience_level,
      skills: form.skills
    });
    setSaving(false);
    if (response.error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated successfully!");
      refreshProfile();
    }
  };
  const levels = ["junior", "mid", "senior", "lead"];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto animate-fade-in space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "My Profile" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Update your personal information and career details." })
    ] }),
    /* Colored header */
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-6 bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold flex-shrink-0", children: getInitials(form.full_name || user?.email) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center sm:text-left", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-2xl", children: form.full_name || "User" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/90 text-sm", children: user?.email }),
          form.target_role && /* @__PURE__ */ jsxs("p", { className: "text-white/90 text-sm mt-1 flex items-center gap-1.5 justify-center sm:justify-start", children: [
            /* @__PURE__ */ jsx(Briefcase, { className: "w-4 h-4" }),
            form.target_role
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-6 mt-5 justify-center sm:justify-start", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center sm:text-left", children: [
              /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl", children: profile?.total_interviews || 0 }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90", children: "Interviews" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center sm:text-left", children: [
              /* @__PURE__ */ jsxs("p", { className: "font-display font-bold text-2xl flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Flame, { className: "w-5 h-5 text-white/90" }),
                profile?.streak_count || 0
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90", children: "Streak" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center sm:text-left", children: [
              /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl", children: profile?.avg_score ? Math.round(profile.avg_score) : "\u2014" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90", children: "Avg Score" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Personal Information" }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Full Name" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.full_name,
                onChange: (e) => setForm({ ...form, full_name: e.target.value }),
                className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm",
                placeholder: "Jane Doe"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: user?.email || "",
                disabled: true,
                className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 bg-ink-50 text-ink-500 text-sm"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Phone" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form.phone,
              onChange: (e) => setForm({ ...form, phone: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm",
              placeholder: "+1 (555) 012-3456"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Location" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.location,
                onChange: (e) => setForm({ ...form, location: e.target.value }),
                className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm",
                placeholder: "San Francisco, CA"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Bio" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: form.bio,
            onChange: (e) => setForm({ ...form, bio: e.target.value }),
            rows: 3,
            className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm resize-none",
            placeholder: "Tell us about yourself\u2026"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Career Details" }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Target Role" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form.target_role,
              onChange: (e) => setForm({ ...form, target_role: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm",
              placeholder: "Senior Software Engineer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Experience Level" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: levels.map((l) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setForm({ ...form, experience_level: l }),
              className: cn(
                "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                form.experience_level === l ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              ),
              children: l
            },
            l
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Skills" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              value: skillInput,
              onChange: (e) => setSkillInput(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), addSkill()),
              className: "flex-1 px-4 py-2 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm",
              placeholder: "Type a skill and press Enter"
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: addSkill, children: "Add" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: form.skills.map((s) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => removeSkill(s),
            className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors",
            children: [
              s,
              " \xD7"
            ]
          },
          s
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Links" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [
        { key: "linkedin_url", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
        { key: "github_url", icon: Github, placeholder: "https://github.com/username" },
        { key: "portfolio_url", icon: Globe, placeholder: "https://yourportfolio.com" }
      ].map((l) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5 capitalize", children: l.key.replace("_url", "").replace("_", " ") }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(l.icon, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form[l.key],
              onChange: (e) => setForm({ ...form, [l.key]: e.target.value }),
              className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm",
              placeholder: l.placeholder
            }
          )
        ] })
      ] }, l.key)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "lg", onClick: handleSave, disabled: saving, children: [
      /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
      saving ? "Saving\u2026" : "Save Changes"
    ] }) })
  ] });
}
export {
  ProfilePage as default
};
