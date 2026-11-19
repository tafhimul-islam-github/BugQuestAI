import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import {
  api,
  Challenge,
  Submission,
  CommunitySubmission,
  AiHint,
  RepositoryFile,
  Hypothesis,
  PostMortem,
} from '../api/client';
import { ApmTraceViewer } from '../components/ApmTraceViewer';
import { StateGraphExplorer } from '../components/StateGraphExplorer';
import { PostMortemModal } from '../components/PostMortemModal';
import { ChaosTestDrawer } from '../components/ChaosTestDrawer';
import { VoiceCoachController } from '../components/VoiceCoachController';
import { TimeTravelDebugger } from '../components/TimeTravelDebugger';
import { ReportIssueModal } from '../components/ReportIssueModal';
import { executeInClientWorker } from '../services/wasmEngine';
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
  Shield,
  ArrowLeft,
  FileCode,
  FolderOpen,
  Lock,
  Edit3,
  GitCompare,
  Lightbulb,
  FileText,
  History,
  Users,
  Code2,
  Cpu,
  Eye,
  Download,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Award,
  ShieldCheck,
  Layers,
  Flag,
} from 'lucide-react';

type LeftTab = 'report' | 'apm_trace' | 'state_graph' | 'my_submissions' | 'community' | 'evidence' | 'editorial';
type BottomTab = 'results' | 'coach' | 'chaos' | 'debugger';

