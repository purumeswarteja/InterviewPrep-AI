import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, User, Mail, Lock, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const requirements = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) }
  ];
  const passwordValid = requirements.every((r) => r.met);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValid) {
      toast.error("Please meet all the password requirements shown above.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      const msg = error.message || "";
      if (msg.includes("already registered")) {
        toast.error("An account with this email already exists.");
      } else if (/password/i.test(msg)) {
        toast.error(passwordValid ? "Could not create account. Please try a different password." : "Please meet the password requirements shown above.");
      } else {
        toast.error(msg);
      }
    } else {
      toast.success("Account created! Welcome to InterPrep AI.");
      navigate("/app/dashboard");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen grid lg:grid-cols-2", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-6 sm:p-12 bg-ink-50", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "lg:hidden flex items-center gap-2.5 mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-xl", children: "InterPrep AI" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-3xl text-ink-950", children: "Create your account" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink-500", children: "Start your interview prep journey today. It's free." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Full Name" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "w-full pl-11 pr-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "w-full pl-11 pr-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "w-full pl-11 pr-11 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600", children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: requirements.map((r) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 text-xs ${r.met ? "text-brand-600" : "text-ink-400"}`, children: [
            /* @__PURE__ */ jsx(Check, { className: `w-3.5 h-3.5 ${r.met ? "opacity-100" : "opacity-30"}` }),
            r.label
          ] }, r.label)) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2",
            children: loading ? "Creating account\u2026" : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Create Account ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-ink-500", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-brand-600 hover:text-brand-700 font-semibold", children: "Sign in" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex flex-col justify-between p-12 bg-ink-900 text-white relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg opacity-30" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid-pattern opacity-10" }),
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "relative flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-sky-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-xl", children: "InterPrep AI" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-display font-bold text-4xl leading-tight", children: [
          "Join thousands who",
          /* @__PURE__ */ jsx("br", {}),
          "aced their interviews."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink-300 text-lg max-w-md", children: "Get personalized AI-powered interview coaching that adapts to your skill level and goals." }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 grid grid-cols-2 gap-4 max-w-md", children: [
          { v: "50K+", l: "Practice sessions" },
          { v: "12K+", l: "Job offers landed" },
          { v: "4.9/5", l: "User rating" },
          { v: "Free", l: "Forever plan" }
        ].map((s) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/5 border border-white/10", children: [
          /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-2xl text-white", children: s.v }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-400", children: s.l })
        ] }, s.l)) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "relative text-sm text-ink-400", children: [
        "\xA9 ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " InterPrep AI"
      ] })
    ] })
  ] });
}
export {
  RegisterPage as default
};
