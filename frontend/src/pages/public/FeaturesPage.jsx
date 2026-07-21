import { jsx, jsxs } from "react/jsx-runtime";
import {
  Brain,
  Mic,
  FileText,
  BarChart3,
  History,
  Check,
  BookOpen,
  Zap,
  ShieldCheck
} from "lucide-react";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
const features = [
  {
    icon: Brain,
    title: "AI Mock Interviews",
    desc: "Practice with dynamically generated questions across 8+ technical topics including JavaScript, React, Python, SQL, System Design, and more.",
    points: ["Adaptive difficulty", "Instant AI scoring", "Detailed answer feedback", "8+ technical topics"],
    color: "from-brand-500 to-sky-500"
  },
  {
    icon: Mic,
    title: "HR Interview Practice",
    desc: "Master behavioral and HR questions with practice sessions covering self-introduction, strengths, experience, and culture fit.",
    points: ["6 HR topic categories", "Behavioral questions", "STAR method coaching", "Confidence building"],
    color: "from-sky-500 to-brand-400"
  },
  {
    icon: Mic,
    title: "Voice Interview Sessions",
    desc: "Practice speaking your answers out loud with voice-based interview sessions that simulate the real experience.",
    points: ["Browser-based recording", "Real-time practice", "Verbal delivery feedback", "Natural conversation flow"],
    color: "from-accent-500 to-accent-400"
  },
  {
    icon: FileText,
    title: "AI Resume Analyzer",
    desc: "Upload your resume and get instant AI analysis with ATS compatibility scoring, keyword matching, and actionable suggestions.",
    points: ["ATS compatibility score", "Keyword optimization", "Grammar & clarity check", "Improvement suggestions"],
    color: "from-brand-400 to-accent-400"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Track your progress with detailed charts showing score trends, topic mastery, and areas needing improvement.",
    points: ["Score trend visualization", "Topic-wise breakdown", "Streak tracking", "Goal setting"],
    color: "from-sky-400 to-brand-500"
  },
  {
    icon: History,
    title: "Interview History",
    desc: "Review every past session with full transcripts, scores, and feedback. Learn from mistakes and celebrate progress.",
    points: ["Complete session logs", "Filterable history", "Answer transcripts", "Progress timeline"],
    color: "from-accent-400 to-sky-500"
  }
];
function FeaturesPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-ink-50", children: [
    /* @__PURE__ */ jsx(PublicNavbar, {}),
    /* @__PURE__ */ jsxs("section", { className: "pt-32 pb-16 bg-white relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg opacity-50" }),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-brand-600 uppercase tracking-wider", children: "Features" }),
        /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-4xl sm:text-5xl text-ink-950 mt-2 leading-tight", children: "A complete interview prep toolkit" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-ink-600 max-w-2xl mx-auto", children: "From AI mock interviews to resume analysis, we've built everything you need to walk into any interview with confidence." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-16", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-6", children: features.map((f) => /* @__PURE__ */ jsxs("div", { className: "card-surface p-8 hover:shadow-lift transition-shadow", children: [
      /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`, children: /* @__PURE__ */ jsx(f.icon, { className: "w-7 h-7 text-white" }) }),
      /* @__PURE__ */ jsx("h3", { className: "font-display font-bold text-xl text-ink-900", children: f.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink-600 leading-relaxed", children: f.desc }),
      /* @__PURE__ */ jsx("ul", { className: "mt-5 space-y-2", children: f.points.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-sm text-ink-700", children: [
        /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-brand-500 flex-shrink-0" }),
        p
      ] }, p)) })
    ] }, f.title)) }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "py-16 bg-ink-900 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg opacity-30" }),
      /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6", children: [
        { icon: ShieldCheck, title: "Private & Secure", desc: "Your data is encrypted and never shared. Your practice sessions stay yours." },
        { icon: Zap, title: "Instant Feedback", desc: "Get AI-powered analysis of your answers in seconds, not days." },
        { icon: BookOpen, title: "Always Learning", desc: "Our question bank and AI models continuously improve based on real outcomes." }
      ].map((b) => /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-white/5 border border-white/10", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-sky-400 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(b.icon, { className: "w-6 h-6 text-white" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-lg text-white", children: b.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-300 mt-2 leading-relaxed", children: b.desc })
      ] }, b.title)) }) })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  FeaturesPage as default
};
