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
  AlertCircle,
  User,
  Briefcase,
  DollarSign,
  Heart,
  Target
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button, Badge, ScoreRing, ProgressBar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { useSpeechRecognition } from "../../lib/useSpeechRecognition";
const iconMap = { User, Briefcase, DollarSign, Heart, Target };
const hrTopics = [
  { id: "self-intro", name: "Self Introduction", icon: "User" },
  { id: "strengths", name: "Strengths & Weaknesses", icon: "Target" },
  { id: "experience", name: "Work Experience", icon: "Briefcase" },
  { id: "salary", name: "Salary Negotiation", icon: "DollarSign" },
  { id: "culture-fit", name: "Culture Fit", icon: "Heart" },
  { id: "career-goals", name: "Career Goals", icon: "Target" }
];
const topicQuestions = {
  "self-intro": [
    {
      q: "Tell me about yourself. Walk me through your background.",
      a: 'Start with your present role and a recent accomplishment, then work backwards through relevant experience, and close with why you are excited about this opportunity. Keep it to 60-90 seconds. Example: "I am a software engineer with 5 years of experience building web applications. In my current role at [Company], I lead a team that shipped [product], increasing user engagement by 30%. Before that, I worked at [Company] where I learned [skill]. I am now looking for a role where I can apply my skills in [area] and contribute to [company mission]."',
      keywords: ["present", "experience", "accomplishment", "role", "skills", "excited", "contribute", "team", "background", "relevant"]
    },
    {
      q: "What makes you unique as a candidate?",
      a: 'Highlight a combination of skills, experiences, or perspectives that most candidates would not have. Tie it to the role. Example: "What sets me apart is my blend of technical depth and product sense \u2014 I can architect a system and also talk to customers to shape the roadmap. At my last company, this let me ship a feature that reduced churn by 15% because I understood both the engineering constraints and the user pain points." Avoid generic traits like "hardworking"; be specific and evidence-backed.',
      keywords: ["unique", "combination", "skills", "perspective", "specific", "evidence", "blend", "role", "example", "experience"]
    },
    {
      q: "How would your colleagues describe you?",
      a: 'Pick 2-3 positive traits that are relevant to the role and back each with a brief example. Example: "My colleagues would describe me as reliable and collaborative. On a recent tight-deadline project, I was the person the team came to for unblocking issues, and we delivered on time because I kept communication open across design and engineering." Choose traits that align with the company culture and show self-awareness.',
      keywords: ["colleagues", "describe", "reliable", "collaborative", "example", "team", "communication", "traits", "culture", "self-aware"]
    }
  ],
  "strengths": [
    {
      q: "What are your greatest strengths? Give an example of each.",
      a: 'Name 2-3 strengths directly tied to the job requirements, each with a concrete example. Example: "One of my key strengths is problem-solving. When our deployment pipeline was failing intermittently, I debugged it systematically and found a race condition, then added safeguards that reduced failures to zero. A second strength is mentoring \u2014 I onboarded three junior engineers last year, and two were promoted within 12 months." Use the STAR format (Situation, Task, Action, Result) for each example.',
      keywords: ["strengths", "example", "problem-solving", "mentoring", "STAR", "situation", "task", "action", "result", "concrete"]
    },
    {
      q: "What is an area you're actively working to improve?",
      a: `Choose a real but non-critical weakness and show what you are doing about it. Avoid clich\xE9s like "I am a perfectionist." Example: "I have been working on my public speaking. Earlier in my career I was nervous presenting to large groups, so I joined Toastmasters and volunteered to present our team's work at company all-hands. I am now much more comfortable, though I still look for opportunities to practice." This shows self-awareness and a growth mindset.`,
      keywords: ["improve", "weakness", "working", "self-awareness", "growth", "example", "action", "learning", "practice", "honest"]
    },
    {
      q: "Tell me about a time one of your strengths made a real difference.",
      a: 'Use the STAR method to tell a specific story where a strength led to a measurable outcome. Example: "My attention to detail made a difference on a payment integration project. While testing, I noticed an edge case where refunds could be double-processed. I flagged it, wrote additional test cases, and we fixed it before launch. That prevented what could have been a significant financial bug affecting thousands of transactions." Pick a story that highlights a strength relevant to the role you are interviewing for.',
      keywords: ["STAR", "difference", "specific", "outcome", "measurable", "attention", "detail", "example", "result", "impact"]
    }
  ],
  "experience": [
    {
      q: "Walk me through your most relevant work experience.",
      a: 'Focus on the 1-2 roles most relevant to the position, using a past-present-future structure. For each role, give your title, scope (team size, budget, users), and 1-2 quantified achievements. Example: "At [Company], I was a senior engineer leading a team of 4. We rebuilt the checkout flow, which increased conversion by 22%. Before that, at [Company], I built the analytics pipeline that processed 50M events per day." Avoid reciting your entire resume \u2014 curate for relevance.',
      keywords: ["relevant", "role", "title", "scope", "achievement", "quantified", "conversion", "team", "impact", "curate"]
    },
    {
      q: "What was your most challenging project and how did you handle it?",
      a: 'Use STAR: describe the Situation (what made it challenging \u2014 technical, timeline, people), the Task (your specific responsibility), the Action (steps you took), and the Result (outcome with metrics). Example: "We had 6 weeks to migrate a legacy system with zero downtime. The challenge was that the old and new schemas were incompatible. I designed a dual-write bridge, wrote a rollback plan, and we migrated in phases with monitoring. We completed it with zero data loss and only 2 minutes of planned downtime." Emphasize your specific contribution, not just the team.',
      keywords: ["challenging", "STAR", "situation", "task", "action", "result", "migration", "downtime", "monitoring", "specific"]
    },
    {
      q: "Describe a time you took initiative beyond your job description.",
      a: `Show proactivity with a concrete example and its impact. Example: "I noticed our onboarding documentation was outdated, causing new hires to struggle in their first week. Even though it wasn't my responsibility, I spent a few hours each week over a month rewriting it and creating video walkthroughs. New hire ramp-up time dropped from 3 weeks to 1 week, and HR adopted the materials company-wide." This demonstrates ownership and a bias toward action \u2014 qualities employers value.`,
      keywords: ["initiative", "beyond", "proactive", "ownership", "impact", "example", "result", "documentation", "onboarding", "action"]
    }
  ],
  "salary": [
    {
      q: "What are your salary expectations for this role?",
      a: 'Provide a range based on research rather than a single number, and express flexibility. Example: "Based on my research on [Glassdoor/Levels.fyi] for this role and my experience level in this market, I am looking for a range of $X to $Y. However, I am flexible depending on the total compensation package \u2014 benefits, equity, growth opportunities, and sign-on bonuses all factor into my decision." If pressed early, you can defer: "I would like to learn more about the role and responsibilities before giving a specific number." Always have a researched number ready.',
      keywords: ["range", "research", "flexible", "market", "compensation", "benefits", "equity", "total package", "glassdoor", "levels.fyi"]
    },
    {
      q: "How do you determine your market value?",
      a: 'Show that you research using multiple sources. Example: "I look at several data points: salary surveys from Glassdoor and Levels.fyi, industry reports, conversations with peers in similar roles, and input from recruiters I trust. I also factor in my specific skills, experience, location, and the value I bring. For this role, I have done that research and it places me in the $X-$Y range." This demonstrates you are informed, reasonable, and data-driven rather than arbitrary.',
      keywords: ["market value", "research", "glassdoor", "levels.fyi", "peers", "recruiters", "skills", "experience", "data", "informed"]
    },
    {
      q: "If we offer below your expectation, how would you respond?",
      a: 'Show collaboration rather than confrontation. Example: "I would want to understand the full picture \u2014 base salary, bonus, equity, benefits, growth trajectory, and the total value of the package. If the base is below my range but equity or benefits make up for it, I am open. If there is a gap, I would ask if there is room for negotiation or if performance reviews could bridge it within the first year. My goal is a fair arrangement that reflects the value I will bring, and I am confident we can find common ground."',
      keywords: ["below", "total package", "equity", "benefits", "negotiation", "flexible", "fair", "collaborate", "common ground", "gap"]
    }
  ],
  "culture-fit": [
    {
      q: "What kind of work environment do you thrive in?",
      a: 'Be honest but align with the company culture you are interviewing for (research it first). Example: "I thrive in collaborative environments where teams own problems end-to-end and there is a bias for action. I enjoy regular feedback and transparent communication. In my last role, we had weekly retrospectives and open planning sessions, which helped me do my best work." Avoid describing an environment opposite to the target company \u2014 if they are fast-paced and you say you prefer slow and structured, that is a red flag.',
      keywords: ["environment", "collaborative", "ownership", "feedback", "communication", "transparent", "bias for action", "culture", "honest", "align"]
    },
    {
      q: "How do you handle working with diverse teams?",
      a: 'Show genuine appreciation for diversity with a specific example. Example: "I have worked on teams across 4 time zones and multiple cultures. I make effort to accommodate time zones by rotating meeting times, I communicate asynchronously with clear written context so non-native speakers can follow, and I actively seek input from quieter team members who may not jump into calls. On a recent project, this approach helped us catch a localization bug that a homogeneous team would have missed." Demonstrate emotional intelligence and adaptability.',
      keywords: ["diverse", "cultures", "time zones", "asynchronous", "communication", "inclusive", "input", "emotional intelligence", "adaptability", "example"]
    },
    {
      q: "What values are most important to you in a workplace?",
      a: `Pick 2-3 values and show they are lived, not just stated. Example: "Integrity, collaboration, and continuous learning. Integrity means being honest about risks and mistakes, not just successes. Collaboration means sharing credit and helping others succeed. Continuous learning means I invest time in growing, like the certification I completed last quarter. I look for a company that shares these values in practice, not just on a wall." Connect each value to the company's stated values where possible.`,
      keywords: ["values", "integrity", "collaboration", "learning", "honest", "practice", "growth", "certification", "company", "shared"]
    }
  ],
  "career-goals": [
    {
      q: "Where do you see yourself in 5 years?",
      a: `Show ambition aligned with the company's growth path, without sounding like you will leave or compete with the interviewer. Example: "In 5 years, I want to be a technical leader who has shipped impactful products and mentored others. At this company, I could see myself growing into a staff or principal engineer role, owning larger systems and helping set technical direction. I am also interested in [relevant area], and I know this company invests in that, which is why I am excited about the long-term fit." Avoid "I want your job" or "I want to start my own company."`,
      keywords: ["5 years", "growth", "leader", "mentor", "staff", "principal", "technical direction", "company", "impact", "fit"]
    },
    {
      q: "What are your long-term career aspirations?",
      a: 'Describe a direction that this role is a logical step toward. Example: "My long-term aspiration is to become an expert in [field] and a leader who builds products that matter at scale. This role is a great next step because it lets me deepen my expertise in [specific skill] while taking on more responsibility. I also want to contribute to the community \u2014 I have started mentoring at [program] and hope to speak at conferences as I grow." Show that you have thought about your trajectory and that this job fits it.',
      keywords: ["aspiration", "expert", "leader", "scale", "role", "step", "responsibility", "community", "mentor", "trajectory"]
    },
    {
      q: "Why are you interested in this particular role?",
      a: `Tie the role to your skills, interests, and the company mission with specifics. Example: "I am interested because this role combines my two strongest areas \u2014 backend systems and product thinking. I was excited to see the focus on [specific product/challenge] because I worked on a similar problem at [previous company]. I also admire [company]'s mission to [mission], and I want to contribute my experience in [area] to help achieve it." Generic answers like "it seems like a great opportunity" fall flat \u2014 be specific about what attracts you.`,
      keywords: ["interested", "skills", "mission", "specific", "product", "challenge", "experience", "contribute", "company", "attracts"]
    }
  ]
};
const STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "as",
  "into",
  "like",
  "through",
  "after",
  "over",
  "between",
  "out",
  "against",
  "during",
  "without",
  "before",
  "under",
  "around",
  "among",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "she",
  "they",
  "them",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "now",
  "from"
]);
function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}
function generateHRFeedback(answer, modelAnswer, keywords) {
  if (!answer.trim()) {
    return { score: 0, feedback: "No speech detected. Check your microphone and try again. Review the model answer below for guidance." };
  }
  const answerTokens = new Set(tokenize(answer));
  const modelTokens = new Set(tokenize(modelAnswer));
  const answerLower = answer.toLowerCase();
  const matched = [];
  const missed = [];
  keywords.forEach((kw) => {
    if (answerLower.includes(kw.toLowerCase())) matched.push(kw);
    else missed.push(kw);
  });
  const keywordScore = keywords.length > 0 ? matched.length / keywords.length * 100 : 50;
  let overlap = 0;
  modelTokens.forEach((t) => {
    if (answerTokens.has(t)) overlap++;
  });
  const overlapScore = modelTokens.size > 0 ? Math.min(100, overlap / modelTokens.size * 130) : 0;
  const words = answer.trim().split(/\s+/).length;
  const hasExample = /\b(example|instance|situation|time when|project)\b/i.test(answer);
  const hasResult = /\b(result|outcome|impact|because of this|led to)\b/i.test(answer);
  let structureBonus = 0;
  if (hasExample) structureBonus += 10;
  if (hasResult) structureBonus += 10;
  const score = Math.min(98, Math.max(20, Math.round(keywordScore * 0.55 + overlapScore * 0.35 + structureBonus)));
  let feedback = "";
  if (score >= 85) {
    feedback = `Excellent answer! You covered ${matched.length}/${keywords.length} key points with strong structure. Your response used concrete examples effectively.`;
  } else if (score >= 65) {
    feedback = `Good answer covering ${matched.length}/${keywords.length} key points. To strengthen it, include: ${missed.slice(0, 3).join(", ")}.`;
  } else if (score >= 40) {
    feedback = `Partial answer (${matched.length}/${keywords.length} key points). Missing: ${missed.slice(0, 4).join(", ")}. Practice the STAR method and review the model answer.`;
  } else {
    feedback = `Needs improvement (${matched.length}/${keywords.length} key points). Study the model answer below and focus on: ${missed.slice(0, 5).join(", ")}.`;
  }
  return { score: Math.min(98, Math.max(5, score)), feedback };
}
function HRInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState("setup");
  const [topic, setTopic] = useState("self-intro");
  const [questions, setQuestions] = useState([]);
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
  const startInterview = () => {
    const pool = [...topicQuestions[topic] || []];
    setQuestions(pool);
    setCurrentIdx(0);
    setAnswers([]);
    setTranscript("");
    setStage("interview");
    setStartTime(Date.now());
    toast.success("HR interview started! Click the mic and speak your answer.");
  };
  const submitAnswer = () => {
    if (!transcript.trim()) {
      toast.error("No speech recorded. Click the mic and speak your answer.");
      return;
    }
    stop();
    const currentQ = questions[currentIdx];
    const { score, feedback } = generateHRFeedback(transcript, currentQ.a, currentQ.keywords);
    const qa = {
      id: `q-${currentIdx}`,
      question: currentQ.q,
      answer: transcript,
      feedback,
      score,
      model_answer: currentQ.a
    };
    const newAnswers = [...answers, qa];
    setAnswers(newAnswers);
    setTranscript("");
    setRecordingTime(0);
    if (currentIdx < questions.length - 1) {
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
        type: "hr",
        topic,
        difficulty: "medium",
        score: avgScore2,
        duration_seconds: duration,
        questions: allAnswers,
        answers: allAnswers,
        feedback: { summary: "HR interview feedback", avg_score: avgScore2 },
        status: "completed"
      });
      if (!data.error) {
        await refreshProfile();
      }
    }
    setSaving(false);
    setStage("feedback");
  }, [user, topic, startTime, stop, refreshProfile]);
  const restart = () => {
    reset();
    setStage("setup");
    setCurrentIdx(0);
    setAnswers([]);
    setRecordingTime(0);
  };
  const avgScore = answers.length ? answers.reduce((s, a) => s + a.score, 0) / answers.length : 0;
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  if (!isSupported) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "HR Interview" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Practice behavioral and HR questions by speaking your answers." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(MicOff, { className: "w-8 h-8 text-sky-600" }) }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "Voice Recognition Unavailable" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 text-sm mt-2 max-w-md mx-auto", children: "Your browser doesn't support speech recognition. Please use Chrome or Edge, or try the text-based AI Mock Interview." }),
        /* @__PURE__ */ jsx(Button, { className: "mt-6", onClick: () => navigate("/app/mock-interview"), children: "Go to Mock Interview" })
      ] })
    ] });
  }
  if (stage === "setup") {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "HR Interview Practice" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Master behavioral and HR questions by speaking your answers aloud." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900 mb-4", children: "Choose an HR Topic" }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: hrTopics.map((t) => {
          const Icon = iconMap[t.icon] || User;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setTopic(t.id),
              className: cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                topic === t.id ? "border-sky-400 bg-sky-50" : "border-ink-200 hover:border-ink-300"
              ),
              children: [
                /* @__PURE__ */ jsx("div", { className: cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", topic === t.id ? "bg-sky-500" : "bg-ink-100"), children: /* @__PURE__ */ jsx(Icon, { className: cn("w-5 h-5", topic === t.id ? "text-white" : "text-ink-600") }) }),
                /* @__PURE__ */ jsx("p", { className: "font-medium text-sm text-ink-900", children: t.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink-500 mt-0.5", children: [
                  (topicQuestions[t.id] || []).length,
                  " questions"
                ] })
              ]
            },
            t.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "mb-6 bg-sky-50 border-sky-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-sky-800", children: "Voice-Only Mode & Microphone Permission" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-sky-700 mt-1", children: 'This is a voice-only interview. When you click the mic, your browser will ask for microphone access \u2014 click "Allow". Use Chrome or Edge for best results.' })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-ink-500", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
          "3 questions \u2022 5-10 minutes"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "lg", onClick: startInterview, children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
          "Start HR Interview"
        ] })
      ] })
    ] });
  }
  if (stage === "interview") {
    const progress = (currentIdx + 1) / questions.length * 100;
    const isListening = micState === "listening";
    return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "font-display font-bold text-xl text-ink-950", children: [
              "Question ",
              currentIdx + 1,
              " of ",
              questions.length
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: hrTopics.find((t) => t.id === topic)?.name })
          ] }),
          /* @__PURE__ */ jsx(Badge, { color: "sky", children: "HR Round" })
        ] }),
        /* @__PURE__ */ jsx(ProgressBar, { value: progress, color: "sky" })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-brand-400 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Mic, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-sky-600 font-medium mb-1", children: "HR Interviewer" }),
          /* @__PURE__ */ jsx("p", { className: "text-ink-900 font-medium leading-relaxed", children: questions[currentIdx].q })
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
                isListening ? "bg-red-500 animate-pulse-glow scale-110" : "bg-sky-500 hover:bg-sky-600 shadow-glow-sky hover:scale-105"
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
          /* @__PURE__ */ jsx(Button, { onClick: submitAnswer, disabled: saving || !transcript.trim(), children: currentIdx < questions.length - 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
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
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-100 mb-4", children: /* @__PURE__ */ jsx(Award, { className: "w-8 h-8 text-sky-600" }) }),
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "HR Interview Complete!" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Here's how you did on your behavioral responses." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6 flex flex-col items-center", children: [
      /* @__PURE__ */ jsx(ScoreRing, { score: avgScore, size: 140 }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-6", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: restart, children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4" }),
          "New Interview"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => navigate("/app/history"), children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" }),
          "View History"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display font-semibold text-lg text-ink-900", children: "Detailed Feedback" }),
      answers.map((a, i) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 mb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center text-sm font-semibold text-ink-600", children: i + 1 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-900", children: a.question })
          ] }),
          /* @__PURE__ */ jsx("div", { className: cn("px-2.5 py-1 rounded-lg text-sm font-semibold flex-shrink-0", a.score >= 80 ? "bg-brand-100 text-brand-700" : a.score >= 60 ? "bg-accent-100 text-accent-700" : "bg-red-100 text-red-700"), children: a.score })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-ink-50 rounded-xl p-3 mb-3 flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-ink-700 italic", children: [
            '"',
            a.answer,
            '"'
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-sky-50 rounded-xl p-3 mb-3 border border-sky-100", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-sky-600 font-medium mb-1", children: "AI Feedback" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-700", children: a.feedback })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-brand-50 to-sky-50 rounded-xl p-3 border border-brand-100", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-brand-600 font-medium mb-1", children: "Model Answer" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-700 leading-relaxed", children: a.model_answer })
        ] })
      ] }, a.id))
    ] })
  ] });
}
export {
  HRInterviewPage as default
};
