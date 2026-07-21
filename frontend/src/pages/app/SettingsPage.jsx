import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Bell, Shield, Target, Globe, LogOut, Save, Trash2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button } from "../../components/ui";
import { cn } from "../../lib/utils";
function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weekly_goal || 5);
  const [monthlyGoal, setMonthlyGoal] = useState(profile?.monthly_goal || 20);
  const [notifications, setNotifications] = useState({ email: true, push: false, streak: true, weekly: true });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSaveGoals = async () => {
    setSaving(true);
    const response = await api.updateProfile({ weekly_goal: weeklyGoal, monthly_goal: monthlyGoal });
    setSaving(false);
    if (response.error) toast.error("Failed to save goals.");
    else toast.success("Goals updated!");
  };
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const toggleItems = [
    { key: "email", label: "Email Notifications", desc: "Receive emails about your activity", icon: Bell },
    { key: "push", label: "Push Notifications", desc: "Get browser push notifications", icon: Bell },
    { key: "streak", label: "Streak Reminders", desc: "Daily reminders to keep your streak", icon: Target },
    { key: "weekly", label: "Weekly Progress Report", desc: "Summary of your week every Sunday", icon: Globe }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Settings" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Manage your account, preferences, and goals." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Target, { className: "w-5 h-5 text-brand-500" }),
        " Interview Goals"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-ink-700", children: "Weekly Goal" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-brand-600 font-semibold", children: [
              weeklyGoal,
              " sessions"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "1",
              max: "20",
              value: weeklyGoal,
              onChange: (e) => setWeeklyGoal(Number(e.target.value)),
              className: "w-full accent-brand-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-ink-700", children: "Monthly Goal" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-sky-600 font-semibold", children: [
              monthlyGoal,
              " sessions"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "5",
              max: "100",
              value: monthlyGoal,
              onChange: (e) => setMonthlyGoal(Number(e.target.value)),
              className: "w-full accent-sky-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: handleSaveGoals, disabled: saving, className: "mt-4", children: [
        /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
        saving ? "Saving\u2026" : "Save Goals"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5 text-sky-500" }),
        " Notifications"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: toggleItems.map((t) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-ink-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(t.icon, { className: "w-4 h-4 text-ink-600" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-900", children: t.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-500", children: t.desc })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setNotifications({ ...notifications, [t.key]: !notifications[t.key] }),
            className: cn(
              "relative w-11 h-6 rounded-full transition-colors",
              notifications[t.key] ? "bg-brand-500" : "bg-ink-200"
            ),
            children: /* @__PURE__ */ jsx("span", { className: cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
              notifications[t.key] ? "translate-x-5" : "translate-x-0.5"
            ) })
          }
        )
      ] }, t.key)) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-accent-500" }),
        " Account"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-ink-100", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-900", children: "Email Address" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-500", children: user?.email })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-brand-600 font-medium", children: "Verified" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-ink-100", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-900", children: "Password" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-500", children: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowPassword(!showPassword), className: "text-ink-400 hover:text-ink-600", children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSignOut,
            className: "w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
              "Sign Out"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-red-200", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-lg text-red-600 mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" }),
        " Danger Zone"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500 mb-4", children: "Permanently delete your account and all associated data. This cannot be undone." }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "danger",
          onClick: () => toast.error("Account deletion requires confirmation. Contact support."),
          children: [
            /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
            "Delete Account"
          ]
        }
      )
    ] })
  ] });
}
export {
  SettingsPage as default
};