export const CodingWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isGuest = !user;

  const goToLogin = (reason?: string) => {
    navigate('/login', {
      state: {
        from: location.pathname,
        message:
          reason ||
          'Sign in to edit code, run sandbox tests, submit solutions, and access the AI Debugging Coach.',
      },
    });
  };

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-file repository state
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [originalFilesMap, setOriginalFilesMap] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs'>('vs-dark');

  // View Mode: 'editor' or 'diff'
  const [viewMode, setViewMode] = useState<'editor' | 'diff'>('editor');

  // Left & Bottom Pane Tabs
  const [leftTab, setLeftTab] = useState<LeftTab>('report');
  const [bottomTab, setBottomTab] = useState<BottomTab>('results');
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);

  // Submissions History State (User's own + Community)
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [communitySubmissions, setCommunitySubmissions] = useState<CommunitySubmission[]>([]);
  const [selectedMySubmission, setSelectedMySubmission] = useState<Submission | null>(null);
  const [restoredFromAccepted, setRestoredFromAccepted] = useState<Submission | null>(null);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);

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

  // Post-Mortem & Chaos Testing State
  const [showPostMortemModal, setShowPostMortemModal] = useState(false);
  const [, setPostMortemRecord] = useState<PostMortem | null>(null);

  // Anti-Cheat & Keystroke Telemetry Tracking
  const keystrokesCount = useRef(0);
  const pasteEventsCount = useRef(0);
  const totalPastedChars = useRef(0);
  const focusLostCount = useRef(0);
  const activeCodingStart = useRef(Date.now());

  useEffect(() => {
    const handleWindowBlur = () => {
      focusLostCount.current += 1;
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, []);

  // Helper to apply a submission's code/files into the workspace
  const applySubmissionToWorkspace = (
    sub: Submission,
    baseRepoFiles: RepositoryFile[],
    starterCodeMap?: Record<string, string>
  ): RepositoryFile[] => {
    if (sub.modified_files && sub.modified_files.length > 0 && baseRepoFiles.length > 0) {
      const modMap: Record<string, string> = {};
      sub.modified_files.forEach((mf) => {
        if (mf.path && typeof mf.content === 'string') {
          modMap[mf.path] = mf.content;
        }
      });
      return baseRepoFiles.map((f) =>
        modMap[f.path] !== undefined ? { ...f, content: modMap[f.path] } : { ...f }
      );
    }

    if (sub.code && sub.code.trim().length > 0) {
      if (baseRepoFiles.length > 0) {
        const firstEditable = baseRepoFiles.find((f) => f.is_editable) || baseRepoFiles[0];
        return baseRepoFiles.map((f) =>
          f.path === firstEditable.path ? { ...f, content: sub.code } : { ...f }
        );
      } else {
        const lang = sub.language || 'javascript';
        return [
          {
            path: lang === 'python' ? 'solution.py' : 'solution.js',
            content: sub.code || starterCodeMap?.[lang] || '',
            is_editable: true,
            language: lang,
          },
        ];
      }
    }

    return baseRepoFiles.map((f) => ({ ...f }));
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.challenges.get(slug);
        const c = res.challenge;
        setChallenge(c);

        const initialLang = (c.supported_languages?.[0] as string) || 'javascript';
        setSelectedLanguage(initialLang);

        // Build starter repository files
        let starterFiles: RepositoryFile[] = [];
        if (c.repository_files && c.repository_files.length > 0) {
          starterFiles = c.repository_files.map((f) => ({ ...f }));
        } else {
          const defaultCode = c.starter_code?.[initialLang] || '';
          starterFiles = [
            {
              path: initialLang === 'python' ? 'solution.py' : 'solution.js',
              content: defaultCode,
              is_editable: true,
              language: initialLang,
            },
          ];
        }

        // Store original starter snapshot for diff & reset
        const origMap: Record<string, string> = {};
        starterFiles.forEach((f) => {
          origMap[f.path] = f.content;
        });
        setOriginalFilesMap(origMap);

        // Populate User Submissions & Community Submissions
        const mySubs = c.user_submissions || [];
        const commSubs = c.community_submissions || [];
        setUserSubmissions(mySubs);
        setCommunitySubmissions(commSubs);

        // Find user's latest accepted submission (or latest submission) to restore their work!
        const latestAccepted = mySubs.find((s) => s.status === 'accepted') || null;
        const latestSub = latestAccepted || mySubs[0] || null;

        let activeRepoFiles = starterFiles;
        if (latestSub) {
          setSelectedMySubmission(latestSub);
          setSubmissionResult(latestSub);
          if (latestSub.language) {
            setSelectedLanguage(latestSub.language);
          }
          activeRepoFiles = applySubmissionToWorkspace(latestSub, starterFiles, c.starter_code);
          if (latestAccepted) {
            setRestoredFromAccepted(latestAccepted);
          }
        }

        setFiles(activeRepoFiles);

        // Set default active file (first editable file)
        const firstEditable = activeRepoFiles.find((f) => f.is_editable) || activeRepoFiles[0];
        if (firstEditable) {
          setActiveFilePath(firstEditable.path);
          setOpenTabs([firstEditable.path]);
          setHypothesis((prev) => ({ ...prev, suspected_file: firstEditable.path }));
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
    return files.find((f) => f.path === activeFilePath) || files[0];
  }, [files, activeFilePath]);

  // Check if workspace has modifications compared to starter code
  const modifiedCount = useMemo(() => {
    return files.filter((f) => f.content !== originalFilesMap[f.path]).length;
  }, [files, originalFilesMap]);

  const isSolved = useMemo(() => {
    return Boolean(challenge?.is_solved || userSubmissions.some((s) => s.status === 'accepted'));
  }, [challenge, userSubmissions]);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (challenge && (!challenge.repository_files || challenge.repository_files.length === 0)) {
      const newPath = newLang === 'python' ? 'solution.py' : 'solution.js';
      const starter = challenge.starter_code?.[newLang] || '';
      const newFile: RepositoryFile = {
        path: newPath,
        content: starter,
        is_editable: true,
        language: newLang,
      };
      setFiles([newFile]);
      setOriginalFilesMap({ [newPath]: starter });
      setActiveFilePath(newPath);
      setOpenTabs([newPath]);
    }
  };

  const handleFileSelect = (filePath: string) => {
    setActiveFilePath(filePath);
    if (!openTabs.includes(filePath)) {
      setOpenTabs([...openTabs, filePath]);
    }
  };

  const handleCloseTab = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openTabs.length <= 1) return;
    const newTabs = openTabs.filter((p) => p !== filePath);
    setOpenTabs(newTabs);
    if (activeFilePath === filePath && newTabs.length > 0) {
      setActiveFilePath(newTabs[newTabs.length - 1]);
    }
  };

  const handleCodeChange = (newVal: string | undefined) => {
    if (isGuest || !activeFile || !activeFile.is_editable) return;
    const updatedContent = newVal ?? '';
    const oldContent = activeFile.content || '';
    const charDiff = updatedContent.length - oldContent.length;

    if (charDiff > 25) {
      // Paste or large clipboard insertion
      pasteEventsCount.current += 1;
      totalPastedChars.current += charDiff;
    } else if (charDiff !== 0) {
      // Keystroke
      keystrokesCount.current += 1;
    }

    setFiles((prev) => prev.map((f) => (f.path === activeFile.path ? { ...f, content: updatedContent } : f)));
  };

  const handleResetActiveFile = () => {
    if (!activeFile) return;
    const orig = originalFilesMap[activeFile.path];
    if (orig !== undefined) {
      setFiles((prev) => prev.map((f) => (f.path === activeFile.path ? { ...f, content: orig } : f)));
      setRestoredFromAccepted(null);
    }
  };

  const handleResetWorkspace = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, content: originalFilesMap[f.path] ?? f.content })));
    setRestoredFromAccepted(null);
  };

  const handleLoadSubmissionIntoEditor = (sub: Submission) => {
    if (!challenge) return;
    const baseFiles: RepositoryFile[] =
      challenge.repository_files && challenge.repository_files.length > 0
        ? challenge.repository_files.map((f) => ({ ...f }))
        : files.map((f) => ({ ...f, content: originalFilesMap[f.path] ?? f.content }));

    const updated = applySubmissionToWorkspace(sub, baseFiles, challenge.starter_code);
    setFiles(updated);
    setSubmissionResult(sub);
    setSelectedMySubmission(sub);
    if (sub.status === 'accepted') {
      setRestoredFromAccepted(sub);
    }
    setViewMode('editor');
  };

  const generatePatchDiff = (): string => {
    let diffText = '';
    files.forEach((f) => {
      const orig = originalFilesMap[f.path];
      if (orig !== undefined && orig !== f.content) {
        diffText += `--- a/${f.path}\n+++ b/${f.path}\n${f.content}\n`;
      }
    });
    return diffText;
  };

  const handleSubmitSolution = async () => {
    if (isGuest) {
      goToLogin('You must sign in to run tests and submit your solution.');
      return;
    }
    if (!challenge) return;
    setSubmitting(true);
    setBottomTab('results');
    setConsoleCollapsed(false);

    try {
      const lang = selectedLanguage || challenge.supported_languages?.[0] || 'javascript';
      const modifiedFilesPayload = files.filter((f) => f.is_editable);

      // Offline WebAssembly / Worker execution fallback
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const offlineResult = await executeInClientWorker(
          files,
          challenge.entrypoint_test || 'tests/runner.cjs'
        );

        const offlineSub: Submission = {
          id: Date.now(),
          challenge_id: challenge.id,
          language: lang,
          code: activeFile?.content || '',
          modified_files: modifiedFilesPayload,
          status: offlineResult.status,
          pass_count: offlineResult.pass_count,
          total_count: offlineResult.total_count,
          execution_time_ms: offlineResult.execution_time_ms,
          memory_kb: offlineResult.memory_kb,
          error_output: offlineResult.error_output || undefined,
          public_test_results: offlineResult.public_test_results as any,
          created_at: new Date().toISOString(),
        };

        setSubmissionResult(offlineSub);
        setSelectedMySubmission(offlineSub);
        setUserSubmissions((prev) => [offlineSub, ...prev]);
        setSubmitting(false);
        return;
      }

      const res = await api.submissions.create({
        challenge_id: challenge.id,
        language: lang,
        code: activeFile?.content || '',
        modified_files: modifiedFilesPayload,
        hypothesis: hypothesis,
        patch_diff: generatePatchDiff(),
        telemetry: {
          keystrokes_count: keystrokesCount.current,
          paste_events_count: pasteEventsCount.current,
          total_pasted_chars: totalPastedChars.current,
          active_coding_ms: Date.now() - activeCodingStart.current,
          focus_lost_count: focusLostCount.current,
        },
      });

      const newSub: Submission = {
        ...res.submission,
        code: res.submission.code || activeFile?.content || '',
        modified_files: res.submission.modified_files || modifiedFilesPayload,
        language: res.submission.language || lang,
      };

      setSubmissionResult(newSub);
      setSelectedMySubmission(newSub);
      setUserSubmissions((prev) => [newSub, ...prev]);
      setCommunitySubmissions((prev) => [
        {
          id: newSub.id,
          user_name: 'You',
          user_role: 'Current Session',
          is_own: true,
          status: newSub.status,
          language: newSub.language,
          pass_count: newSub.pass_count,
          total_count: newSub.total_count,
          execution_time_ms: newSub.execution_time_ms,
          memory_kb: newSub.memory_kb,
          created_at: newSub.created_at,
        },
        ...prev,
      ]);

      if (newSub.status === 'accepted') {
        setRestoredFromAccepted(newSub);
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#06b6d4', '#f59e0b'],
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
    setConsoleCollapsed(false);

    try {
      const lang = selectedLanguage || challenge.supported_languages?.[0] || 'javascript';
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-medium text-slate-300">
            Provisioning isolated sandbox & loading repository...
          </span>
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
        <Link
          to="/challenges"
          className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Return to Challenge Library
        </Link>
      </div>
    );
  }

  const difficultyStyles: Record<string, string> = {
    beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    advanced: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  const statusBadge = (status: string) => {
    if (status === 'accepted') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (status === 'time_limit_exceeded') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getMonacoLang = (path: string) => {
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.md')) return 'markdown';
    return selectedLanguage === 'python' ? 'python' : 'javascript';
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      {/* Top Workbench Header Bar */}
      <div className="h-13 border-b border-slate-200 bg-white px-4 py-2 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to="/challenges"
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quests</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

          <h1 className="font-bold text-slate-900 text-sm truncate">{challenge.title}</h1>

          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
              difficultyStyles[challenge.difficulty] || difficultyStyles.beginner
            }`}
          >
            {challenge.difficulty}
          </span>

          {isSolved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solved</span>
            </span>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isGuest ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Preview Mode — Sign in to edit &amp; submit
              </span>
              <button
                onClick={() => goToLogin()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Solve</span>
              </button>
            </>
          ) : (
            <>
          {/* Language Selector (when single-file challenge supports multiple languages) */}
          {(!challenge.repository_files || challenge.repository_files.length === 0) &&
            challenge.supported_languages &&
            challenge.supported_languages.length > 1 && (
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
              >
                {challenge.supported_languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'python' ? 'Python 3' : 'JavaScript (Node)'}
                  </option>
                ))}
              </select>
            )}

          {/* View Mode Toggle: Source vs Diff */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'diff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Diff ({modifiedCount})</span>
            </button>
          </div>

          {/* Editor Theme Toggle */}
          <button
            onClick={() => setEditorTheme((prev) => (prev === 'vs-dark' ? 'vs' : 'vs-dark'))}
            title="Toggle Editor Theme"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
          >
            {editorTheme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleResetWorkspace}
            title="Reset to original starter code"
            className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset Starter</span>
          </button>

          <button
            onClick={async () => {
              if (!challenge) return;
              try {
                const res = await api.interviews.create({
                  challenge_id: challenge.id,
                  candidate_name: 'Alex Chen',
                });
                if (res.session?.session_code) {
                  window.location.href = `/interviews/${res.session.session_code}`;
                }
              } catch (err: any) {
                console.error('Failed to create interview session', err);
                alert('Could not start pair interview session: ' + (err?.message || 'Server error'));
              }
            }}
            title="Start Mock Collaborative Interview Room"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition-all"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Pair Interview</span>
          </button>

          <button
            onClick={() => setReportIssueOpen(true)}
            title="Report a bug or unclear description in this challenge"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report issue</span>
          </button>

          <button
            onClick={handleRequestHint}
            disabled={requestingHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Coach</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Run & Submit</span>
          </button>
            </>
          )}
        </div>
      </div>

      {/* Main Split Workbench */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* LEFT PANE: Problem Specs, My Submissions (with Code), Community Submissions, Evidence, Editorial */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-white min-h-0 overflow-hidden select-text">
          {/* Left Navigation Tabs */}
          <div className="flex items-center gap-0.5 px-2 pt-1.5 border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
            <button
              onClick={() => setLeftTab('report')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'report'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Problem & Ticket</span>
            </button>

            <button
              onClick={() => setLeftTab('apm_trace')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'apm_trace'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-red-500" />
              <span>APM Telemetry</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-100 text-red-700 font-bold">
                Trace
              </span>
            </button>

            <button
              onClick={() => setLeftTab('state_graph')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'state_graph'
                  ? 'border-indigo-600 text-indigo-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>State Topology</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-100 text-indigo-700 font-bold">
                Graph
              </span>
            </button>

            <button
              onClick={() => setLeftTab('my_submissions')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'my_submissions'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>My Submissions</span>
              {userSubmissions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 text-blue-700 font-bold">
                  {userSubmissions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setLeftTab('community')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'community'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Submissions Feed</span>
              {communitySubmissions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700 font-bold">
                  {communitySubmissions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setLeftTab('evidence')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'evidence'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => setLeftTab('editorial')}
              className={`px-3 py-2 border-b-2 text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'editorial'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial</span>
            </button>
          </div>

          {/* Left Pane Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700 leading-relaxed min-h-0">
            {/* Guest Lock Gate for non-preview tabs */}
            {isGuest && leftTab !== 'report' ? (
              <div className="my-8 p-6 rounded-2xl border border-slate-200 bg-slate-50/80 text-center space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Sign in required</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Guests can preview the problem ticket. Sign in to unlock APM telemetry, state graphs, submission history, notes, and editorials.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={() => goToLogin('Sign in to access full debugging telemetry, submissions, and editorial guides.')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Sign In
                  </button>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    Create Free Account
                  </Link>
                </div>
              </div>
            ) : (
            <>
            {/* TAB 1: PROBLEM & BUG TICKET */}
            {leftTab === 'report' && (
              <div className="space-y-6">
                {/* Restored Accepted Solution Notice */}
                {restoredFromAccepted && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block text-xs">Accepted Solution Restored</span>
                        <span className="text-[11px] text-emerald-700">
                          Loaded your verified solution from {formatDate(restoredFromAccepted.created_at)}.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setLeftTab('my_submissions')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      View History
                    </button>
                  </div>
                )}

                {/* Bug Report Ticket Card (if present) */}
                {challenge.bug_report && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                        Defect Ticket
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Est. {challenge.investigation_time_minutes || 25}m
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {challenge.bug_report.issue_title || challenge.title}
                    </h3>

                    {challenge.bug_report.symptoms && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-mono uppercase font-bold text-slate-500">
                          Observable Symptoms
                        </h4>
                        <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs">
                          {challenge.bug_report.symptoms}
                        </p>
                      </div>
                    )}

                    {challenge.bug_report.reproduction_steps &&
                      challenge.bug_report.reproduction_steps.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-mono uppercase font-bold text-slate-500">
                            Reproduction Steps
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs">
                            {challenge.bug_report.reproduction_steps.map((step, idx) => (
                              <li key={idx}>{typeof step === 'string' ? step.replace(/^\d+[\.\)]\s*/, '') : step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                    {(challenge.bug_report.expected_behavior || challenge.bug_report.actual_behavior) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                          <span className="block text-[10px] font-mono uppercase font-bold text-emerald-700 mb-1">
                            Expected Behavior
                          </span>
                          <span className="text-emerald-950 text-xs">
                            {challenge.bug_report.expected_behavior || 'All test assertions pass'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                          <span className="block text-[10px] font-mono uppercase font-bold text-rose-700 mb-1">
                            Actual Defect
                          </span>
                          <span className="text-rose-950 text-xs">
                            {challenge.bug_report.actual_behavior || 'Fails boundary assertions'}
                          </span>
                        </div>
                      </div>
                    )}

                    {challenge.bug_report.scope_boundary && (
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[10px] uppercase tracking-wider">Scope Boundary</span>
                          <span>{challenge.bug_report.scope_boundary}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Problem Statement & Specifications */}
                {challenge.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Problem Specification
                    </h3>
                    <div className="whitespace-pre-line text-slate-800 text-xs leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                      {challenge.description}
                    </div>
                  </div>
                )}

                {/* Public Examples */}
                {challenge.public_examples && challenge.public_examples.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Examples & Test Cases
                    </h4>
                    <div className="space-y-2.5">
                      {challenge.public_examples.map((ex, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5"
                        >
                          <div>
                            <span className="text-slate-500 font-bold">Input: </span>
                            <span className="text-slate-900">{ex.input}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold">Expected Output: </span>
                            <span className="text-emerald-700 font-semibold">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div className="text-slate-600 font-sans text-[11px] pt-1 border-t border-slate-200/80">
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {challenge.constraints && challenge.constraints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Constraints & Limits
                    </h4>
                    <ul className="list-disc list-inside space-y-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700">
                      {challenge.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                      <li>
                        Time Limit: {challenge.time_limit_ms || 2000}ms &bull; Memory Cap:{' '}
                        {challenge.memory_limit_mb || 128}MB
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB: APM DISTRIBUTED TRACE VIEWER */}
            {leftTab === 'apm_trace' && (
              <div className="space-y-4">
                <ApmTraceViewer traces={challenge.telemetry_traces} framework={challenge.framework} />
              </div>
            )}

            {/* TAB: VISUAL MEMORY & STATE GRAPH EXPLORER */}
            {leftTab === 'state_graph' && (
              <div className="space-y-4">
                <StateGraphExplorer
                  category={challenge.category}
                  challengeSlug={challenge.slug}
                  challengeTitle={challenge.title}
                />
              </div>
            )}

            {/* TAB 2: MY SUBMISSIONS (Shows user's accepted & past submissions WITH full code viewer) */}
            {leftTab === 'my_submissions' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-600" />
                      <span>My Submission History</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click any of your submissions below to inspect your code or restore it directly into the editor.
                    </p>
                  </div>
                </div>

                {userSubmissions.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
                    <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-800 text-xs">No submissions recorded yet</p>
                    <p className="text-slate-500 text-xs">
                      Click &ldquo;Run &amp; Submit&rdquo; in the top right to verify your code in the sandbox.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* List of User's Submissions */}
                    <div className="space-y-2">
                      {userSubmissions.map((sub) => {
                        const isSelected = selectedMySubmission?.id === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedMySubmission(sub)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusBadge(
                                    sub.status
                                  )}`}
                                >
                                  {sub.status.replace(/_/g, ' ')}
                                </span>
                                <span className="font-mono text-xs font-semibold text-slate-700">
                                  {sub.pass_count}/{sub.total_count} tests passed
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] uppercase">
                                  {sub.language}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-3 font-mono">
                                <span>{formatDate(sub.created_at)}</span>
                                {sub.execution_time_ms && <span>&bull; {sub.execution_time_ms}ms</span>}
                                {sub.memory_kb && <span>&bull; {Math.round(sub.memory_kb / 1024)}MB</span>}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadSubmissionIntoEditor(sub);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                            >
                              <Download className="w-3 h-3" />
                              <span>Load into Editor</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Submission Code Inspector */}
                    {selectedMySubmission && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-mono text-xs font-bold text-white">
                              Submission #{selectedMySubmission.id} ({selectedMySubmission.status.toUpperCase()})
                            </span>
                          </div>
                          <button
                            onClick={() => handleLoadSubmissionIntoEditor(selectedMySubmission)}
                            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Restore to Workspace</span>
                          </button>
                        </div>

                        {selectedMySubmission.modified_files && selectedMySubmission.modified_files.length > 0 ? (
                          <div className="divide-y divide-slate-800">
                            {selectedMySubmission.modified_files.map((mf) => (
                              <div key={mf.path} className="p-3.5 space-y-1.5">
                                <div className="text-[11px] font-mono text-blue-300 font-semibold">{mf.path}</div>
                                <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                                  {mf.content}
                                </pre>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3.5">
                            <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                              {selectedMySubmission.code || '// No code snapshot recorded'}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMMUNITY SUBMISSIONS FEED (Shows others' submissions WITHOUT exposing solution code) */}
            {leftTab === 'community' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Community Submissions Feed</span>
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Solutions Hidden
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Live verification log across all learners for this quest. To protect assessment integrity, other
                    learners&rsquo; source code is strictly hidden.
                  </p>
                </div>

                {communitySubmissions.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-800 text-xs">Be the first to submit a solution!</p>
                    <p className="text-slate-500 text-xs">
                      No community submissions have been recorded for this quest yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {communitySubmissions.map((cs) => (
                      <div
                        key={cs.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              cs.status === 'accepted'
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                : 'bg-gradient-to-br from-slate-500 to-slate-700'
                            }`}
                          >
                            {cs.user_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs truncate">{cs.user_name}</span>
                              {cs.is_own && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  You
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${statusBadge(
                                  cs.status
                                )}`}
                              >
                                {cs.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <span className="uppercase font-semibold text-slate-600">{cs.language}</span>
                              <span>
                                &bull; {cs.pass_count}/{cs.total_count} passed
                              </span>
                              {cs.execution_time_ms && <span>&bull; {cs.execution_time_ms}ms</span>}
                              <span>&bull; {formatDate(cs.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {cs.is_own ? (
                          <button
                            onClick={() => setLeftTab('my_submissions')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold shrink-0 transition-colors"
                          >
                            View My Code
                          </button>
                        ) : (
                          <div
                            title="Other learners' source code is hidden to preserve authentic problem-solving"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-mono flex items-center gap-1 shrink-0"
                          >
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Code Hidden</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HYPOTHESIS & EVIDENCE NOTES */}
            {leftTab === 'evidence' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Root Cause Hypothesis Log</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Document your engineering investigation notes alongside your code patch.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">
                      Suspected File / Module
                    </label>
                    <select
                      value={hypothesis.suspected_file}
                      onChange={(e) => setHypothesis({ ...hypothesis, suspected_file: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    >
                      {files.map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.path} {f.is_editable ? '(editable)' : '(read-only)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">
                      Diagnosed Root Cause
                    </label>
                    <textarea
                      rows={3}
                      value={hypothesis.root_cause}
                      onChange={(e) => setHypothesis({ ...hypothesis, root_cause: e.target.value })}
                      placeholder="Describe the boundary condition or state mutation bug..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 mb-1">
                      Repair Strategy
                    </label>
                    <textarea
                      rows={2}
                      value={hypothesis.proposed_fix}
                      onChange={(e) => setHypothesis({ ...hypothesis, proposed_fix: e.target.value })}
                      placeholder="Outline how your patch resolves the issue without regressions..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: EDITORIAL */}
            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Architectural Notes &amp; Editorial</span>
                </h3>
                <div className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 font-normal leading-relaxed text-xs text-slate-700">
                  {challenge.editorial ||
                    'Use the 4-tier AI Debugging Coach in the bottom drawer for progressive Socratic guidance tailored to your current code.'}
                </div>
              </div>
            )}
            </>
            )}
          </div>
        </div>

        {/* RIGHT PANE: File Explorer + Monaco Code Editor + Execution & AI Coach Console */}
        <div className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden bg-slate-900">
          {/* Top Editor Split Area */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* File Explorer Sidebar (shown when repository has multiple files) */}
            {files.length > 1 && (
              <div className="w-52 border-r border-slate-800 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-0 overflow-y-auto">
                <div className="px-3 py-2.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Explorer ({files.length})</span>
                  </span>
                </div>

                <div className="p-1.5 space-y-0.5 text-xs font-mono">
                  {files.map((f) => {
                    const isActive = f.path === activeFilePath;
                    const isModified = f.content !== originalFilesMap[f.path];
                    return (
                      <button
                        key={f.path}
                        onClick={() => handleFileSelect(f.path)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-1.5 transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate text-xs">{f.path}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isModified && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-300' : 'bg-amber-400'}`}
                            />
                          )}
                          {!f.is_editable ? (
                            <Lock className="w-3 h-3 opacity-60" />
                          ) : (
                            <Edit3 className="w-3 h-3 opacity-60" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Monaco Editor Container */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-[#1e1e1e]">
              {/* Open File Tabs Bar */}
              <div className="h-9 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-2 shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {openTabs.map((tabPath) => {
                    const isActive = tabPath === activeFilePath;
                    const fileObj = files.find((f) => f.path === tabPath);
                    const isModified = fileObj && fileObj.content !== originalFilesMap[tabPath];
                    return (
                      <div
                        key={tabPath}
                        onClick={() => setActiveFilePath(tabPath)}
                        className={`px-3 py-1 rounded-t-md text-xs font-mono flex items-center gap-2 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[#1e1e1e] text-blue-400 font-bold border-t-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <span className="truncate max-w-[150px]">{tabPath}</span>
                        {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        {openTabs.length > 1 && (
                          <button
                            onClick={(e) => handleCloseTab(tabPath, e)}
                            className="text-slate-500 hover:text-slate-200 text-[10px]"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  {!activeFile?.is_editable ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read-Only Test File
                    </span>
                  ) : (
                    <button
                      onClick={handleResetActiveFile}
                      className="text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset File
                    </button>
                  )}
                </div>
              </div>

              {/* Monaco Surface */}
              <div className="flex-1 relative min-h-0">
                {viewMode === 'editor' ? (
                  <Editor
                    height="100%"
                    language={getMonacoLang(activeFilePath)}
                    theme={editorTheme}
                    value={activeFile?.content || ''}
                    onChange={handleCodeChange}
                    options={{
                      readOnly: isGuest || !activeFile?.is_editable,
                      minimap: { enabled: false },
                      fontSize: 13.5,
                      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 14, bottom: 14 },
                      tabSize: 2,
                    }}
                  />
                ) : (
                  <DiffEditor
                    height="100%"
                    language={getMonacoLang(activeFilePath)}
                    theme={editorTheme}
                    original={originalFilesMap[activeFilePath] || ''}
                    modified={activeFile?.content || ''}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 14, bottom: 14 },
                    }}
                  />
                )}

                {isGuest && (
                  <div className="absolute inset-x-0 bottom-0 top-[28%] bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-20">
                    <div className="max-w-md w-full rounded-2xl bg-white/95 border border-slate-200 shadow-2xl p-6 text-center space-y-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900">Sign in to edit and submit</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          You are viewing a limited preview of this challenge. Sign in to edit repository files, run automated tests in the sandbox, submit solutions, and use the AI Debugging Coach.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                        <button
                          onClick={() => goToLogin()}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                        >
                          Sign In to Continue
                        </button>
                        <Link
                          to="/register"
                          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Create Free Account
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Execution & Socratic AI Coach Console */}
          {isGuest ? (
            <div className="h-12 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>You must sign in to run tests, submit solutions, or open the AI Debugging Coach.</span>
              </div>
              <button
                onClick={() => goToLogin()}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          ) : (
          <div
            className={`${
              consoleCollapsed ? 'h-10' : 'h-[38%]'
            } border-t border-slate-200 flex flex-col bg-white transition-all duration-150 shrink-0 min-h-0 overflow-hidden select-text`}
          >
            {/* Console Header Bar */}
            <div className="h-10 px-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBottomTab('results');
                    setConsoleCollapsed(false);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    bottomTab === 'results' && !consoleCollapsed
                      ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sandbox Console</span>
                  {submissionResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        submissionResult.status === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  )}
                </button>

                <button
                  onClick={() => {
                    setBottomTab('coach');
                    setConsoleCollapsed(false);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    bottomTab === 'coach' && !consoleCollapsed
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>4-Tier AI Coach</span>
                </button>

                <button
                  onClick={() => {
                    setBottomTab('debugger');
                    setConsoleCollapsed(false);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    bottomTab === 'debugger' && !consoleCollapsed
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Step Debugger</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-bold">
                    Replay
                  </span>
                </button>

                {submissionResult && submissionResult.status === 'accepted' && (
                  <button
                    onClick={() => {
                      setBottomTab('chaos');
                      setConsoleCollapsed(false);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      bottomTab === 'chaos' && !consoleCollapsed
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-bold'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chaos Monkey</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800">
                      Stress
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {bottomTab === 'coach' && !consoleCollapsed && (
                  <>
                    <VoiceCoachController currentHintText={currentHint?.explanation} />
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                      {(
                        [
                          { id: 'nudge', label: '1. Nudge' },
                          { id: 'direction', label: '2. Direction' },
                          { id: 'debugging_guidance', label: '3. Diagnostic' },
                          { id: 'detailed_explanation', label: '4. Walkthrough' },
                        ] as const
                      ).map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setHintLevel(tier.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            hintLevel === tier.id
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={() => setConsoleCollapsed(!consoleCollapsed)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500"
                  title={consoleCollapsed ? 'Expand Console' : 'Minimize Console'}
                >
                  {consoleCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Console Scrollable Body */}
            {!consoleCollapsed && (
              <div className="flex-1 overflow-y-auto p-4 text-xs min-h-0">
                {bottomTab === 'results' && (
                  <div className="space-y-3">
                    {submitting ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-slate-600">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-xs">
                          Executing code inside isolated sandbox against public &amp; hidden boundary tests...
                        </span>
                      </div>
                    ) : !submissionResult ? (
                      <div className="py-8 flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <Cpu className="w-7 h-7 text-slate-400" />
                        <p className="text-xs font-medium">
                          Click &ldquo;Run &amp; Submit&rdquo; to execute your solution in the isolated test judge.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Status Banner */}
                        <div
                          className={`p-3.5 rounded-xl border flex items-center justify-between ${
                            submissionResult.status === 'accepted'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {submissionResult.status === 'accepted' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-xs uppercase tracking-wider">
                                {submissionResult.status.replace(/_/g, ' ')}
                              </span>
                              <span className="ml-2 font-mono text-xs font-semibold opacity-80">
                                ({submissionResult.pass_count} / {submissionResult.total_count} Assertions Passed)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono">
                            {submissionResult.execution_time_ms && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {submissionResult.execution_time_ms}ms
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Celebratory Post-Mortem & Chaos Monkey Banner on Accepted */}
                        {submissionResult.status === 'accepted' && (
                          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-xs">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">
                                  Verification Succeeded — Ready for Incident Drills
                                </span>
                                <span className="text-[11px] text-slate-600">
                                  Cement your workforce dossier by drafting an RCA or stress-testing against Chaos Monkey mutations.
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowPostMortemModal(true)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Draft RCA Post-Mortem</span>
                              </button>

                              <button
                                onClick={() => {
                                  setBottomTab('chaos');
                                  setConsoleCollapsed(false);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                              >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>Chaos Stress Test</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Anti-Cheat & Keystroke Telemetry Badge */}
                        {submissionResult.telemetry && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-slate-800">
                                Behavioral Integrity:
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                {submissionResult.telemetry.integrity_confidence_score ?? 100}% Verified Organic
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                              <span>Keystrokes: <strong className="text-slate-900">{submissionResult.telemetry.keystrokes_count ?? 0}</strong></span>
                              <span>Pastes: <strong className="text-slate-900">{submissionResult.telemetry.paste_events_count ?? 0}</strong></span>
                              <span>Coding Time: <strong className="text-slate-900">{Math.max(1, Math.round((submissionResult.telemetry.active_coding_ms ?? 0) / 1000))}s</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Error Output */}
                        {submissionResult.error_output && (
                          <div className="p-3 rounded-xl border border-rose-200 bg-rose-950 text-rose-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                            <span className="text-rose-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                              Runtime / Assertion Diagnostics:
                            </span>
                            {submissionResult.error_output}
                          </div>
                        )}

                        {/* Public Test Case Results */}
                        {submissionResult.public_test_results && submissionResult.public_test_results.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {submissionResult.public_test_results.map((res, i) => (
                              <div
                                key={i}
                                className={`p-3 rounded-xl border font-mono text-xs space-y-1 ${
                                  res.status === 'passed'
                                    ? 'border-slate-200 bg-slate-50/70'
                                    : 'border-rose-200 bg-rose-50/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-sans font-bold text-slate-800 truncate">
                                    {res.input || `Test Assertion #${i + 1}`}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      res.status === 'passed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {res.status}
                                  </span>
                                </div>
                                {res.expected_output && (
                                  <div className="text-[11px] text-slate-600">
                                    Expected: <span className="text-emerald-700">{res.expected_output}</span> &bull; Got:{' '}
                                    <span className="text-slate-900">{res.actual_output}</span>
                                  </div>
                                )}
                                {res.error && <div className="text-rose-700 text-[11px] pt-1">{res.error}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {bottomTab === 'coach' && (
                  <div className="space-y-3">
                    {requestingHint ? (
                      <div className="py-8 flex flex-col items-center justify-center space-y-2.5 text-slate-600">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-mono text-xs">
                          Socratic AI Coach analyzing your code &amp; sandbox diagnostics...
                        </p>
                      </div>
                    ) : hintError ? (
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
                        {hintError}
                      </div>
                    ) : currentHint ? (
                      <div className="bg-indigo-50/40 rounded-xl border border-indigo-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-bold text-slate-900 text-xs">{currentHint.summary}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold uppercase">
                              Tier: {currentHint.hint_level.replace(/_/g, ' ')}
                            </span>
                            <button
                              onClick={handleRequestHint}
                              className="px-2.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold"
                            >
                              Refresh Hint
                            </button>
                          </div>
                        </div>

                        {currentHint.likely_issue && (
                          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs">
                            <span className="font-bold uppercase text-[10px] text-amber-700 mr-1.5">
                              Diagnosed Issue:
                            </span>
                            {currentHint.likely_issue}
                          </div>
                        )}

                        <p className="text-slate-800 text-xs leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                          {currentHint.explanation}
                        </p>

                        {currentHint.next_steps && currentHint.next_steps.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                              Recommended Next Steps:
                            </span>
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
                      <div className="py-6 flex flex-col items-center justify-center text-slate-500 space-y-2.5">
                        <Sparkles className="w-7 h-7 text-indigo-500" />
                        <p className="text-xs text-center max-w-md">
                          Select a progressive tier (1. Nudge &rarr; 4. Walkthrough) and request Socratic guidance
                          without spoiling the solution.
                        </p>
                        <button
                          onClick={handleRequestHint}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
                        >
                          Get {hintLevel.replace(/_/g, ' ')} Hint
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {bottomTab === 'chaos' && submissionResult && (
                  <ChaosTestDrawer
                    submissionId={submissionResult.id}
                    initialResults={submissionResult.chaos_results}
                    onChaosCompleted={(newChaos) => {
                      setSubmissionResult((prev) => (prev ? { ...prev, chaos_results: newChaos } : prev));
                    }}
                  />
                )}

                {bottomTab === 'debugger' && (
                  <TimeTravelDebugger challengeSlug={challenge.slug} />
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {challenge && (
        <>
          <PostMortemModal
            challengeId={challenge.id}
            challengeTitle={challenge.title}
            submissionId={submissionResult?.id || (userSubmissions.find((s) => s.status === 'accepted')?.id || 0)}
            isOpen={showPostMortemModal}
            onClose={() => setShowPostMortemModal(false)}
            onSaved={(pm) => setPostMortemRecord(pm)}
          />
          <ReportIssueModal
            challengeId={challenge.id}
            challengeTitle={challenge.title}
            isOpen={reportIssueOpen}
            onClose={() => setReportIssueOpen(false)}
          />
        </>
      )}
    </div>
  );
};
