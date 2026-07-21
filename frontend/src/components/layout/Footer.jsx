import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Brain, Twitter, Linkedin, Github, Mail } from "lucide-react";
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "bg-ink-900 text-ink-300", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-sky-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-white" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-lg text-white", children: "InterPrep AI" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm max-w-md leading-relaxed", children: "The AI-powered interview preparation platform that helps you land your dream job. Practice with realistic mock interviews, get instant feedback, and track your progress." }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-3 mt-6", children: [Twitter, Linkedin, Github, Mail].map((Icon, i) => /* @__PURE__ */ jsx("a", { href: "#", className: "w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors", children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }) }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-white font-semibold mb-4", children: "Platform" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/features", className: "hover:text-white transition-colors", children: "Features" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/about", className: "hover:text-white transition-colors", children: "About" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/contact", className: "hover:text-white transition-colors", children: "Contact" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-white font-semibold mb-4", children: "Account" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/login", className: "hover:text-white transition-colors", children: "Sign In" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/register", className: "hover:text-white transition-colors", children: "Create Account" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/app/dashboard", className: "hover:text-white transition-colors", children: "Dashboard" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "\xA9 ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " InterPrep AI. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-sm", children: [
        /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Privacy" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Terms" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Cookies" })
      ] })
    ] })
  ] }) });
}
export {
  Footer as default
};
