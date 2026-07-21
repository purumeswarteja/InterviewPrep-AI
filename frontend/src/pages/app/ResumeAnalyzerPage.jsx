import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import {
  FileText,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  FileCheck,
  Lightbulb,
  XCircle,
  ThumbsUp,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button, ScoreRing, Badge, ProgressBar } from "../../components/ui";
import { skillKeywords } from "../../data/questions";
async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(" ") + "\n";
  }
  return text.trim();
}
function analyzeResume(text) {
  const lower = text.toLowerCase();
  const found = [];
  const missing = [];
  skillKeywords.forEach((kw) => {
    if (lower.includes(kw.toLowerCase())) found.push(kw);
    else missing.push(kw);
  });
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : words;
  const keywordScore = Math.min(100, Math.round(found.length / skillKeywords.length * 100 * 2.5));
  let grammarScore = 50;
  if (words > 300) grammarScore = 85;
  else if (words > 150) grammarScore = 70;
  if (avgWordsPerSentence > 0 && avgWordsPerSentence < 30) grammarScore += 5;
  if (/[A-Z]/.test(text) && /[.!?]/.test(text)) grammarScore += 5;
  grammarScore = Math.min(100, grammarScore);
  const hasExperience = /experience|employment|work history/i.test(text);
  const hasEducation = /education|university|college|degree|bachelor/i.test(text);
  const hasSkills = /skills|technologies|tools|proficient/i.test(text);
  const hasProjects = /project|portfolio|github/i.test(text);
  const sectionCount = [hasExperience, hasEducation, hasSkills, hasProjects].filter(Boolean).length;
  const atsScore = Math.min(95, Math.round(keywordScore * 0.5 + sectionCount * 12 + (words > 200 ? 10 : 0)));
  const overall = Math.round(atsScore * 0.4 + grammarScore * 0.3 + keywordScore * 0.3);
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  if (found.length > 10) strengths.push(`Strong keyword presence \u2014 ${found.length} relevant skills detected.`);
  else if (found.length > 5) strengths.push(`Decent keyword coverage \u2014 ${found.length} relevant skills found.`);
  else weaknesses.push(`Only ${found.length} relevant keywords found. Add more industry-specific terms.`);
  if (hasExperience) strengths.push("Includes an Experience section \u2014 essential for ATS parsing.");
  else weaknesses.push("Missing a clearly labeled Experience/Employment section.");
  if (hasEducation) strengths.push("Education section detected.");
  else weaknesses.push("No Education section found \u2014 add your academic background.");
  if (hasSkills) strengths.push("Dedicated Skills section present.");
  else weaknesses.push("Missing a Skills section \u2014 list your technical and soft skills.");
  if (words > 300) strengths.push("Good length \u2014 detailed enough for ATS parsing.");
  else weaknesses.push(`Resume is only ${words} words. Aim for 300+ words for better ATS visibility.`);
  if (found.length < 15) suggestions.push("Add more relevant technical keywords throughout your experience descriptions.");
  if (!/\b(led|managed|built|created|improved|achieved|increased|reduced|developed|designed)\b/i.test(text))
    suggestions.push("Use action verbs (led, built, improved, achieved, developed) to describe your accomplishments.");
  if (!/\b(\d+%|\$\d+|\d+x|\d+ (users|customers|hours|days))\b/i.test(text))
    suggestions.push('Quantify your achievements with numbers (e.g., "increased sales by 25%", "served 10k users").');
  if (!hasProjects) suggestions.push("Add a Projects or Portfolio section to showcase practical work.");
  suggestions.push("Tailor your resume keywords to match each job description you apply for.");
  suggestions.push("Keep formatting simple \u2014 ATS systems prefer standard fonts and avoid tables/columns.");
  suggestions.push("Use a clear section hierarchy with standard headings (Experience, Education, Skills).");
  suggestions.push("Include links to your GitHub, LinkedIn, and portfolio if available.");
  return { atsScore, grammarScore, keywordScore, overall, found, missing: missing.slice(0, 10), strengths, weaknesses, suggestions };
}
function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");
    setResult(null);
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 10 MB.");
      return;
    }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
    const isDoc = file.name.toLowerCase().endsWith(".doc") || file.name.toLowerCase().endsWith(".docx");
    if (isDoc) {
      setFileError("Word documents are not supported yet. Please export to PDF or TXT and re-upload.");
      return;
    }
    if (!isPdf && !isTxt) {
      setFileError("Unsupported file type. Please upload a PDF or TXT file.");
      return;
    }
    setFileName(file.name);
    setParsing(true);
    try {
      if (isPdf) {
        const extracted = await extractPdfText(file);
        if (!extracted || extracted.trim().length < 20) {
          setFileError("Could not extract text from this PDF. It may be a scanned image. Try a text-based PDF or paste the content manually below.");
          setText("");
        } else {
          setText(extracted);
          toast.success(`Extracted ${extracted.split(/\s+/).length} words from PDF.`);
        }
      } else {
        const reader = new FileReader();
        const content = await new Promise((resolve, reject) => {
          reader.onload = (ev) => resolve(String(ev.target?.result || ""));
          reader.onerror = reject;
          reader.readAsText(file);
        });
        setText(content);
        toast.success("File loaded.");
      }
    } catch (err) {
      setFileError(`Failed to read file: ${err.message || "Unknown error"}.`);
      setText("");
    }
    setParsing(false);
  };
  const analyze = useCallback(async () => {
    if (!text.trim() || text.trim().length < 50) {
      toast.error("Please upload a resume with enough content (at least 50 characters).");
      return;
    }
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const analysis = analyzeResume(text);
    const payload = {
      user_id: user?.id,
      file_name: fileName || "uploaded-resume",
      resume_text: text.slice(0, 5e3),
      ats_score: analysis.atsScore,
      grammar_score: analysis.grammarScore,
      keyword_score: analysis.keywordScore,
      overall_score: analysis.overall,
      keywords_found: analysis.found,
      keywords_missing: analysis.missing,
      suggestions: analysis.suggestions,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses
    };
    const localResult = { ...payload, id: "local", user_id: user?.id || "", created_at: (/* @__PURE__ */ new Date()).toISOString() };
    if (user) {
      const data = await api.createResumeAnalysis(payload);
      if (data.error) {
        toast.error("Failed to save analysis: " + data.error);
        setResult(localResult);
      } else if (data.analysis) {
        setResult(data.analysis);
      } else {
        setResult(localResult);
      }
    } else {
      setResult(localResult);
    }
    setAnalyzing(false);
    toast.success("Resume analyzed!");
  }, [text, fileName, user]);
  const clearFile = () => {
    setFileName("");
    setText("");
    setFileError("");
    setResult(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-2xl sm:text-3xl text-ink-950", children: "AI Resume Analyzer" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-500 mt-1", children: "Upload your resume (PDF or TXT) for instant ATS scoring, keyword analysis, and feedback." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-ink-900 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Upload, { className: "w-5 h-5 text-brand-500" }),
            "Upload Resume"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsx("div", { className: `border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${fileError ? "border-red-300 bg-red-50/50" : "border-ink-200 hover:border-brand-400 hover:bg-brand-50/50"}`, children: parsing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-10 h-10 text-brand-500 mx-auto mb-3 animate-spin" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-700", children: "Extracting text from file\u2026" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(FileText, { className: "w-10 h-10 text-ink-400 mx-auto mb-3" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-ink-700", children: fileName || "Click to upload your resume" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-500 mt-1", children: "Supports PDF and TXT files (max 10 MB)" })
            ] }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: ".pdf,.txt,application/pdf,text/plain",
                onChange: handleFile,
                className: "hidden",
                disabled: parsing || analyzing
              }
            )
          ] }),
          fileError && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsx("span", { children: fileError })
          ] }),
          fileName && !fileError && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between bg-ink-50 rounded-xl p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsx(FileCheck, { className: "w-4 h-4 text-brand-500 flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-ink-700 truncate", children: fileName }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-400 flex-shrink-0", children: [
                text.trim().split(/\s+/).filter(Boolean).length,
                " words"
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: clearFile, className: "p-1 rounded hover:bg-ink-200 text-ink-500", title: "Remove", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-display font-semibold text-ink-900 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-sky-500" }),
              "Extracted Content"
            ] }),
            text && /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-500", children: [
              text.trim().split(/\s+/).filter(Boolean).length,
              " words"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-ink-50 rounded-xl p-4 max-h-64 overflow-y-auto scrollbar-thin", children: text ? /* @__PURE__ */ jsxs("pre", { className: "text-xs text-ink-600 whitespace-pre-wrap font-sans leading-relaxed", children: [
            text.slice(0, 3e3),
            text.length > 3e3 ? "\u2026" : ""
          ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-400 text-center py-8", children: "Upload a file to see extracted content here." }) }),
          /* @__PURE__ */ jsx(Button, { onClick: analyze, disabled: analyzing || parsing || !text.trim(), className: "mt-4 w-full", children: analyzing ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
            " Analyzing\u2026"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
            " Analyze Resume"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { children: !result ? /* @__PURE__ */ jsxs(Card, { className: "h-full flex flex-col items-center justify-center text-center py-16", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(FileCheck, { className: "w-8 h-8 text-ink-400" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-lg text-ink-900", children: "No Analysis Yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-ink-500 text-sm mt-1 max-w-xs", children: 'Upload your resume (PDF or TXT), then click "Analyze Resume" to get instant AI feedback.' })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx(ScoreRing, { score: result.overall_score || 0, size: 130 }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-ink-700", children: "Overall Resume Score" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3 w-full mt-6", children: [
            { label: "ATS", score: result.ats_score || 0 },
            { label: "Grammar", score: result.grammar_score || 0 },
            { label: "Keywords", score: result.keyword_score || 0 }
          ].map((m) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-xl text-ink-900", children: m.score }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-500", children: m.label }),
            /* @__PURE__ */ jsx(ProgressBar, { value: m.score, color: m.score >= 70 ? "brand" : "accent", className: "mt-1.5" })
          ] }, m.label)) })
        ] }),
        result.strengths && result.strengths.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-display font-semibold text-ink-900 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ThumbsUp, { className: "w-5 h-5 text-brand-500" }),
            " Strengths"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: result.strengths.map((s, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-ink-700", children: [
            /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" }),
            s
          ] }, i)) })
        ] }),
        result.weaknesses && result.weaknesses.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-display font-semibold text-ink-900 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-accent-500" }),
            " Areas to Improve"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: result.weaknesses.map((w, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-ink-700", children: [
            /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" }),
            w
          ] }, i)) })
        ] }),
        result.suggestions && result.suggestions.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-display font-semibold text-ink-900 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Lightbulb, { className: "w-5 h-5 text-sky-500" }),
            " Suggestions"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: result.suggestions.map((s, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-ink-700", children: [
            /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-semibold flex-shrink-0", children: i + 1 }),
            s
          ] }, i)) })
        ] }),
        result.keywords_found && result.keywords_found.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-display font-semibold text-ink-900 mb-3", children: [
            "Keywords Found (",
            result.keywords_found.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: result.keywords_found.map((k) => /* @__PURE__ */ jsx(Badge, { color: "brand", children: k }, k)) }),
          result.keywords_missing && result.keywords_missing.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-ink-700 mt-4 mb-2", children: "Missing Keywords" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: result.keywords_missing.map((k) => /* @__PURE__ */ jsx(Badge, { color: "gray", children: k }, k)) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  ResumeAnalyzerPage as default
};
