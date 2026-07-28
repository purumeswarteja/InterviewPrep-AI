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

const voiceQuestions = [
  "Tell me about yourself and what drew you to this field.",
  "Describe a challenging project you worked on and how you overcame obstacles.",
  "How do you handle conflict or differing opinions within a technical team?",
  "Where do you see your career heading in the next few years?",
  "What is a technical or professional skill you are currently learning, and why?",
  "Tell me about a time you received difficult feedback. How did you respond?",
  "Describe a situation where you had to work under a tight deadline to ship a feature.",
  "How do you prioritize your tasks when managing multiple competing deadlines?",
  "Explain a complex technical concept you mastered recently as if explaining it to a non-technical manager.",
  "Tell me about a time you made a technical mistake or suffered a failure. What did you learn?"
];

const sampleAnswers = {
  0: "I am a software engineer passionate about building web applications. I began my career building full-stack projects using React and Node.js. In my recent project, I built an automated workflow system that reduced task processing time by 40%. I enjoy solving complex problems and collaborating with cross-functional teams.",
  1: "In my previous project, we faced a performance bottleneck where database queries took over 4 seconds. I diagnosed the issue using query profiling, added composite indexes, and implemented a Redis caching layer. This reduced latency to under 100ms and ensured smooth user experience under high traffic.",
  2: "When conflicts arise, I focus on active listening and data-driven discussions. Recently, a teammate and I disagreed on state management architecture. We listed pros and cons of both approaches, ran a quick benchmark prototype, and collectively agreed on the most scalable solution for our codebase.",
  3: "Over the next 3 to 5 years, I aim to grow into a senior technical lead. I want to deepen my architecture expertise in distributed systems while mentoring junior developers and driving key product initiatives.",
  4: "I am currently learning TypeScript and modern system design patterns. Type safety helps catch bugs early during development, and mastering system design helps me architect scalable, resilient cloud applications."
};

function generateVoiceFeedback(text) {
  if (!text || !text.trim()) return { score: 0, feedback: "No response detected. Record your voice or type your answer before continuing." };
  const words = text.trim().split(/\s+/).length;
  let score = 65;
  if (/\b(example|instance|project|team|led|built|improved|solved|designed)\b/i.test(text)) score += 15;
  if (/\b(result|outcome|impact|because of this|metrics|learned)\b/i.test(text)) score += 12;
  if (words < 15) score -= 15;
  score = Math.min(98, Math.max(35, score));
  let feedback = "";
  if (score >= 80) feedback = `Clear and well-structured response (${words} words). Great use of concrete technical examples and outcomes.`;
  else if (score >= 65) feedback = `Good response covering the key points. Try to include a specific metric or quantitative result to strengthen it further.`;
  else feedback = `Decent effort. Aim for a structured response using the STAR method (Situation, Task, Action, Result) with at least 30-50 words.`;
  return { score, feedback };
}

