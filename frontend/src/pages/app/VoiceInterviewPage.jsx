import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  ArrowRight,
  Check,
  Award,
  TrendingUp,
  Volume2,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button, Badge, ScoreRing, ProgressBar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { useSpeechRecognition } from "../../lib/useSpeechRecognition";
const voiceQuestions = [
  "Tell me about yourself and what drew you to this field.",
  "Describe a challenging project you worked on and how you overcame obstacles.",
  "Where do you see your career heading in the next few years?",
  "What's a skill you're currently learning and why?",
  "Tell me about a time you received difficult feedback. How did you respond?"
];
function generateVoiceFeedback(transcript) {
  if (!transcript.trim()) return { score: 0, feedback: "No speech detected. Check your microphone permissions and try again." };
  const words = transcript.trim().split(/\s+/).length;
  let score = 62;
  if (/\b(example|instance|project|team|led|built|improved)\b/i.test(transcript)) score += 14;
  if (/\b(result|outcome|impact|because of this)\b/i.test(transcript)) score += 12;
  if (words < 10) score -= 15;
  score = Math.min(95, Math.max(35, score));
  let feedback = "";
  if (score >= 80) feedback = `Clear and confident delivery. Good pace with concrete examples. Keep practicing to maintain this level.`;
  else if (score >= 65) feedback = `Good verbal delivery. Try to add one specific example to make it stronger.`;
  else if (score >= 45) feedback = `Decent start. Aim for a clear structure: situation, then action, then result.`;
  else feedback = `Your answer was very short. Aim for 30-60 seconds using the STAR method.`;
  return { score, feedback };
}
function VoiceInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState("setup");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const { state: micState, transcript, error: micError, isSupported, start, stop, reset, setTranscript } = useSpeechRecognition();
  useEffect(() => {
    if (micError) toast.error(micError);
  }, [micError]);
  useEffect(() => {
    if (micState === "listening") {
      const t = setInterval(() => setRecordingTime((s) => s + 1), 1e3);
      return () => clearInterval(t);
    } else {
      setRecordingTime(0);
    }
  }, [micState]);
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  const submitAnswer = () => {
    if (!transcript.trim()) {
      toast.error("No speech recorded. Click the mic and speak your answer.");
      return;
    }
    stop();
    const { score, feedback } = generateVoiceFeedback(transcript);
    const qa = {
      id: `q-${currentIdx}`,
      question: voiceQuestions[currentIdx],
      answer: transcript,
      feedback,
      score
    };
    const newAnswers = [...answers, qa];
    setAnswers(newAnswers);
    setTranscript("");
    setRecordingTime(0);
    if (currentIdx < voiceQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishInterview(newAnswers);
    }
  };
  const finishInterview = useCallback(async (allAnswers) => {
    setSaving(true);
    stop();
    const avgScore2 = allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length;
    const duration = Math.floor((Date.now() - startTime) / 1e3);
    if (user) {
      const data = await api.createSession({
        user_id: user.id,
        type: "voice",
        topic: "voice-practice",
        difficulty: "medium",
        score: avgScore2,
        duration_seconds: duration,
        questions: allAnswers,
        answers: allAnswers,
        feedback: { summary: "Voice interview feedback", avg_score: avgScore2 },
        status: "completed"
      });
      if (!data.error) {
        await refreshProfile();
      }
    }
    setSaving(false);
    setStage("feedback");
  }, [user, startTime, stop, refreshProfile]);
  const restart = () => {
    reset();
    setStage("setup");
    setCurrentIdx(0);
    setAnswers([]);
    setRecordingTime(0);
  };
  const beginInterview = () => {
    setStage("interview");
    setCurrentIdx(0);
    setAnswers([]);
    setTranscript("");
    setRecordingTime(0);
    setStartTime(Date.now());
    toast.success("Voice interview started! Click the mic to record your answer.");
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  if (!isSupported) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Voice Interview" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Practice speaking your answers aloud." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(MicOff, { className: "w-8 h-8 text-accent-600" }) }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "Voice Recognition Unavailable" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 text-sm mt-2 max-w-md mx-auto", children: "Your browser doesn't support speech recognition. Please use Chrome or Edge for the best experience, or try our text-based mock interview instead." }),
        /* @__PURE__ */ jsx(Button, { className: "mt-6", onClick: () => navigate("/app/mock-interview"), children: "Go to Mock Interview" })
      ] })
    ] });
  }
  if (stage === "setup") {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Voice Interview Practice" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Speak your answers and get AI feedback on your delivery." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(Volume2, { className: "w-7 h-7 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "How It Works" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: "5 questions \u2022 Speak naturally \u2022 Get instant feedback" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
          "Click the microphone button to start recording.",
          "Speak your answer clearly and at a natural pace.",
          "Click stop when done, then submit to get AI feedback."
        ].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-ink-600", children: [
          /* @__PURE__ */ jsx("span", { className: "w-6 h-6 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-semibold", children: i + 1 }),
          s
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "mb-6 bg-accent-50 border-accent-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-accent-800", children: "Microphone Permission Required" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-accent-700 mt-1", children: 'When you click the mic, your browser will ask for microphone access. Click "Allow" to record your answers. Use Chrome or Edge for best results.' })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-ink-500", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
          "5 questions \u2022 10-15 minutes"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "lg", onClick: beginInterview, children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
          "Start Voice Interview"
        ] })
      ] })
    ] });
  }
  if (stage === "interview") {
    const progress = (currentIdx + 1) / voiceQuestions.length * 100;
    const isListening = micState === "listening";
    return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "font-display font-bold text-xl text-ink-950", children: [
              "Question ",
              currentIdx + 1,
              " of ",
              voiceQuestions.length
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: "Voice Interview" })
          ] }),
          /* @__PURE__ */ jsx(Badge, { color: "accent", children: "Voice" })
        ] }),
        /* @__PURE__ */ jsx(ProgressBar, { value: progress, color: "accent" })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Mic, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-accent-600 font-medium mb-1", children: "Question" }),
          /* @__PURE__ */ jsx("p", { className: "text-ink-900 font-medium leading-relaxed", children: voiceQuestions[currentIdx] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center py-8", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: isListening ? stop : start,
              className: cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                isListening ? "bg-red-500 animate-pulse-glow scale-110" : "bg-accent-500 hover:bg-accent-600 shadow-glow-accent hover:scale-105"
              ),
              children: isListening ? /* @__PURE__ */ jsx(Square, { className: "w-8 h-8 text-white" }) : /* @__PURE__ */ jsx(Mic, { className: "w-8 h-8 text-white" })
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-medium text-ink-700", children: isListening ? `Recording\u2026 ${fmtTime(recordingTime)}` : "Click to start recording" }),
          micError && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-red-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5" }),
            " ",
            micError
          ] })
        ] }),
        transcript && /* @__PURE__ */ jsxs("div", { className: "mt-4 bg-ink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-500 mb-2", children: "Live Transcript" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-700", children: transcript })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
            stop();
            navigate("/app/dashboard");
          }, children: "Exit" }),
          /* @__PURE__ */ jsx(Button, { onClick: submitAnswer, disabled: saving || !transcript.trim(), children: currentIdx < voiceQuestions.length - 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            "Next ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Finish ",
            /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" })
          ] }) })
        ] })
      ] })
    ] });
  }
  const avgScore = answers.length ? answers.reduce((s, a) => s + a.score, 0) / answers.length : 0;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-100 mb-4", children: /* @__PURE__ */ jsx(Award, { className: "w-8 h-8 text-accent-600" }) }),
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "Voice Interview Complete!" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Review your spoken answers and AI feedback." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6 flex flex-col items-center", children: [
      /* @__PURE__ */ jsx(ScoreRing, { score: avgScore, size: 140 }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-6", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: restart, children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4" }),
          "New Session"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => navigate("/app/history"), children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" }),
          "View History"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "Your Responses" }),
      answers.map((a, i) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 mb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center text-sm font-semibold text-ink-600", children: i + 1 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-900", children: a.question })
          ] }),
          /* @__PURE__ */ jsx("div", { className: cn("px-2.5 py-1 rounded-lg text-sm font-semibold flex-shrink-0", a.score >= 80 ? "bg-brand-100 text-brand-700" : a.score >= 60 ? "bg-accent-100 text-accent-700" : "bg-red-100 text-red-700"), children: a.score })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-ink-50 rounded-xl p-3 mb-3 flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-ink-700 italic", children: [
            '"',
            a.answer,
            '"'
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-accent-50 rounded-xl p-3 border border-accent-100", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-accent-600 font-medium mb-1", children: "AI Feedback" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-700", children: a.feedback })
        ] })
      ] }, a.id))
    ] })
  ] });
}
export {
  VoiceInterviewPage as default
};
