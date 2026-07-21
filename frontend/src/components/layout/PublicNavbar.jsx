import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Brain, Menu, X, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" }
];
function PublicNavbar() {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsx("header", { className: "fixed top-0 inset-x-0 z-50", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-3 glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-soft", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center shadow-glow", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-lg text-ink-900", children: "InterPrep AI" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center flex-1 justify-center gap-8", children: links.map((l) => /* @__PURE__ */ jsx(
        Link,
        {
          to: l.to,
          className: cn(
            "px-5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100 transition-colors"
          ),
          children: l.label
        },
        l.to
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "px-4 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100", children: "Sign In" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/register",
            className: "px-4 py-2 rounded-lg text-sm font-semibold bg-ink-900 text-white hover:bg-ink-800 transition-colors flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
              "Get Started"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => setOpen(!open), className: "md:hidden p-2 rounded-lg hover:bg-ink-100", children: open ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" }) })
    ] }),
    open && /* @__PURE__ */ jsxs("div", { className: "md:hidden mt-2 glass rounded-2xl p-4 shadow-soft animate-fade-down", children: [
      links.map((l) => /* @__PURE__ */ jsx(Link, { to: l.to, onClick: () => setOpen(false), className: "block px-4 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100", children: l.label }, l.to)),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-ink-200 mt-2 pt-2 flex gap-2", children: [
        /* @__PURE__ */ jsx(Link, { to: "/login", onClick: () => setOpen(false), className: "flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium text-ink-700 bg-ink-100", children: "Sign In" }),
        /* @__PURE__ */ jsx(Link, { to: "/register", onClick: () => setOpen(false), className: "flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-ink-900 text-white", children: "Get Started" })
      ] })
    ] })
  ] }) });
}
export {
  PublicNavbar as default
};
