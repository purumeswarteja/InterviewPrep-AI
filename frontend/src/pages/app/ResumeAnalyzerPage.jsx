import React, { useState, useCallback } from 'react';
import {
  FileText, Upload, Check, AlertCircle, Sparkles, Loader2,
  FileCheck, Lightbulb, XCircle, ThumbsUp, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, Button, ScoreRing, Badge, ProgressBar } from '../../components/ui';
import { skillKeywords } from '../../data/questions';

async function extractPdfText(file) {
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(' ') + '\n';
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

  const keywordScore = Math.min(100, Math.round((found.length / skillKeywords.length) * 100 * 2.5));

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

  if (found.length > 10) strengths.push(`Strong keyword presence — ${found.length} relevant skills detected.`);
  else if (found.length > 5) strengths.push(`Decent keyword coverage — ${found.length} relevant skills found.`);
  else weaknesses.push(`Only ${found.length} relevant keywords found. Add more industry-specific terms.`);

  if (hasExperience) strengths.push('Includes an Experience section — essential for ATS parsing.');
  else weaknesses.push('Missing a clearly labeled Experience/Employment section.');

  if (hasEducation) strengths.push('Education section detected.');
  else weaknesses.push('No Education section found — add your academic background.');

  if (hasSkills) strengths.push('Dedicated Skills section present.');
  else weaknesses.push('Missing a Skills section — list your technical and soft skills.');

  if (words > 300) strengths.push('Good length — detailed enough for ATS parsing.');
  else weaknesses.push(`Resume is only ${words} words. Aim for 300+ words for better ATS visibility.`);

  if (found.length < 15) suggestions.push('Add more relevant technical keywords throughout your experience descriptions.');
  if (!/\b(led|managed|built|created|improved|achieved|increased|reduced|developed|designed)\b/i.test(text))
    suggestions.push('Use action verbs (led, built, improved, achieved, developed) to describe your accomplishments.');
  if (!/\b(\d+%|\$\d+|\d+x|\d+ (users|customers|hours|days))\b/i.test(text))
    suggestions.push('Quantify your achievements with numbers (e.g., "increased sales by 25%", "served 10k users").');
  if (!hasProjects) suggestions.push('Add a Projects or Portfolio section to showcase practical work.');
  suggestions.push('Tailor your resume keywords to match each job description you apply for.');
  suggestions.push('Keep formatting simple — ATS systems prefer standard fonts and avoid tables/columns.');
  suggestions.push('Use a clear section hierarchy with standard headings (Experience, Education, Skills).');
  suggestions.push('Include links to your GitHub, LinkedIn, and portfolio if available.');

  return { atsScore, grammarScore, keywordScore, overall, found, missing: missing.slice(0, 10), strengths, weaknesses, suggestions };
}

