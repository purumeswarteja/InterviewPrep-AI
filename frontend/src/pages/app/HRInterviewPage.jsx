import React, { useState, useCallback, useEffect } from "react";
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
  VolumeX,
  Clock,
  Sparkles,
  AlertCircle,
  User,
  Briefcase,
  DollarSign,
  Heart,
  Target,
  Play,
  Edit3,
  Lightbulb,
  Radio
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button, Badge, ScoreRing, ProgressBar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { useSpeechRecognition } from "../../lib/useSpeechRecognition";
import { speakText, stopSpeaking } from "../../lib/speech";

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
      a: 'Start with your present role and a recent accomplishment, then work backwards through relevant experience, and close with why you are excited about this opportunity. Keep it to 60-90 seconds. Example: "I am a software engineer with experience building full-stack applications. In my recent project, I led the frontend architecture for our core product, increasing user engagement by 30%. I am now looking for a role where I can contribute to impactful software engineering solutions."',
      keywords: ["present", "experience", "accomplishment", "role", "skills", "excited", "contribute", "team", "background", "relevant"]
    },
    {
      q: "What makes you unique as a candidate?",
      a: 'Highlight a combination of skills, experiences, or perspectives that set you apart. Example: "What sets me apart is my blend of technical engineering depth and strong product sense — I can architect clean code and also talk to users to shape feature design."',
      keywords: ["unique", "combination", "skills", "perspective", "specific", "evidence", "blend", "role", "example", "experience"]
    },
    {
      q: "How would your colleagues describe you?",
      a: 'Pick positive traits relevant to the role. Example: "My colleagues would describe me as reliable, proactive, and collaborative. On tight deadlines, I keep communication clear and help unblock teammates."',
      keywords: ["colleagues", "describe", "reliable", "collaborative", "example", "team", "communication", "traits", "culture", "self-aware"]
    }
  ],
  "strengths": [
    {
      q: "What are your greatest strengths? Give an example of each.",
      a: 'Name 2-3 strengths tied to the job requirements. Example: "One of my key strengths is systematic problem solving. When our deployment pipeline was failing, I debugged it methodically and added safeguards that reduced build failures to zero."',
      keywords: ["strengths", "example", "problem-solving", "mentoring", "STAR", "situation", "task", "action", "result", "concrete"]
    },
    {
      q: "What is an area you're actively working to improve?",
      a: 'Choose a real but non-critical weakness and explain your active growth steps. Example: "I have been working on public speaking. I volunteered to present our team sprints at engineering all-hands to build confidence."',
      keywords: ["improve", "weakness", "working", "self-awareness", "growth", "example", "action", "learning", "practice", "honest"]
    }
  ],
  "experience": [
    {
      q: "Walk me through your most relevant work experience.",
      a: 'Focus on 1-2 roles using past-present-future structure. Highlight your key contributions, technologies used, and quantified achievements.',
      keywords: ["relevant", "role", "title", "scope", "achievement", "quantified", "conversion", "team", "impact", "curate"]
    },
    {
      q: "What was your most challenging project and how did you handle it?",
      a: 'Use the STAR framework: Situation, Task, Action, and Result. Detail how you managed technical risks, timeline pressure, and team coordination.',
      keywords: ["challenging", "STAR", "situation", "task", "action", "result", "migration", "downtime", "monitoring", "specific"]
    }
  ],
  "salary": [
    {
      q: "What are your salary expectations for this role?",
      a: 'Provide a researched compensation range based on market data and express flexibility depending on the overall benefits and equity package.',
      keywords: ["range", "research", "flexible", "market", "compensation", "benefits", "equity", "total package", "glassdoor", "levels.fyi"]
    }
  ],
  "culture-fit": [
    {
      q: "What kind of work environment do you thrive in?",
      a: 'Describe a collaborative, transparent environment with strong feedback loops, clear goals, and ownership over problems.',
      keywords: ["environment", "collaborative", "ownership", "feedback", "communication", "transparent", "bias for action", "culture", "honest", "align"]
    }
  ],
  "career-goals": [
    {
      q: "Where do you see yourself in 5 years?",
      a: 'Express realistic ambition aligned with engineering leadership, technical mastery, and long-term value creation at the company.',
      keywords: ["5 years", "growth", "leader", "mentor", "staff", "principal", "technical direction", "company", "impact", "fit"]
    }
  ]
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "can", "to", "of", "in", "on", "at", "by",
  "for", "with", "about", "as", "into", "like", "through", "after", "over", "between",
  "out", "against", "during", "without", "before", "under", "around", "among", "it",
  "its", "this", "that", "these", "those", "i", "me", "my", "we", "our", "you",
  "your", "he", "she", "they", "them", "their", "what", "which", "who", "whom",
  "whose", "when", "where", "why", "how", "all", "each", "every", "both", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
  "same", "so", "than", "too", "very", "just", "now", "from"
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function generateHRFeedback(answer, modelAnswer, keywords) {
  if (!answer.trim()) {
    return { score: 0, feedback: "No answer detected. Click the mic or type your response before continuing." };
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

  const keywordScore = keywords.length > 0 ? (matched.length / keywords.length) * 100 : 50;
  let overlap = 0;
  modelTokens.forEach((t) => {
    if (answerTokens.has(t)) overlap++;
  });
  const overlapScore = modelTokens.size > 0 ? Math.min(100, (overlap / modelTokens.size) * 130) : 0;
  const words = answer.trim().split(/\s+/).length;

  const score = Math.min(98, Math.max(30, Math.round(keywordScore * 0.55 + overlapScore * 0.45)));
  let feedback = "";
  if (score >= 80) {
    feedback = `Excellent behavioral response! You covered ${matched.length}/${keywords.length} key points with strong structure (${words} words).`;
  } else if (score >= 60) {
    feedback = `Good answer covering ${matched.length}/${keywords.length} key points. To strengthen it, include: ${missed.slice(0, 3).join(", ")}.`;
  } else {
    feedback = `Needs improvement. Review the model answer below and focus on key concepts: ${missed.slice(0, 4).join(", ")}.`;
  }
  return { score, feedback };
}

export default function HRInterviewPage() {
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
  const [manualText, setManualText] = useState("");

  const {
    state: micState,
    transcript,
    error: micError,
    start,
    stop,
    reset,
    setTranscript
  } = useSpeechRecognition();

  const isRecording = micState === "listening" || micState === "recording_fallback";
  const activeAnswerText = manualText || transcript;

  useEffect(() => {
    if (isRecording) {
      const t = setInterval(() => setRecordingTime((s) => s + 1), 1000);
      return () => clearInterval(t);
    } else {
      setRecordingTime(0);
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const startInterview = () => {
    const pool = [...(topicQuestions[topic] || topicQuestions["self-intro"])];
    setQuestions(pool);
    setCurrentIdx(0);
    setAnswers([]);
    setTranscript("");
    setManualText("");
    setStage("interview");
    setStartTime(Date.now());
    toast.success("HR interview started! Speak your answer or edit in the box.");
  };

  const submitAnswer = () => {
    const textToSubmit = activeAnswerText.trim();
    if (!textToSubmit) {
      toast.error("Please record your voice or type your response.");
      return;
    }
    stop();
    const currentQ = questions[currentIdx];
    const { score, feedback } = generateHRFeedback(textToSubmit, currentQ.a, currentQ.keywords);
    const qa = {
      id: `q-${currentIdx}`,
      question: currentQ.q,
      answer: textToSubmit,
      feedback,
      score,
      model_answer: currentQ.a
    };
    const newAnswers = [...answers, qa];
    setAnswers(newAnswers);
    setTranscript("");
    setManualText("");
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
    const avgScoreVal = allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length;
    const duration = Math.floor((Date.now() - startTime) / 1000);

    if (user) {
      const data = await api.createSession({
        user_id: user.id,
        type: "hr",
        topic,
        difficulty: "medium",
        score: avgScoreVal,
        duration_seconds: duration,
        questions: allAnswers,
        answers: allAnswers,
        feedback: { summary: "HR interview performance breakdown", avg_score: avgScoreVal },
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
    setManualText("");
    setRecordingTime(0);
  };

  const useSampleAnswer = () => {
    if (questions[currentIdx]) {
      const model = questions[currentIdx].a;
      setManualText(model);
      setTranscript(model);
      toast.success("Loaded model response into answer box.");
    }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (stage === "setup") {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
            HR & Behavioral Interview Practice
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Master behavioral questions by speaking your answers aloud or reviewing structured responses.
          </p>
        </div>

        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-display font-semibold text-lg text-gray-900">Choose an HR Topic</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {hrTopics.map((t) => {
              const Icon = iconMap[t.icon] || User;
              const isSelected = topic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3.5 cursor-pointer",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(topicQuestions[t.id] || []).length} questions available
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <Radio className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Dual-Engine Speech & Text Enabled</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Record your voice via standard microphone or edit your response directly in the transcript box.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{(topicQuestions[topic] || []).length} questions • 5-10 minutes</span>
          </div>
          <Button
            size="lg"
            onClick={startInterview}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start HR Round</span>
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "interview") {
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        {/* Progress Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-gray-900">
                Question {currentIdx + 1} of {questions.length}
              </h1>
              <p className="text-xs text-gray-500">
                {hrTopics.find((t) => t.id === topic)?.name}
              </p>
            </div>
            <Badge color="brand">HR Round</Badge>
          </div>
          <ProgressBar value={progress} color="brand" />
        </div>

        {/* Question Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  HR Interviewer
                </p>
                <p className="text-gray-900 font-medium text-base leading-relaxed">
                  {questions[currentIdx].q}
                </p>
              </div>
            </div>
            <button
              onClick={() => speakText(questions[currentIdx].q)}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition flex-shrink-0"
              title="Listen to Question Voice"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </Card>

        {/* Recording Controls & Answer Box */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5">
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={isRecording ? stop : start}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                isRecording
                  ? "bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:scale-105"
              )}
            >
              {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </button>
            <p className="mt-3 text-sm font-semibold text-gray-800">
              {isRecording ? `Recording Voice… ${fmtTime(recordingTime)}` : "Click microphone to start voice recording"}
            </p>

            {/* Live Audio Wave Visualizer Animation */}
            {isRecording && (
              <div className="flex items-center gap-1 mt-3">
                {[40, 70, 30, 90, 50, 80, 40, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDuration: `${0.4 + (i % 4) * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}

            {micError && (
              <div className="mt-3 flex items-start gap-2 max-w-md p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>{micError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your Answer (Spoken Speech or Text)</span>
              </label>
              <button
                type="button"
                onClick={useSampleAnswer}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Model Answer Helper</span>
              </button>
            </div>

            <textarea
              value={activeAnswerText}
              onChange={(e) => {
                setManualText(e.target.value);
                setTranscript(e.target.value);
              }}
              rows={5}
              placeholder="Click the microphone to speak your answer, or type directly into this box..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 leading-relaxed resize-none transition"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                stop();
                navigate("/app/dashboard");
              }}
              className="rounded-xl border-gray-200 text-gray-700"
            >
              Exit
            </Button>
            <Button
              onClick={submitAnswer}
              disabled={saving || !activeAnswerText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-6 flex items-center gap-2"
            >
              {currentIdx < questions.length - 1 ? (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Finish Round</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Summary / Feedback Stage
  const avgScore = answers.length ? answers.reduce((s, a) => s + a.score, 0) / answers.length : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
          HR Interview Complete!
        </h1>
        <p className="text-gray-500 text-sm">
          Here is how you performed on your behavioral and HR responses.
        </p>
      </div>

      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <ScoreRing score={avgScore} size={140} />

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={restart} className="rounded-xl border-gray-200 text-gray-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Interview
          </Button>
          <Button onClick={() => navigate("/app/history")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            <TrendingUp className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900">Detailed Feedback Breakdown</h2>
        {answers.map((a, i) => (
          <Card key={a.id} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-gray-900">{a.question}</p>
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold flex-shrink-0",
                  a.score >= 80
                    ? "bg-emerald-100 text-emerald-800"
                    : a.score >= 60
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {a.score}%
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex items-start gap-2">
              <Mic className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800 italic">"{a.answer}"</p>
            </div>

            <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                AI Feedback
              </p>
              <p className="text-sm text-gray-800">{a.feedback}</p>
            </div>

            <div className="bg-sky-50/60 rounded-xl p-3.5 border border-sky-100">
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
                Model Answer Strategy
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{a.model_answer}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
