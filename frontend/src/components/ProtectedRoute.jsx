import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brain } from "lucide-react";
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-ink-50", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center animate-pulse-glow", children: /* @__PURE__ */ jsx(Brain, { className: "w-7 h-7 text-white" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 text-sm", children: "Loading your workspace\u2026" })
    ] }) });
  }
  if (!user) return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
  return /* @__PURE__ */ jsx(Fragment, { children });
}
export {
  ProtectedRoute as default
};
