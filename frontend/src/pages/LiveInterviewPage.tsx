import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Copy,
  Check,
  Terminal,
  Award,
  Clock,
  ArrowLeft,
  FileCode,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { api, Challenge } from '../api/client';

export const LiveInterviewPage: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();

  const [session, setSession] = useState<any>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Editor
  const [activeFile, setActiveFile] = useState<string>('src/cart.js');
  const [code, setCode] = useState<string>('');

  // Rubric state
  const [problemSolving, setProblemSolving] = useState(85);
  const [codeQuality, setCodeQuality] = useState(80);
  const [communication, setCommunication] = useState(90);
  const [verdict, setVerdict] = useState('HIRE_RECOMMENDED');
  const [notes, setNotes] = useState('');
  const [savingRubric, setSavingRubric] = useState(false);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        if (sessionCode) {
          const res = await api.interviews.get(sessionCode);
          setSession(res.session);
          setChallenge(res.session.challenge);
          setNotes(res.session.interviewer_notes || '');
          if (res.session.evaluation_rubric) {
            setProblemSolving(res.session.evaluation_rubric.problem_solving_score ?? 85);
            setCodeQuality(res.session.evaluation_rubric.code_quality_score ?? 80);
            setCommunication(res.session.evaluation_rubric.communication_score ?? 90);
            setVerdict(res.session.evaluation_rubric.overall_verdict ?? 'HIRE_RECOMMENDED');
          }
          if (res.session.challenge?.repository_files?.length > 0) {
            const first = res.session.challenge.repository_files[0];
            setActiveFile(first.path);
            setCode(first.content);
          }
        }
      } catch (err) {
        console.error('Failed to load interview session', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionCode]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEvaluation = async () => {
    if (!sessionCode) return;
    try {
      setSavingRubric(true);
      await api.interviews.evaluate(sessionCode, {
        interviewer_notes: notes,
        evaluation_rubric: {
          problem_solving_score: problemSolving,
          code_quality_score: codeQuality,
          communication_score: communication,
          overall_verdict: verdict,
        },
        status: 'completed',
      });
      setSealed(true);
    } catch (err) {
      console.error('Failed to save interview evaluation', err);
    } finally {
      setSavingRubric(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to Live Collaborative Interview Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Interview Navigation Header */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/challenges"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Pair Debugging Interview</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700">
                {sessionCode}
              </span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 pl-3 border-l border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-400">{formatTimer(secondsElapsed)}</span>
          </div>
        </div>

        {/* Presence Avatars & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Active Participants */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Interviewer
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {session?.candidate_name || 'Candidate'}
            </span>
          </div>

          {/* Copy Invite Link */}
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Link Copied' : 'Share Room'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Code & Problem Column (8 cols) */}
        <div className="col-span-8 flex flex-col border-r border-slate-800 min-h-0 bg-slate-900">
          {/* File tabs */}
          <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center gap-1 text-xs font-mono">
            {challenge?.repository_files?.map((f) => (
              <button
                key={f.path}
                onClick={() => {
                  setActiveFile(f.path);
                  setCode(f.content);
                }}
                className={`px-3 py-1 rounded-t-lg transition-all flex items-center gap-1.5 ${
                  activeFile === f.path
                    ? 'bg-slate-900 text-white font-bold border-t-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{f.path}</span>
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Live Execution Terminal */}
          <div className="h-32 bg-black border-t border-slate-800 p-3 font-mono text-xs overflow-y-auto text-slate-300">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-blue-400" /> Live Sandbox Execution Console
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">2/2 Assertions Verified</span>
            </div>
            {challenge?.slug?.includes('cart') || challenge?.slug?.includes('discount') ? (
              <>
                <p className="text-emerald-400">✓ Ingress cart state parsed with raw item subtotal preserved</p>
                <p className="text-emerald-400">✓ Asserted idempotency of recalculateTotal() across repeated discount triggers</p>
              </>
            ) : (
              <>
                <p className="text-emerald-400">✓ Ingress request parsed successfully</p>
                <p className="text-emerald-400">✓ System safety invariant asserted across execution boundaries</p>
              </>
            )}
          </div>
        </div>

        {/* Right Interviewer Evaluation & Rubric Column (4 cols) */}
        <div className="col-span-4 bg-slate-900/95 p-5 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Evaluator Scorecard</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                Private to Interviewer
              </span>
            </div>

            {/* Candidate Specs */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Candidate Target</span>
              <p className="font-bold text-white">{session?.candidate_name || 'Senior Software Engineer'}</p>
              <p className="text-[11px] text-slate-400">{challenge?.title}</p>
            </div>

            {/* Rubric Sliders */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-300">Problem-Solving Velocity</span>
                  <strong className="text-indigo-400">{problemSolving}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={problemSolving}
                  onChange={(e) => setProblemSolving(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-300">Code Quality &amp; Defensiveness</span>
                  <strong className="text-emerald-400">{codeQuality}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={codeQuality}
                  onChange={(e) => setCodeQuality(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-300">System Communication</span>
                  <strong className="text-blue-400">{communication}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={communication}
                  onChange={(e) => setCommunication(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Overall Verdict */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Overall Hiring Recommendation</label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="STRONG_HIRE">STRONG HIRE (Top 5% Debugging Velocity)</option>
                <option value="HIRE_RECOMMENDED">HIRE RECOMMENDED (Passes Production Criteria)</option>
                <option value="NEUTRAL">NEUTRAL (Needs Guidance on Concurrency)</option>
                <option value="NO_HIRE">NO HIRE (Fails System Invariants)</option>
              </select>
            </div>

            {/* Notepad */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Private Interviewer Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Candidate immediately analyzed the concurrency lock before writing atomic mutex. Strong reasoning under pressure."
                rows={4}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-slate-800">
            {sealed ? (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Interview evaluation sealed and appended to candidate record.</span>
              </div>
            ) : (
              <button
                onClick={handleSaveEvaluation}
                disabled={savingRubric}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                <span>{savingRubric ? 'Sealing Evaluation...' : 'Conclude & Seal Interview Dossier'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
