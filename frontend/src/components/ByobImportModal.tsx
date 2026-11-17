import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { api, Challenge } from '../api/client';

interface ByobImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: (challenge: Challenge) => void;
}

export const ByobImportModal: React.FC<ByobImportModalProps> = ({
  isOpen,
  onClose,
  onImported,
}) => {
  const navigate = useNavigate();

  const [repoUrl, setRepoUrl] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [framework, setFramework] = useState('Node.js');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'idle' | 'sanitizing' | 'synthesizing' | 'validating'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [createdChallenge, setCreatedChallenge] = useState<Challenge | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || issueDescription.trim().length < 20) {
      setError('Please provide a valid GitHub repository URL and at least 20 characters of defect context.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStage('sanitizing');

      setTimeout(() => setStage('synthesizing'), 800);
      setTimeout(() => setStage('validating'), 1600);

      const res = await api.challenges.importGithub({
        repo_url: repoUrl,
        issue_description: issueDescription,
        framework,
        difficulty,
      });

      setCreatedChallenge(res.challenge);
      if (onImported) onImported(res.challenge);
    } catch (err: any) {
      setError(err?.message || 'Failed to import and synthesize GitHub bug');
    } finally {
      setLoading(false);
      setStage('idle');
    }
  };

  const handleOpenWorkspace = () => {
    if (createdChallenge) {
      onClose();
      navigate(`/challenges/${createdChallenge.slug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-white border border-white/20">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block font-bold">
                  BYOB Studio
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-900 text-indigo-200 border border-indigo-700 font-bold">
                  AI Secret Sanitizer
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                Bring Your Own Bug (GitHub Importer)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Paste any GitHub Issue, PR diff, or stack trace. Our autonomous <strong>AI Sanitizer Agent</strong> redacts company secrets, internal IPs, and API keys, automatically synthesizing a production-ready multi-file debugging quest.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!createdChallenge ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. GitHub Repository or PR URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/organization/microservice-api/issues/402"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Framework</label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  >
                    <option value="Node.js">Node.js</option>
                    <option value="Python 3">Python 3</option>
                    <option value="React">React</option>
                    <option value="Express">Express</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  >
                    <option value="beginner">Beginner (~15m)</option>
                    <option value="intermediate">Intermediate (~25m)</option>
                    <option value="advanced">Advanced (~40m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>2. Issue Symptoms, Reproduction Trace or Code Snip</span>
                  <span className="text-[10px] text-slate-400 font-normal">Min 20 chars</span>
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Paste error logs, exception stack traces, or customer symptoms here. The AI will cleanse all internal keys and build realistic test assertions."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              {loading && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono text-[11px] space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Pipeline Active:</span>
                  </div>
                  <ul className="pl-5 list-disc space-y-0.5 text-indigo-800">
                    <li className={stage === 'sanitizing' ? 'font-bold text-indigo-600' : ''}>Redacting private tokens &amp; internal hostnames</li>
                    <li className={stage === 'synthesizing' ? 'font-bold text-indigo-600' : ''}>Generating multi-file repository harness</li>
                    <li className={stage === 'validating' ? 'font-bold text-indigo-600' : ''}>Executing isolated unit assertions in sandbox</li>
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Quest...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sanitize &amp; Import Bug</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">
                    Quest Created &amp; Validated
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{createdChallenge.title}</h3>
                  <p className="text-xs text-slate-600">
                    Proprietary secrets redacted and verified against automated unit test runner.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Slug Identifier:</span>
                  <strong>{createdChallenge.slug}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Framework:</span>
                  <strong>{createdChallenge.framework}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Difficulty:</span>
                  <strong className="capitalize">{createdChallenge.difficulty}</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleOpenWorkspace}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <span>Open Quest in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