export default function VoiceInterviewPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState("setup");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [manualText, setManualText] = useState("");

  const {
    state: micState,
    transcript,
    error: micError,
    audioBlob,
    start,
    stop,
    reset,
    setTranscript
  } = useSpeechRecognition();

  const isRecording = micState === "listening" || micState === "recording_fallback";

  // Sync transcript or manual input
  const activeAnswerText = manualText || transcript;

  useEffect(() => {
    if (isRecording) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
      const t = setInterval(() => setRecordingTime((s) => s + 1), 1000);
      return () => clearInterval(t);
    } else {
      setRecordingTime(0);
    }
  }, [isRecording]);

  const speakQuestionVoice = useCallback((text) => {
    if (!text) return;
    stopSpeaking();
    setIsSpeakingQuestion(true);
    speakText(text, {
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => setIsSpeakingQuestion(false),
      onError: () => setIsSpeakingQuestion(false)
    }).catch(() => setIsSpeakingQuestion(false));
  }, []);

  useEffect(() => {
    if (stage === "interview" && autoSpeak && voiceQuestions[currentIdx]) {
      speakQuestionVoice(voiceQuestions[currentIdx]);
    }
    return () => {
      stopSpeaking();
    };
  }, [stage, currentIdx, autoSpeak, speakQuestionVoice]);

  useEffect(() => {
    return () => {
      stop();
      stopSpeaking();
    };
  }, [stop]);

  const submitAnswer = () => {
    const textToSubmit = activeAnswerText.trim();
    if (!textToSubmit) {
      toast.error("Please record your voice or type an answer before continuing.");
      return;
    }
    stop();
    stopSpeaking();
    setIsSpeakingQuestion(false);

    const { score, feedback } = generateVoiceFeedback(textToSubmit);
    const qa = {
      id: `q-${currentIdx}`,
      question: voiceQuestions[currentIdx],
      answer: textToSubmit,
      feedback,
      score
    };
    const newAnswers = [...answers, qa];
    setAnswers(newAnswers);
    setTranscript("");
    setManualText("");
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
    stopSpeaking();
    const avgScoreVal = allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length;
    const duration = Math.floor((Date.now() - startTime) / 1000);

    if (user) {
      const data = await api.createSession({
        user_id: user.id,
        type: "voice",
        topic: "voice-practice",
        difficulty: "medium",
        score: avgScoreVal,
        duration_seconds: duration,
        questions: allAnswers,
        answers: allAnswers,
        feedback: { summary: "Voice interview performance evaluation", avg_score: avgScoreVal },
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
    stopSpeaking();
    reset();
    setStage("setup");
    setCurrentIdx(0);
    setAnswers([]);
    setManualText("");
    setRecordingTime(0);
  };

  const beginInterview = () => {
    stopSpeaking();
    setStage("interview");
    setCurrentIdx(0);
    setAnswers([]);
    setTranscript("");
    setManualText("");
    setRecordingTime(0);
    setStartTime(Date.now());
    toast.success("Voice interview started! AI will read questions out loud.");
  };

  const useSampleResponse = () => {
    const sample = sampleAnswers[currentIdx % Object.keys(sampleAnswers).length] || sampleAnswers[0];
    setManualText(sample);
    setTranscript(sample);
    toast.success("Loaded sample response into answer box.");
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (stage === "setup") {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
            Voice AI Interview Practice
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Interactive 2-Way Voice AI: The AI reads questions aloud, and you respond by voice or speech transcript.
          </p>
        </div>

        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-gray-900">How Voice AI Works</h2>
              <p className="text-xs text-gray-500">{voiceQuestions.length} practice questions • AI Speech & Real-time Evaluation</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {[
              "AI Interviewer speaks each question out loud.",
              "Click the mic to speak your answer into your device.",
              "Automatic dual-engine fallback (Web Speech & Local Audio Mic).",
              "Instant AI evaluation score and speech feedback breakdown."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <Radio className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Microphone & Dual-Engine Ready</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Supports all modern browsers with automated HTML5 local audio fallback if cloud speech servers are restricted.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{voiceQuestions.length} questions • 10-15 minutes estimated</span>
          </div>
          <Button
            size="lg"
            onClick={beginInterview}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Voice Interview</span>
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "interview") {
    const progress = ((currentIdx + 1) / voiceQuestions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        {/* Progress Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-gray-900">
                Question {currentIdx + 1} of {voiceQuestions.length}
              </h1>
              <p className="text-xs text-gray-500">Voice Interview Round</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextAuto = !autoSpeak;
                  setAutoSpeak(nextAuto);
                  if (!nextAuto) stopSpeaking();
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer",
                  autoSpeak ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-100 border-gray-200 text-gray-600"
                )}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {autoSpeak ? "AI Voice: ON" : "AI Voice: OFF"}
              </button>
              <Badge color="brand">2-Way Voice</Badge>
            </div>
          </div>
          <ProgressBar value={progress} color="brand" />
        </div>

        {/* AI Interviewer Question Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all",
                  isSpeakingQuestion ? "bg-emerald-500 animate-bounce shadow-lg shadow-emerald-200" : "bg-emerald-600"
                )}
              >
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    AI Technical Interviewer
                  </p>
                  {isSpeakingQuestion && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Speaking...
                    </span>
                  )}
                </div>
                <p className="text-gray-900 font-medium text-base leading-relaxed">
                  {voiceQuestions[currentIdx]}
                </p>
              </div>
            </div>
            <button
              onClick={() => speakQuestionVoice(voiceQuestions[currentIdx])}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition flex-shrink-0"
              title="Replay AI Question Voice"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </Card>

        {/* Recording & Input Controls */}
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

          {/* Editable Transcript Box */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Spoken Answer Transcript & Editable Text</span>
              </label>
              <button
                type="button"
                onClick={useSampleResponse}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample Response</span>
              </button>
            </div>

            <textarea
              value={activeAnswerText}
              onChange={(e) => {
                setManualText(e.target.value);
                setTranscript(e.target.value);
              }}
              rows={4}
              placeholder="Your speech transcript will automatically appear here. You can also edit or type your answer manually..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 leading-relaxed resize-none transition"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                stop();
                stopSpeaking();
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
              {currentIdx < voiceQuestions.length - 1 ? (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Finish Interview</span>
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
          Voice Interview Complete!
        </h1>
        <p className="text-gray-500 text-sm">
          Review your spoken responses, transcription quality, and AI voice feedback.
        </p>
      </div>

      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <ScoreRing score={avgScore} size={140} />

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={restart} className="rounded-xl border-gray-200 text-gray-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Session
          </Button>
          <Button onClick={() => navigate("/app/history")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            <TrendingUp className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900">Your Responses & AI Feedback</h2>
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

            <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  AI Voice Feedback
                </p>
                <p className="text-sm text-gray-800">{a.feedback}</p>
              </div>
              <button
                onClick={() => speakText(a.feedback)}
                className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition flex-shrink-0"
                title="Listen to AI Feedback Voice"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
