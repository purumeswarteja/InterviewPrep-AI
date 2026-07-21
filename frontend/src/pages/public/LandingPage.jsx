import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import {
  Brain,
  Mic,
  FileText,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui";
const features = [
  { icon: Brain, title: "AI Mock Interviews", desc: "Practice with realistic AI-generated questions tailored to your role and skill level.", color: "from-brand-500 to-sky-500" },
  { icon: Mic, title: "Voice Interview Practice", desc: "Sharpen your verbal communication with real-time voice-based interview sessions.", color: "from-sky-500 to-brand-400" },
  { icon: FileText, title: "Resume Analyzer", desc: "Get instant AI feedback on your resume with ATS scoring and keyword optimization.", color: "from-accent-500 to-accent-400" },
  { icon: BarChart3, title: "Performance Analytics", desc: "Track your progress over time with detailed analytics and personalized insights.", color: "from-brand-400 to-accent-400" }
];
const steps = [
  { num: "01", title: "Create Your Profile", desc: "Tell us your target role, experience level, and skills to get personalized interview prep." },
  { num: "02", title: "Practice with AI", desc: "Choose from mock interviews, HR rounds, or voice-based sessions tailored to you." },
  { num: "03", title: "Get Instant Feedback", desc: "Receive detailed AI-powered feedback on your answers with scores and suggestions." },
  { num: "04", title: "Track & Improve", desc: "Monitor your progress, build streaks, and watch your confidence grow over time." }
];
const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer @ Google", quote: "InterPrep AI transformed my interview prep. I went from nervous to confident in 3 weeks and landed my dream job at Google.", avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200" },
  { name: "Marcus Johnson", role: "Product Manager @ Stripe", quote: "The AI feedback is remarkably accurate. It caught weaknesses in my answers I never noticed. Worth every minute.", avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200" },
  { name: "Priya Patel", role: "Data Scientist @ Meta", quote: "The voice interview practice was a game-changer. I felt completely prepared walking into my real interviews.", avatar: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200" }
];
function LandingPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-ink-50", children: [
    /* @__PURE__ */ jsx(PublicNavbar, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative pt-32 pb-24 overflow-hidden min-h-[640px] flex items-center", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "https://images.pexels.com/photos/8636626/pexels-photo-8636626.jpeg?auto=compress&cs=tinysrgb&w=1600",
          alt: "Candidate in an AI-powered online interview session",
          className: "absolute inset-0 w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-ink-950/90 via-ink-950/70 to-ink-900/50" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid-pattern opacity-20" }),
      /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl animate-fade-up", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-brand-300 text-sm font-medium mb-6 border border-white/10", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
          "AI-Powered Interview Coaching"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight", children: [
          "Master Your Interview.",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-brand-300 to-sky-300 bg-clip-text text-transparent", children: "Land Your Dream Job." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-ink-200 leading-relaxed max-w-xl", children: "Practice with AI-powered mock interviews, get instant feedback, and track your progress. The smartest way to prepare for your next career move." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: "/register", children: /* @__PURE__ */ jsxs(Button, { size: "lg", className: "bg-brand-600 text-white hover:bg-brand-700", children: [
            "Start Practicing Free",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })
          ] }) }),
          /* @__PURE__ */ jsx(Link, { to: "/features", children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", className: "border-white/30 text-white hover:bg-white/10", children: "Explore Features" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto mb-12", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-brand-600 uppercase tracking-wider", children: "Features" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-3xl sm:text-4xl text-ink-950 mt-2", children: "Everything You Need to Ace Your Interview" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink-600", children: "A complete toolkit designed to take you from anxious applicant to confident candidate." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6", children: features.map((f) => /* @__PURE__ */ jsxs("div", { className: "group card-surface p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-300", children: [
        /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`, children: /* @__PURE__ */ jsx(f.icon, { className: "w-6 h-6 text-white" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-lg text-ink-900", children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500 mt-2 leading-relaxed", children: f.desc })
      ] }, f.title)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 bg-ink-50", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto mb-12", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-brand-600 uppercase tracking-wider", children: "How It Works" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-3xl sm:text-4xl text-ink-950 mt-2", children: "Your Path to Interview Success" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6", children: steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "card-surface p-6 h-full", children: [
          /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-4xl text-ink-200", children: s.num }),
          /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-lg text-ink-900 mt-3", children: s.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500 mt-2 leading-relaxed", children: s.desc })
        ] }),
        i < steps.length - 1 && /* @__PURE__ */ jsx(ArrowRight, { className: "hidden lg:block absolute top-1/2 -right-4 w-6 h-6 text-ink-300" })
      ] }, s.num)) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "py-20 bg-ink-900 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg opacity-30" }),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-brand-300 text-sm font-medium mb-6", children: [
          /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4" }),
          "Start Today, Free"
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-3xl sm:text-5xl text-white leading-tight", children: "Ready to Ace Your Next Interview?" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink-300 text-lg max-w-xl mx-auto", children: "Join thousands of candidates who transformed their interview skills with AI-powered practice." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: "/register", children: /* @__PURE__ */ jsxs(Button, { size: "lg", className: "bg-brand-600 text-white hover:bg-brand-700", children: [
            "Get Started Free",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Link, { to: "/features", children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", className: "border-white/30 text-white hover:bg-white/10", children: "Explore Features" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  LandingPage as default
};
