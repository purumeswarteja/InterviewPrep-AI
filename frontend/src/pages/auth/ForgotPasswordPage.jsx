import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await api.passwordReset(email);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setSent(true);
      toast.success("Reset link sent to your email.");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-ink-50 p-6", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 mb-8 justify-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-white" }) }),
      /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-xl", children: "InterPrep AI" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card-surface p-8", children: sent ? /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Mail, { className: "w-8 h-8 text-brand-600" }) }),
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl text-ink-950", children: "Check your email" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-ink-500", children: [
        "We've sent a password reset link to ",
        /* @__PURE__ */ jsx("strong", { className: "text-ink-700", children: email }),
        ". Click the link to reset your password."
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/login", className: "mt-6 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
        "Back to sign in"
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl text-ink-950", children: "Reset your password" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink-500", children: "Enter your email and we'll send you a reset link." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [
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
                className: "w-full pl-11 pr-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all",
                placeholder: "you@example.com"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2",
            children: loading ? "Sending\u2026" : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Send Reset Link ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-ink-500", children: [
        "Remember your password?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-brand-600 hover:text-brand-700 font-semibold", children: "Sign in" })
      ] })
    ] }) })
  ] }) });
}
export {
  ForgotPasswordPage as default
};
