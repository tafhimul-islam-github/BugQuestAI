import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { api, Challenge, Submission, AiHint, RepositoryFile, Hypothesis } from '../api/client';
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
  ArrowLeft,
  FileCode,
  FolderOpen,
  Lock,
  Edit3,
  GitCompare,
  Lightbulb,
  FileText
} from 'lucide-react';

export const CodingWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-file repository state
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [originalFilesMap, setOriginalFilesMap] = useState<Record<string, string>>({});

  // View Mode: 'editor' or 'diff'
  const [viewMode, setViewMode] = useState<'editor' | 'diff'>('editor');

  // Left Pane Tabs: 'report' | 'evidence' | 'editorial'
  const [leftTab, setLeftTab] = useState<'report' | 'evidence' | 'editorial'>('report');
  
  // Bottom Pane Tabs: 'results' | 'coach'
  const [bottomTab, setBottomTab] = useState<'results' | 'coach'>('results');

  // Hypothesis & Evidence State
  const [hypothesis, setHypothesis] = useState<Hypothesis>({
    suspected_file: '',
    root_cause: '',
    proposed_fix: '',
    status: 'investigating',
    confidence: 80,
  });

  // Execution State
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);

  // AI Coach State
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

        // Populate repository files
        let repoFiles: RepositoryFile[] = [];
        if (c.repository_files && c.repository_files.length > 0) {
          repoFiles = c.repository_files.map(f => ({ ...f }));
        } else {
          // Fallback single-file adapter
          const initialLang = (c.supported_languages?.[0] as string) || 'javascript';
          const defaultCode = c.starter_code?.[initialLang] || '';
          repoFiles = [
            {
              path: initialLang === 'python' ? 'solution.py' : 'solution.js',
              content: defaultCode,
              is_editable: true,
              language: initialLang,
            }
          ];
        }

        setFiles(repoFiles);

        // Store original snapshot for diff calculation
        const origMap: Record<string, string> = {};
        repoFiles.forEach(f => {
          origMap[f.path] = f.content;
        });
        setOriginalFilesMap(origMap);

        // Set default active file (first editable file)
        const firstEditable = repoFiles.find(f => f.is_editable) || repoFiles[0];
        if (firstEditable) {
          setActiveFilePath(firstEditable.path);
          setOpenTabs([firstEditable.path]);
          setHypothesis(prev => ({ ...prev, suspected_file: firstEditable.path }));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [slug]);

  // Current active file object
  const activeFile = useMemo(() => {
    return files.find(f => f.path === activeFilePath) || files[0];
  }, [files, activeFilePath]);

  // Check if workspace has unsaved modifications compared to original
  const modifiedCount = useMemo(() => {
    return files.filter(f => f.content !== originalFilesMap[f.path]).length;
  }, [files, originalFilesMap]);

  const handleFileSelect = (filePath: string) => {
    setActiveFilePath(filePath);
    if (!openTabs.includes(filePath)) {
      setOpenTabs([...openTabs, filePath]);
    }
  };

  const handleCloseTab = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(p => p !== filePath);
    setOpenTabs(newTabs);
    if (activeFilePath === filePath && newTabs.length > 0) {
      setActiveFilePath(newTabs[newTabs.length - 1]);
    }
  };

  const handleCodeChange = (newVal: string | undefined) => {
    if (!activeFile || !activeFile.is_editable) return;
    const updatedContent = newVal || '';
    setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: updatedContent } : f));
  };

  const handleResetActiveFile = () => {
    if (!activeFile) return;
    const orig = originalFilesMap[activeFile.path];
    if (orig !== undefined) {
      setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: orig } : f));
    }
  };

  const handleResetWorkspace = () => {
    if (!confirm('Are you sure you want to reset all files back to their original starter code?')) return;
    setFiles(prev => prev.map(f => ({ ...f, content: originalFilesMap[f.path] || f.content })));
  };

  const generatePatchDiff = (): string => {
    let diffText = '';
    files.forEach(f => {
      const orig = originalFilesMap[f.path];
      if (orig !== undefined && orig !== f.content) {
        diffText += `--- a/${f.path}\n+++ b/${f.path}\n[Modified File Content]\n`;
      }
    });
    return diffText;
  };

  const handleSubmitSolution = async () => {
    if (!challenge) return;
    setSubmitting(true);
    setSubmissionResult(null);
    setBottomTab('results');

    try {
      const lang = challenge.supported_languages?.[0] || 'javascript';
      const modifiedFilesPayload = files.filter(f => f.is_editable);

      const res = await api.submissions.create({
        challenge_id: challenge.id,
        language: lang,
        code: activeFile?.content || '',
        modified_files: modifiedFilesPayload,
        hypothesis: hypothesis,
        patch_diff: generatePatchDiff(),
      });

      setSubmissionResult(res.submission);

      if (res.submission.status === 'accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#06b6d4', '#f59e0b']
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit patch');
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
      const lang = challenge.supported_languages?.[0] || 'javascript';
      const res = await api.ai.requestHint({
        challenge_id: challenge.id,
        hint_level: hintLevel,
        language: lang,
        code: activeFile?.content,
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-medium text-slate-500">Loading codebase and provisioning sandbox environment...</span>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Challenge Not Found</h2>
        <p className="text-xs text-slate-600">{error || 'This challenge does not exist or has been archived.'}</p>
        <Link to="/challenges" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Return to Challenge Library
        </Link>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    advanced: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  const getMonacoLang = (path: string) => {
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.md')) return 'markdown';
    return 'javascript';
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* Top Workbench Control Bar */}
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/challenges" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
            {challenge.title}
          </span>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
          {challenge.category && (
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase font-semibold">
              {challenge.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Source vs Diff */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'diff'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Diff ({modifiedCount})</span>
            </button>
          </div>

          <button
            onClick={handleResetActiveFile}
            title="Reset current file to starter code"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset File</span>
          </button>

          {modifiedCount > 0 && (
            <button
              onClick={handleResetWorkspace}
              title="Reset entire repository to starter code"
              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset All</span>
            </button>
          )}

          <button
            onClick={handleRequestHint}
            disabled={requestingHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Coach</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-blue-sm transition-all"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Verify Patch</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Details/Hypothesis & Right Code Workbench */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Issue Report, Evidence Board, Editorial (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-white overflow-hidden">
          
          {/* Left Tabs */}
          <div className="flex items-center gap-1 px-3 pt-1 border-b border-slate-200 bg-slate-50/80 shrink-0 text-xs font-medium">
            <button
              onClick={() => setLeftTab('report')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 ${
                leftTab === 'report'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Issue Report</span>
            </button>
            <button
              onClick={() => setLeftTab('evidence')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 ${
                leftTab === 'evidence'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Evidence Board</span>
            </button>
            <button
              onClick={() => setLeftTab('editorial')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 ${
                leftTab === 'editorial'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Editorial</span>
            </button>
          </div>

          {/* Left Pane Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700 leading-relaxed">
            
            {/* ISSUE REPORT TAB */}
            {leftTab === 'report' && (
              <div className="space-y-5">
                {challenge.bug_report ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          Active Bug Ticket
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">EST: {challenge.investigation_time_minutes || 25} mins</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {challenge.bug_report.issue_title || challenge.title}
                      </h3>
                    </div>

                    {challenge.bug_report.symptoms && (
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">Observable Symptoms</h4>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs">
                          {challenge.bug_report.symptoms}
                        </div>
                      </div>
                    )}

                    {challenge.bug_report.reproduction_steps && challenge.bug_report.reproduction_steps.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">Reproduction Steps</h4>
                        <ol className="list-decimal list-inside space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs">
                          {challenge.bug_report.reproduction_steps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Expected Behavior</h4>
                        <p className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-xs">
                          {challenge.bug_report.expected_behavior || 'Passing assertions'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Actual Defect</h4>
                        <p className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-900 text-xs">
                          {challenge.bug_report.actual_behavior || 'Failing assertions'}
                        </p>
                      </div>
                    </div>

                    {challenge.bug_report.scope_boundary && (
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">Scope Boundary:</span>
                          <span>{challenge.bug_report.scope_boundary}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Problem Statement</h3>
                    <div className="whitespace-pre-line text-slate-700 font-normal leading-relaxed text-xs">
                      {challenge.description}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EVIDENCE & HYPOTHESIS BOARD */}
            {leftTab === 'evidence' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Root Cause Evidence Board</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formulate your diagnostic hypothesis and link observed failure points before submitting your patch.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">
                      Suspected File / Subsystem
                    </label>
                    <select
                      value={hypothesis.suspected_file}
                      onChange={(e) => setHypothesis({ ...hypothesis, suspected_file: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    >
                      {files.map(f => (
                        <option key={f.path} value={f.path}>{f.path} {f.is_editable ? '(editable)' : '(read-only)'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">
                      Proposed Root Cause
                    </label>
                    <textarea
                      rows={3}
                      value={hypothesis.root_cause}
                      onChange={(e) => setHypothesis({ ...hypothesis, root_cause: e.target.value })}
                      placeholder="e.g. Subtotal is deducted before recalculation, causing double deduction on session reload..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">
                      Proposed Repair Strategy
                    </label>
                    <textarea
                      rows={2}
                      value={hypothesis.proposed_fix}
                      onChange={(e) => setHypothesis({ ...hypothesis, proposed_fix: e.target.value })}
                      placeholder="e.g. Keep raw subtotal intact and compute total = raw - discount..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">Hypothesis Status</label>
                      <select
                        value={hypothesis.status}
                        onChange={(e) => setHypothesis({ ...hypothesis, status: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      >
                        <option value="investigating">Investigating</option>
                        <option value="confirmed">Confirmed with Tests</option>
                        <option value="rejected">Rejected / Invalid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">Confidence ({hypothesis.confidence}%)</label>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={hypothesis.confidence}
                        onChange={(e) => setHypothesis({ ...hypothesis, confidence: Number(e.target.value) })}
                        className="w-full mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDITORIAL TAB */}
            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Editorial & Architecture Overview</span>
                </h3>
                <div className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 font-normal leading-relaxed text-xs text-slate-700">
                  {challenge.editorial || 'No editorial has been published for this challenge yet. Inspect the source code and reproduction tests.'}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: File Tree + Tabbed Monaco Editor + Execution Output (7 cols) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-white">
          
          {/* Main Workspace Area (62% height) */}
          <div className="h-[62%] flex border-b border-slate-200 overflow-hidden">
            
            {/* Left File Tree Sidebar (w-52) */}
            <div className="w-52 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Files ({files.length})</span>
                </span>
                {modifiedCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title={`${modifiedCount} modified file(s)`} />
                )}
              </div>

              <div className="p-1.5 space-y-0.5 text-xs font-mono">
                {files.map(f => {
                  const isActive = f.path === activeFilePath;
                  const isModified = f.content !== originalFilesMap[f.path];
                  return (
                    <button
                      key={f.path}
                      onClick={() => handleFileSelect(f.path)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-1 transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate text-xs">{f.path}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {isModified && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-300' : 'bg-amber-500'}`} />
                        )}
                        {!f.is_editable ? (
                          <span title="Read-only test file">
                            <Lock className={`w-3 h-3 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                          </span>
                        ) : (
                          <span title="Editable file">
                            <Edit3 className={`w-3 h-3 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Editor Area: Tabs + Monaco Editor or Diff */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              
              {/* File Tabs */}
              <div className="h-9 border-b border-slate-200 bg-slate-100 flex items-center px-1 gap-1 overflow-x-auto shrink-0">
                {openTabs.map(tabPath => {
                  const isActive = tabPath === activeFilePath;
                  const fileObj = files.find(f => f.path === tabPath);
                  const isModified = fileObj && fileObj.content !== originalFilesMap[tabPath];
                  return (
                    <div
                      key={tabPath}
                      onClick={() => setActiveFilePath(tabPath)}
                      className={`px-3 py-1 rounded-t-md text-xs font-mono font-medium flex items-center gap-2 cursor-pointer transition-all border-t border-x ${
                        isActive
                          ? 'bg-white border-slate-200 text-blue-700 font-bold shadow-xs'
                          : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="truncate max-w-[120px]">{tabPath.split('/').pop()}</span>
                      {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      <button
                        onClick={(e) => handleCloseTab(tabPath, e)}
                        className="text-slate-400 hover:text-slate-700 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Editor Surface */}
              <div className="flex-1 relative">
                {viewMode === 'editor' ? (
                  <Editor
                    height="100%"
                    language={getMonacoLang(activeFilePath)}
                    theme="vs"
                    value={activeFile?.content || ''}
                    onChange={handleCodeChange}
                    options={{
                      readOnly: !activeFile?.is_editable,
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                ) : (
                  <DiffEditor
                    height="100%"
                    language={getMonacoLang(activeFilePath)}
                    theme="vs"
                    original={originalFilesMap[activeFilePath] || ''}
                    modified={activeFile?.content || ''}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                )}
              </div>
            </div>

          </div>

          {/* Bottom Execution & AI Coach Drawer (38% height) */}
          <div className="h-[38%] flex flex-col bg-slate-50 overflow-hidden">
            
            {/* Bottom Tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBottomTab('results')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    bottomTab === 'results'
                      ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Output</span>
                  {submissionResult && (
                    <span className={`w-2 h-2 rounded-full ${submissionResult.status === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  )}
                </button>

                <button
                  onClick={() => setBottomTab('coach')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    bottomTab === 'coach'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Debugging Coach</span>
                </button>
              </div>

              {bottomTab === 'coach' && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 px-1 font-semibold uppercase tracking-wider">Tier:</span>
                  {(['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setHintLevel(lvl)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        hintLevel === lvl
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl === 'debugging_guidance' ? 'Diagnostic' : lvl === 'detailed_explanation' ? 'Walkthrough' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Content Area */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              
              {/* RESULTS TAB */}
              {bottomTab === 'results' && (
                <div className="space-y-4">
                  {!submissionResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                      <Terminal className="w-8 h-8 opacity-40 text-blue-600" />
                      <p className="text-xs font-medium">Click "Verify Patch" to run isolated reproduction and regression test assertions.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Overall Status Banner */}
                      <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        submissionResult.status === 'accepted'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {submissionResult.status === 'accepted' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-xs uppercase tracking-wide">
                              {submissionResult.status.replace('_', ' ')}
                            </span>
                            <span className="text-slate-600 ml-2 font-mono text-xs font-semibold">
                              ({submissionResult.pass_count} / {submissionResult.total_count} Passed)
                            </span>
                          </div>
                        </div>

                        {submissionResult.execution_time_ms && (
                          <span className="text-xs font-mono text-slate-600 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {submissionResult.execution_time_ms}ms
                          </span>
                        )}
                      </div>

                      {/* Error Diagnostic Output */}
                      {submissionResult.error_output && (
                        <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 font-mono text-rose-800 text-xs">
                          <span className="text-rose-600 block text-[10px] uppercase font-bold tracking-wider mb-1">Diagnostic Output:</span>
                          {submissionResult.error_output}
                        </div>
                      )}

                      {/* Public Test Assertions List */}
                      <div className="space-y-2">
                        {submissionResult.public_test_results?.map((res, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border font-mono text-xs space-y-1 ${
                              res.status === 'passed'
                                ? 'border-slate-200 bg-white'
                                : 'border-rose-200 bg-rose-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-sans font-bold text-slate-800">{res.input || `Test Case #${i + 1}`}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                res.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {res.status}
                              </span>
                            </div>

                            {res.error && (
                              <div className="text-rose-700 text-xs mt-1 pt-1 border-t border-rose-100">
                                {res.error}
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="p-3 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Hidden regression test assertions evaluated securely in isolated sandbox.</span>
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
                    <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-600">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="font-mono text-xs">AI Coach analyzing repository files and test traces...</p>
                    </div>
                  ) : hintError ? (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
                      {hintError}
                    </div>
                  ) : currentHint ? (
                    <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <h4 className="font-bold text-slate-900 text-xs">{currentHint.summary}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-bold">
                          Tier: {currentHint.hint_level.replace('_', ' ')}
                        </span>
                      </div>

                      {currentHint.likely_issue && (
                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5 text-amber-700">Potential Bottleneck:</span>
                          {currentHint.likely_issue}
                        </div>
                      )}

                      <div className="text-slate-700 text-xs leading-relaxed font-sans bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                        {currentHint.explanation}
                      </div>

                      {currentHint.next_steps && currentHint.next_steps.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-600 tracking-wider">Suggested Investigation Steps:</span>
                          <ul className="space-y-1">
                            {currentHint.next_steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-700 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-500 space-y-3">
                      <Sparkles className="w-8 h-8 text-blue-500" />
                      <p className="text-xs text-center max-w-sm">
                        Select a tier above and click "AI Coach" to receive contextual Socratic hints based on your active file and test failures.
                      </p>
                      <button
                        onClick={handleRequestHint}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-blue-sm"
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