export default function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError('');
    setResult(null);

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File too large. Maximum size is 10 MB.');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');

    if (isDoc) {
      setFileError('Word documents are not supported yet. Please export to PDF or TXT and re-upload.');
      return;
    }

    if (!isPdf && !isTxt) {
      setFileError('Unsupported file type. Please upload a PDF or TXT file.');
      return;
    }

    setFileName(file.name);
    setParsing(true);

    try {
      if (isPdf) {
        const extracted = await extractPdfText(file);
        if (!extracted || extracted.trim().length < 20) {
          setFileError('Could not extract text from this PDF. It may be a scanned image. Try a text-based PDF or TXT file.');
          setText('');
        } else {
          setText(extracted);
          toast.success(`Loaded ${file.name} (${extracted.split(/\s+/).length} words).`);
        }
      } else {
        const reader = new FileReader();
        const content = await new Promise((resolve, reject) => {
          reader.onload = (ev) => resolve(String(ev.target?.result || ''));
          reader.onerror = reject;
          reader.readAsText(file);
        });
        setText(content);
        toast.success(`Loaded ${file.name}.`);
      }
    } catch (err) {
      setFileError(`Failed to read file: ${err.message || 'Unknown error'}.`);
      setText('');
    }
    setParsing(false);
  };

  const analyze = useCallback(async () => {
    if (!text.trim() || text.trim().length < 50) {
      toast.error('Please upload a valid resume file before analyzing.');
      return;
    }

    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const analysis = analyzeResume(text);

    const payload = {
      user_id: user?.id,
      file_name: fileName || 'uploaded-resume',
      resume_text: text.slice(0, 5000),
      ats_score: analysis.atsScore,
      grammar_score: analysis.grammarScore,
      keyword_score: analysis.keywordScore,
      overall_score: analysis.overall,
      keywords_found: analysis.found,
      keywords_missing: analysis.missing,
      suggestions: analysis.suggestions,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
    };

    const localResult = { ...payload, id: 'local', user_id: user?.id || '', created_at: new Date().toISOString() };

    if (user) {
      const data = await api.createResumeAnalysis(payload);
      if (data.error) {
        toast.error('Failed to save analysis: ' + data.error);
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
    toast.success('Resume analysis complete!');
  }, [text, fileName, user]);

  const clearFile = () => {
    setFileName('');
    setText('');
    setFileError('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
          AI Resume Analyzer
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Upload your resume for instant ATS scoring, keyword matching, strengths, and actionable feedback.
        </p>
      </div>

      {/* 1. Upload Resume Section (Top Card) */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          Upload Resume
        </h2>

        <label className="block cursor-pointer">
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              fileError
                ? 'border-red-300 bg-red-50/50'
                : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30'
            }`}
          >
            {parsing ? (
              <div className="py-4">
                <Loader2 className="w-10 h-10 text-emerald-600 mx-auto mb-3 animate-spin" />
                <p className="text-sm font-medium text-gray-700">Reading resume file...</p>
              </div>
            ) : (
              <div>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-gray-800">
                  {fileName || 'Click to select or drag resume file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports PDF and TXT files (up to 10 MB)
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={handleFile}
            className="hidden"
            disabled={parsing || analyzing}
          />
        </label>

        {fileError && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3.5 border border-red-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}

        {fileName && !fileError && (
          <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800 truncate">{fileName}</span>
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                {text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <button
              onClick={clearFile}
              className="p-1 rounded-lg hover:bg-emerald-100 text-gray-500 hover:text-gray-700 transition"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <Button
          onClick={analyze}
          disabled={analyzing || parsing || !text.trim()}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analyze Resume</span>
            </>
          )}
        </Button>
      </Card>

      {/* 2. Analysed Feedback Section (Below Upload Section) */}
      <div>
        {!result ? (
          <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">No Feedback Available Yet</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-md">
              Upload your resume above and click "Analyze Resume" to view your ATS score breakdown, strengths, areas to improve, and actionable feedback here.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            
            {/* Overall Score Box */}
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center text-center">
              <ScoreRing score={result.overall_score || 0} size={130} />
              <p className="mt-3 text-sm font-semibold text-gray-700">Overall ATS Match Score</p>

              <div className="grid grid-cols-3 gap-6 w-full max-w-lg mt-6 pt-4 border-t border-gray-100">
                {[
                  { label: 'ATS Score', score: result.ats_score || 0 },
                  { label: 'Grammar', score: result.grammar_score || 0 },
                  { label: 'Keywords', score: result.keyword_score || 0 },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="font-bold text-2xl text-gray-900">{m.score}%</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{m.label}</p>
                    <ProgressBar value={m.score} color={m.score >= 70 ? 'brand' : 'accent'} className="mt-2" />
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <Card className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-emerald-600" />
                    Strengths & Matches
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Areas to Improve */}
              {result.weaknesses && result.weaknesses.length > 0 && (
                <Card className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <XCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Suggestions & Actionable Feedback */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-sky-500" />
                  Actionable Improvements & Feedback
                </h3>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Keywords Detected & Missing */}
            {result.keywords_found && result.keywords_found.length > 0 && (
              <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <h3 className="font-bold text-base text-gray-900 mb-3">
                  Detected Industry Keywords ({result.keywords_found.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_found.map((k) => (
                    <Badge key={k} color="brand">
                      {k}
                    </Badge>
                  ))}
                </div>

                {result.keywords_missing && result.keywords_missing.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Recommended Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords_missing.map((k) => (
                        <Badge key={k} color="gray">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
