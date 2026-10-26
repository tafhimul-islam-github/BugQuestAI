import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { api, Challenge, Submission, AiHint } from '../api/client';
import { 
  Terminal,
  Send, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  HelpCircle,
  Shield,
  ArrowLeft
} from 'lucide-react';

export const CodingWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [leftTab, setLeftTab] = useState<'description' | 'examples' | 'editorial'>('description');
  const [bottomTab, setBottomTab] = useState<'results' | 'coach'>('results');

  // Execution state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);

  // AI Coach state
  const [hintLevel, setHintLevel] = useState<'nudge' | 'direction' | 'debugging_guidance' | 'detailed_explanation'>('nudge');
  const [requestingHint, setRequestingHint] = useState(false);
  const [currentHint, setCurrentHint] = useState<AiHint | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.challenges.get(slug);
        const c = res.challenge;
        setChallenge(c);

        // Set default starter code
        const initialLang = (c.supported_languages?.[0] as 'javascript' | 'python') || 'javascript';
        setLanguage(initialLang);
        setCode(c.starter_code?.[initialLang] || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [slug]);

  const handleLanguageChange = (newLang: 'javascript' | 'python') => {
    setLanguage(newLang);
    if (challenge?.starter_code?.[newLang]) {
      setCode(challenge.starter_code[newLang]);
    }
  };

  const handleResetCode = () => {
    if (challenge?.starter_code?.[language]) {
      setCode(challenge.starter_code[language]);
    }
  };

  const handleSubmitSolution = async () => {
    if (!challenge) return;
    setSubmitting(true);
    setSubmissionResult(null);
    setBottomTab('results');

    try {
      const res = await api.submissions.create({
        challenge_id: challenge.id,
        language,
        code,
      });

      setSubmissionResult(res.submission);

      if (res.submission.status === 'accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#38bdf8', '#fbbf24']
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    if (!challenge) return;
    setRequestingHint(true);
    setHintError(null);
    setBottomTab('coach');

    try {
      const res = await api.ai.requestHint({
        challenge_id: challenge.id,
        hint_level: hintLevel,
        language,
        code,
        error_context: submissionResult?.error_output || undefined,
        submission_id: submissionResult?.id || undefined,
      });

      setCurrentHint(res.hint);
    } catch (err: any) {
      setHintError(err.message || 'Failed to request progressive hint');
    } finally {
      setRequestingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-obsidian-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Initializing isolated sandbox environment...</span>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Challenge Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This challenge does not exist or has been archived.'}</p>
        <Link to="/challenges" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Return to Challenge Library
        </Link>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-obsidian-950 overflow-hidden font-sans">
      
      {/* Top Workspace Bar */}
      <div className="h-12 border-b border-white/[0.07] bg-obsidian-900 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/challenges" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </Link>
          <span className="text-white/[0.15]">/</span>
          <span className="font-bold text-white text-xs flex items-center gap-2">
            {challenge.title}
          </span>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-obsidian-950 p-0.5 rounded-lg border border-white/[0.08] text-xs">
            {challenge.supported_languages?.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang as any)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] capitalize transition-all ${
                  language === lang
                    ? 'bg-indigo-600 text-white font-semibold shadow-glow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetCode}
            title="Reset starter code"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.1] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRequestHint}
            disabled={requestingHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/35 text-xs font-semibold shadow-glow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Coach Hint</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-md transition-all hover:scale-[1.02]"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Left Details & Right Code/Execution */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Challenge Details (5 cols) */}
        <div className="lg:col-span-5 border-r border-white/[0.07] flex flex-col bg-obsidian-900/60 overflow-hidden">
          
          {/* Left Tabs */}
          <div className="flex items-center gap-1 px-3 pt-1.5 border-b border-white/[0.07] bg-obsidian-950 shrink-0 text-xs font-medium">
            <button
              onClick={() => setLeftTab('description')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 ${
                leftTab === 'description'
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setLeftTab('examples')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 ${
                leftTab === 'examples'
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Examples</span>
            </button>
            <button
              onClick={() => setLeftTab('editorial')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 ${
                leftTab === 'editorial'
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Editorial</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300 leading-relaxed">
            
            {leftTab === 'description' && (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white tracking-tight">Problem Statement</h3>
                  <div className="whitespace-pre-line text-slate-300 font-normal leading-relaxed text-xs">
                    {challenge.description}
                  </div>
                </div>

                {challenge.input_spec && (
                  <div className="space-y-1.5 pt-4 border-t border-white/[0.06]">
                    <h4 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Input Specification</h4>
                    <p className="text-xs text-slate-300 font-mono bg-obsidian-950 p-2.5 rounded-lg border border-white/[0.06]">
                      {challenge.input_spec}
                    </p>
                  </div>
                )}

                {challenge.output_spec && (
                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Output Specification</h4>
                    <p className="text-xs text-slate-300 font-mono bg-obsidian-950 p-2.5 rounded-lg border border-white/[0.06]">
                      {challenge.output_spec}
                    </p>
                  </div>
                )}

                {challenge.constraints && challenge.constraints.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                    <h4 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Constraints</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                      {challenge.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Execution limit: {challenge.time_limit_ms}ms</span>
                  <span>Memory limit: {challenge.memory_limit_mb}MB</span>
                </div>
              </>
            )}

            {leftTab === 'examples' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Public Test Examples</h3>
                {challenge.public_examples?.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/[0.06] bg-obsidian-950 space-y-2 font-mono text-xs">
                    <div className="font-sans font-bold text-indigo-400 text-xs">Example {idx + 1}</div>
                    <div>
                      <span className="text-slate-500">Input: </span>
                      <span className="text-slate-200">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Output: </span>
                      <span className="text-emerald-400 font-semibold">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="font-sans text-slate-400 text-[11px] pt-1.5 border-t border-white/[0.06]">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Editorial & Algorithmic Design</h3>
                <div className="text-slate-300">
                  <div className="whitespace-pre-line bg-obsidian-950 p-4 rounded-xl border border-white/[0.06] font-normal leading-relaxed text-xs">
                    {challenge.editorial || 'No editorial has been published for this challenge yet.'}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Monaco Editor (Top) & Bottom Drawer (Results / AI Coach) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-obsidian-950">
          
          {/* Monaco Editor Container (60% height) */}
          <div className="h-[60%] border-b border-white/[0.07] relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Bottom Pane (40% height): Test Results & AI Debugging Coach */}
          <div className="h-[40%] flex flex-col bg-obsidian-900/80 overflow-hidden">
            
            {/* Bottom Tabs & Hint Level Selector */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.07] bg-obsidian-950 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBottomTab('results')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    bottomTab === 'results'
                      ? 'bg-obsidian-800 text-white font-semibold border border-white/[0.1]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Output</span>
                  {submissionResult && (
                    <span className={`w-2 h-2 rounded-full ${submissionResult.status === 'accepted' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  )}
                </button>

                <button
                  onClick={() => setBottomTab('coach')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    bottomTab === 'coach'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Debugging Coach</span>
                </button>
              </div>

              {/* When Coach Tab is open, show hint level selector */}
              {bottomTab === 'coach' && (
                <div className="flex items-center gap-1 bg-obsidian-900 p-0.5 rounded-lg border border-white/[0.08]">
                  <span className="text-[10px] font-mono text-slate-500 px-1 font-semibold uppercase tracking-wider">Tier:</span>
                  {(['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setHintLevel(lvl)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        hintLevel === lvl
                          ? 'bg-indigo-600 text-white font-semibold shadow-glow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl === 'debugging_guidance' ? 'Diagnostic' : lvl === 'detailed_explanation' ? 'Walkthrough' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Content Body */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              
              {/* RESULTS TAB */}
              {bottomTab === 'results' && (
                <div className="space-y-4">
                  {!submissionResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                      <Terminal className="w-8 h-8 opacity-40 text-indigo-400" />
                      <p className="text-xs">Click "Submit Solution" to trigger isolated assessment across public & hidden test cases.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Overall Status Banner */}
                      <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        submissionResult.status === 'accepted'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          {submissionResult.status === 'accepted' ? (
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-xs uppercase tracking-wide">
                              {submissionResult.status.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400 ml-2 font-mono text-xs">
                              ({submissionResult.pass_count} / {submissionResult.total_count} Passed)
                            </span>
                          </div>
                        </div>

                        {submissionResult.execution_time_ms && (
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {submissionResult.execution_time_ms}ms
                          </span>
                        )}
                      </div>

                      {/* Error Diagnostic Callout */}
                      {submissionResult.error_output && (
                        <div className="p-3 rounded-lg border border-white/[0.08] bg-obsidian-950 font-mono text-rose-400 text-xs">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Diagnostic Output:</span>
                          {submissionResult.error_output}
                        </div>
                      )}

                      {/* Public Test Results Cards */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Public Test Assertions:
                        </div>

                        {submissionResult.public_test_results?.map((res, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border font-mono text-xs space-y-1 ${
                              res.status === 'passed'
                                ? 'border-white/[0.06] bg-obsidian-950'
                                : 'border-rose-500/30 bg-rose-950/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-sans font-semibold text-slate-300">Test Case #{i + 1}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                res.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {res.status}
                              </span>
                            </div>

                            {res.input && <div><span className="text-slate-500">Input: </span>{res.input}</div>}
                            {res.expected_output && <div><span className="text-slate-500">Expected: </span>{res.expected_output}</div>}
                            {res.actual_output && <div><span className="text-slate-500">Actual: </span>{res.actual_output}</div>}
                          </div>
                        ))}

                        <div className="p-3 rounded-lg border border-white/[0.06] bg-obsidian-950/60 text-[11px] text-slate-400 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>Private hidden boundary assertions evaluated securely to prevent test leakage.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI COACH TAB */}
              {bottomTab === 'coach' && (
                <div className="space-y-4">
                  {requestingHint ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-400">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="font-mono text-xs">AI Coach analyzing your code and error patterns...</p>
                    </div>
                  ) : hintError ? (
                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                      {hintError}
                    </div>
                  ) : currentHint ? (
                    <div className="quest-card p-5 border-indigo-500/30 bg-obsidian-950 space-y-4 shadow-glow-sm">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <h4 className="font-bold text-white text-xs">{currentHint.summary}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase font-semibold">
                          Tier: {currentHint.hint_level.replace('_', ' ')}
                        </span>
                      </div>

                      {currentHint.likely_issue && (
                        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
                          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5 text-amber-400">Potential Bottleneck:</span>
                          {currentHint.likely_issue}
                        </div>
                      )}

                      <div className="text-slate-200 text-xs leading-relaxed font-sans bg-obsidian-900 p-3.5 rounded-lg border border-white/[0.06]">
                        {currentHint.explanation}
                      </div>

                      {currentHint.next_steps && currentHint.next_steps.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Suggested Debugging Steps:</span>
                          <ul className="space-y-1">
                            {currentHint.next_steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Confidence: {Math.round(currentHint.confidence * 100)}%</span>
                        <span>Unlock next tier if still stuck.</span>
                      </div>

                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <Sparkles className="w-8 h-8 text-indigo-400/60" />
                      <p className="text-xs text-center max-w-sm">
                        Select a tier above and click "AI Coach Hint" to receive contextual pedagogical guidance for your solution.
                      </p>
                      <button
                        onClick={handleRequestHint}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-glow-sm"
                      >
                        Request {hintLevel.replace('_', ' ')} Hint
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
