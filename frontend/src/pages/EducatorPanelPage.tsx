import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  ChallengeFeedbackItem,
  ClassroomItem,
  ClassroomProgressResponse,
  ManagedChallenge,
  PanelNotificationItem,
} from '../api/client';
import {
  AvailabilityStatusBadge,
  FeedbackStatusBadge,
  ReviewStatusBadge,
  SeverityBadge,
} from '../components/PanelBadges';
import { DashboardShell, DashboardNavItem } from '../components/DashboardShell';
import { ByobImportModal } from '../components/ByobImportModal';
import {
  LayoutDashboard,
  FileCode2,
  MessageSquareWarning,
  Users,
  Plus,
  Send,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Search,
  Github,
  BookOpen,
  ShieldAlert,
  Clock,
  ArrowLeft,
  UserPlus,
  ExternalLink,
} from 'lucide-react';

type EducatorTab = 'overview' | 'challenges' | 'feedback' | 'classrooms';

interface TestCaseDraft {
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
}

const DEFAULT_TEST_CASES: TestCaseDraft[] = [
  { input: '2,7,11,15\n9', expected_output: '[0,1]', is_hidden: false, explanation: 'Public sample' },
  { input: '3,3\n6', expected_output: '[0,1]', is_hidden: true, explanation: 'Hidden edge case' },
];

export const EducatorPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EducatorTab>('overview');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview state
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Challenges state
  const [challenges, setChallenges] = useState<ManagedChallenge[]>([]);
  const [challengeSearch, setChallengeSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [byobOpen, setByobOpen] = useState(false);

  // Challenge editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<ManagedChallenge | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [formCategory, setFormCategory] = useState('logic_state');
  const [formFramework, setFormFramework] = useState('Node.js');
  const [formTime, setFormTime] = useState(25);
  const [formDescription, setFormDescription] = useState('');
  const [formSymptoms, setFormSymptoms] = useState('');
  const [formExpected, setFormExpected] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formRepro, setFormRepro] = useState('1. Trigger workflow with test payload.\n2. Observe failing assertion.');
  const [formTopics, setFormTopics] = useState('debugging, state_management');
  const [formLanguages, setFormLanguages] = useState('javascript, python');
  const [formStarter, setFormStarter] = useState("function solve(input) {\n  return input;\n}\nmodule.exports = { solve };");
  const [formHints, setFormHints] = useState('');
  const [formChangeSummary, setFormChangeSummary] = useState('');
  const [formTestCases, setFormTestCases] = useState<TestCaseDraft[]>(DEFAULT_TEST_CASES);
  const [savingChallenge, setSavingChallenge] = useState(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);

  // Feedback inbox state
  const [feedbackList, setFeedbackList] = useState<ChallengeFeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [triageNotes, setTriageNotes] = useState<Record<number, string>>({});
  const [triageVersions, setTriageVersions] = useState<Record<number, string>>({});

  // Classrooms state
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [classroomProgress, setClassroomProgress] = useState<ClassroomProgressResponse | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [assignChallengeId, setAssignChallengeId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assignDueAt, setAssignDueAt] = useState('');
  const [publishedCatalog, setPublishedCatalog] = useState<Array<{ id: number; title: string; difficulty: string }>>([]);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await api.educator.overview();
      setOverview(res);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load educator overview.');
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await api.educator.listChallenges({
        review_status: reviewFilter !== 'all' ? reviewFilter : undefined,
        search: challengeSearch || undefined,
      });
      setChallenges(res.challenges);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load challenges.');
    } finally {
      setLoadingChallenges(false);
    }
  };

  const loadFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await api.educator.listFeedback({
        status: feedbackFilter !== 'all' ? feedbackFilter : undefined,
      });
      setFeedbackList(res.feedback);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load feedback inbox.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const loadClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const [classRes, pubRes] = await Promise.all([
        api.educator.listClassrooms(),
        api.challenges.list(),
      ]);
      setClassrooms(classRes.classrooms);
      setPublishedCatalog(pubRes.challenges.map((c) => ({ id: c.id, title: c.title, difficulty: c.difficulty })));
      if (!selectedClassroomId && classRes.classrooms.length > 0) {
        setSelectedClassroomId(classRes.classrooms[0].id);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load classrooms.');
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const loadClassroomProgress = async (classroomId: number) => {
    try {
      const res = await api.educator.classroomProgress(classroomId);
      setClassroomProgress(res);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load classroom progress.');
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'challenges') loadChallenges();
    if (activeTab === 'feedback') loadFeedback();
    if (activeTab === 'classrooms') loadClassrooms();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'challenges') loadChallenges();
  }, [reviewFilter]);

  useEffect(() => {
    if (activeTab === 'feedback') loadFeedback();
  }, [feedbackFilter]);

  useEffect(() => {
    if (selectedClassroomId) {
      loadClassroomProgress(selectedClassroomId);
    } else {
      setClassroomProgress(null);
    }
  }, [selectedClassroomId]);

  const openCreateEditor = () => {
    setEditingChallenge(null);
    setFormTitle('');
    setFormDifficulty('intermediate');
    setFormCategory('logic_state');
    setFormFramework('Node.js');
    setFormTime(25);
    setFormDescription('');
    setFormSymptoms('');
    setFormExpected('');
    setFormActual('');
    setFormRepro('1. Trigger workflow with test payload.\n2. Observe failing assertion.');
    setFormTopics('debugging, state_management');
    setFormLanguages('javascript, python');
    setFormStarter("function solve(input) {\n  return input;\n}\nmodule.exports = { solve };");
    setFormHints('');
    setFormChangeSummary('');
    setFormTestCases(DEFAULT_TEST_CASES);
    setEditorOpen(true);
  };

  const openEditEditor = async (challengeId: number) => {
    try {
      const res = await api.educator.getChallenge(challengeId);
      const c = res.challenge;
      setEditingChallenge(c);
      setFormTitle(c.title);
      setFormDifficulty(c.difficulty);
      setFormCategory(c.category || 'logic_state');
      setFormFramework(c.framework || 'Node.js');
      setFormTime(c.investigation_time_minutes || 25);
      setFormDescription(c.description || '');
      setFormSymptoms(c.bug_report?.symptoms || '');
      setFormExpected(c.bug_report?.expected_behavior || '');
      setFormActual(c.bug_report?.actual_behavior || '');
      setFormRepro((c.bug_report?.reproduction_steps || []).join('\n'));
      setFormTopics((c.topics || []).join(', '));
      setFormLanguages((c.supported_languages || ['javascript']).join(', '));
      const starterVal =
        c.starter_code && typeof c.starter_code === 'object'
          ? Object.values(c.starter_code)[0] || ''
          : '';
      setFormStarter(starterVal);
      setFormHints(Array.isArray((c as any).hints) ? (c as any).hints.join('\n') : '');
      setFormChangeSummary('');
      setFormTestCases(
        c.test_cases && c.test_cases.length > 0
          ? c.test_cases.map((tc) => ({
              input: tc.input,
              expected_output: tc.expected_output,
              is_hidden: tc.is_hidden,
              explanation: tc.explanation,
            }))
          : DEFAULT_TEST_CASES
      );
      setEditorOpen(true);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load challenge for editing.');
    }
  };

  const handleSaveChallenge = async (e: React.FormEvent, submitImmediately = false) => {
    e.preventDefault();
    setSavingChallenge(true);
    try {
      const langs = formLanguages
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const primaryLang = langs[0] || 'javascript';

      const payload: any = {
        title: formTitle,
        difficulty: formDifficulty,
        category: formCategory,
        framework: formFramework,
        investigation_time_minutes: formTime,
        description: formDescription,
        bug_report: {
          issue_title: formTitle,
          symptoms: formSymptoms,
          expected_behavior: formExpected,
          actual_behavior: formActual,
          reproduction_steps: formRepro
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        starter_code: { [primaryLang]: formStarter },
        supported_languages: langs.length > 0 ? langs : ['javascript'],
        topics: formTopics
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        hints: formHints
          .split('\n')
          .map((h) => h.trim())
          .filter(Boolean),
        test_cases: formTestCases,
      };

      if (editingChallenge) {
        if (formChangeSummary.trim()) {
          payload.change_summary = formChangeSummary.trim();
        }
        const res = await api.educator.updateChallenge(editingChallenge.id, payload);
        showNotice('success', res.message);
      } else {
        payload.submit_for_review = submitImmediately;
        const res = await api.educator.createChallenge(payload);
        showNotice('success', res.message);
      }

      setEditorOpen(false);
      await loadChallenges();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save challenge.');
    } finally {
      setSavingChallenge(false);
    }
  };

  const handleValidate = async (id: number) => {
    setValidatingId(id);
    try {
      const res = await api.educator.validateChallenge(id);
      showNotice(res.valid ? 'success' : 'error', res.summary);
      await loadChallenges();
    } catch (err: any) {
      showNotice('error', err.message || 'Validation failed.');
    } finally {
      setValidatingId(null);
    }
  };

  const handleSubmitForReview = async (id: number) => {
    try {
      const res = await api.educator.submitForReview(id);
      showNotice('success', res.message);
      await loadChallenges();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not submit for review.');
    }
  };

  const handleUpdateFeedback = async (item: ChallengeFeedbackItem, status: string) => {
    try {
      const linkedVer = triageVersions[item.id] ? Number(triageVersions[item.id]) : undefined;
      const res = await api.educator.updateFeedback(item.id, {
        status,
        resolution_note: triageNotes[item.id] ?? item.resolution_note ?? undefined,
        linked_challenge_version: linkedVer,
      });
      showNotice('success', res.message);
      await loadFeedback();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not update feedback status.');
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.educator.createClassroom({
        name: newClassName,
        description: newClassDesc || undefined,
      });
      showNotice('success', res.message);
      setNewClassName('');
      setNewClassDesc('');
      await loadClassrooms();
      setSelectedClassroomId(res.classroom.id);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not create classroom.');
    }
  };

  const handleEnrollLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId) return;
    try {
      const res = await api.educator.addLearner(selectedClassroomId, enrollEmail);
      showNotice('success', res.message);
      setEnrollEmail('');
      await loadClassroomProgress(selectedClassroomId);
      await loadClassrooms();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not enroll learner.');
    }
  };

  const handleAssignChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId || !assignChallengeId) return;
    try {
      const res = await api.educator.assignChallenge(selectedClassroomId, {
        challenge_id: Number(assignChallengeId),
        due_at: assignDueAt || undefined,
        note: assignNote || undefined,
      });
      showNotice('success', res.message);
      setAssignChallengeId('');
      setAssignNote('');
      setAssignDueAt('');
      await loadClassroomProgress(selectedClassroomId);
      await loadClassrooms();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not assign challenge.');
    }
  };

  const navItems: DashboardNavItem[] = [
    { id: 'overview', label: 'Overview', section: 'Teaching', icon: LayoutDashboard },
    { id: 'challenges', label: 'Challenge Studio', section: 'Content', icon: FileCode2, badge: overview?.summary?.changes_requested },
    { id: 'feedback', label: 'Feedback Inbox', section: 'Content', icon: MessageSquareWarning, badge: overview?.summary?.open_feedback },
    { id: 'classrooms', label: 'Classrooms & Learners', section: 'Cohorts', icon: Users, badge: overview?.summary?.classrooms_count },
  ];

  const tabMeta: Record<EducatorTab, { title: string; description: string }> = {
    overview: { title: 'Educator Overview', description: 'Track your authored challenges, pending reviews, open reports, and classroom cohorts.' },
    challenges: { title: 'Challenge Studio', description: 'Create drafts, run automated validation, and submit quests for moderation review.' },
    feedback: { title: 'Feedback Inbox', description: 'Triage and resolve learner bug reports, unclear specs, and test issues.' },
    classrooms: { title: 'Classrooms & Learners', description: 'Organize learner cohorts, assign practice quests, and review scoped progress.' },
  };

  const workflowFooter = (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-[11px] text-slate-400 space-y-1">
      <p className="font-semibold text-slate-200">Review Workflow</p>
      <p className="leading-relaxed">
        Draft → Validate → Submit for review → Admin approval & publish.
      </p>
    </div>
  );

  return (
    <DashboardShell
      portalTitle="Educator Portal"
      portalSubtitle="Educator Portal"
      accent="teal"
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={(id) => {
        setActiveTab(id as EducatorTab);
        setEditorOpen(false);
      }}
      pageTitle={tabMeta[activeTab].title}
      pageDescription={tabMeta[activeTab].description}
      sidebarFooter={workflowFooter}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setByobOpen(true)}
            className="hidden sm:flex px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold items-center gap-1.5 cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            Import GitHub
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('challenges');
              openCreateEditor();
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Draft</span>
          </button>
        </div>
      }
    >
      {notice && (
        <div
          className={`mb-5 px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {loadingOverview ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  Loading educator workspace...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Drafts', value: overview?.summary?.drafts ?? 0, accent: 'text-slate-900' },
                      { label: 'Pending review', value: overview?.summary?.pending_review ?? 0, accent: 'text-amber-700' },
                      { label: 'Published', value: overview?.summary?.published ?? 0, accent: 'text-blue-700' },
                      { label: 'Open reports', value: overview?.summary?.open_feedback ?? 0, accent: 'text-rose-700' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
                        <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                        <p className={`text-2xl font-extrabold mt-1 ${stat.accent}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {overview?.summary?.changes_requested > 0 && (
                    <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-rose-900">
                            {overview.summary.changes_requested} challenge(s) have requested changes from review
                          </p>
                          <p className="text-[11px] text-rose-700">
                            Review the moderator notes, update your draft, and resubmit.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setReviewFilter('changes_requested');
                          setActiveTab('challenges');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shrink-0"
                      >
                        Review notes
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900">Assigned classrooms</h2>
                        <button
                          onClick={() => setActiveTab('classrooms')}
                          className="text-xs font-semibold text-teal-700 hover:underline"
                        >
                          Manage classes
                        </button>
                      </div>
                      {(overview?.classrooms || []).length === 0 ? (
                        <p className="text-xs text-slate-500 py-4">
                          No classrooms created yet. Create one to organize learners and assign practice.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {overview.classrooms.map((c: ClassroomItem) => (
                            <div
                              key={c.id}
                              className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-900">{c.name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">{c.code}</p>
                              </div>
                              <div className="text-right text-[11px] text-slate-600">
                                <span className="font-semibold">{c.learners_count ?? 0}</span> learners ·{' '}
                                <span className="font-semibold">{c.assignments_count ?? 0}</span> tasks
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                      <h2 className="text-sm font-bold text-slate-900">Recent updates</h2>
                      {(overview?.notifications || []).length === 0 ? (
                        <p className="text-xs text-slate-500 py-4">
                          Review decisions and new learner reports will appear here.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {overview.notifications.map((n: PanelNotificationItem) => (
                            <div key={n.id} className="py-2.5 first:pt-0 last:pb-0">
                              <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: CHALLENGE STUDIO */}
          {activeTab === 'challenges' && (
            <div className="space-y-5">
              {editorOpen ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <button
                        onClick={() => setEditorOpen(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to challenges
                      </button>
                      <h2 className="text-lg font-bold text-slate-900">
                        {editingChallenge ? `Edit: ${editingChallenge.title} (v${editingChallenge.version})` : 'New challenge draft'}
                      </h2>
                    </div>
                    {editingChallenge && (
                      <div className="flex items-center gap-2">
                        <ReviewStatusBadge status={editingChallenge.review_status} />
                        <AvailabilityStatusBadge status={editingChallenge.availability_status} />
                      </div>
                    )}
                  </div>

                  {editingChallenge?.review_notes && editingChallenge.review_status === 'changes_requested' && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <span className="font-bold">Reviewer feedback:</span> {editingChallenge.review_notes}
                    </div>
                  )}

                  {editingChallenge &&
                    (editingChallenge.review_status === 'approved' || editingChallenge.availability_status === 'published') && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        Saving changes to a published or approved challenge creates version{' '}
                        <span className="font-bold">v{editingChallenge.version + 1}</span> and routes it for admin re-review.
                      </div>
                    )}

                  <form onSubmit={(e) => handleSaveChallenge(e, false)} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Title</label>
                        <input
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Webhook Signature Replay Window Off-by-One"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                        <select
                          value={formDifficulty}
                          onChange={(e) => setFormDifficulty(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        >
                          <option value="logic_state">Logic & State</option>
                          <option value="boundary_off_by_one">Boundary & Off-By-One</option>
                          <option value="auth_security">Auth & Security</option>
                          <option value="data_parsing">Data Parsing</option>
                          <option value="concurrency_race">Concurrency & Race</option>
                          <option value="api_integration">API Integration</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Framework</label>
                        <input
                          value={formFramework}
                          onChange={(e) => setFormFramework(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Est. minutes</label>
                        <input
                          type="number"
                          min={5}
                          max={180}
                          value={formTime}
                          onChange={(e) => setFormTime(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Supported languages (comma separated)</label>
                        <input
                          value={formLanguages}
                          onChange={(e) => setFormLanguages(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Topic tags (comma separated)</label>
                        <input
                          value={formTopics}
                          onChange={(e) => setFormTopics(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Problem overview</label>
                      <textarea
                        required
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <h3 className="font-bold text-slate-800">Bug ticket details</h3>
                      <textarea
                        rows={2}
                        value={formSymptoms}
                        onChange={(e) => setFormSymptoms(e.target.value)}
                        placeholder="Observable symptoms..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-none"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <textarea
                          rows={2}
                          value={formExpected}
                          onChange={(e) => setFormExpected(e.target.value)}
                          placeholder="Expected behavior..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          value={formActual}
                          onChange={(e) => setFormActual(e.target.value)}
                          placeholder="Actual buggy behavior..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={formRepro}
                        onChange={(e) => setFormRepro(e.target.value)}
                        placeholder="Reproduction steps (one per line)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono focus:border-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Starter code</label>
                        <textarea
                          rows={5}
                          value={formStarter}
                          onChange={(e) => setFormStarter(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Progressive hints (one per line)</label>
                        <textarea
                          rows={5}
                          value={formHints}
                          onChange={(e) => setFormHints(e.target.value)}
                          placeholder="Hint 1: Check unit conversions&#10;Hint 2: Compare seconds vs milliseconds"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Test cases */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Test cases</h3>
                        <button
                          type="button"
                          onClick={() =>
                            setFormTestCases([...formTestCases, { input: '', expected_output: '', is_hidden: true }])
                          }
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add test case
                        </button>
                      </div>
                      {formTestCases.map((tc, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Case #{idx + 1}</span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={tc.is_hidden}
                                  onChange={(e) => {
                                    const next = [...formTestCases];
                                    next[idx].is_hidden = e.target.checked;
                                    setFormTestCases(next);
                                  }}
                                />
                                Hidden
                              </label>
                              {formTestCases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setFormTestCases(formTestCases.filter((_, i) => i !== idx))}
                                  className="text-rose-600 hover:text-rose-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={tc.input}
                              onChange={(e) => {
                                const next = [...formTestCases];
                                next[idx].input = e.target.value;
                                setFormTestCases(next);
                              }}
                              placeholder="Input"
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                            />
                            <input
                              value={tc.expected_output}
                              onChange={(e) => {
                                const next = [...formTestCases];
                                next[idx].expected_output = e.target.value;
                                setFormTestCases(next);
                              }}
                              placeholder="Expected output"
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {editingChallenge && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Change summary (recorded in version history)</label>
                        <input
                          value={formChangeSummary}
                          onChange={(e) => setFormChangeSummary(e.target.value)}
                          placeholder="e.g. Clarified edge case inputs and fixed broken test 2"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={savingChallenge}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-60"
                      >
                        {savingChallenge ? 'Saving...' : editingChallenge ? 'Save changes' : 'Save draft'}
                      </button>
                      {!editingChallenge && (
                        <button
                          type="button"
                          disabled={savingChallenge}
                          onClick={(e) => handleSaveChallenge(e as any, true)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Save & submit for review
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditorOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Filter bar */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={challengeSearch}
                        onChange={(e) => setChallengeSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadChallenges()}
                        placeholder="Search your challenges..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={reviewFilter}
                        onChange={(e) => setReviewFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
                      >
                        <option value="all">All review states</option>
                        <option value="draft">Draft</option>
                        <option value="pending_review">Pending review</option>
                        <option value="changes_requested">Changes requested</option>
                        <option value="approved">Approved</option>
                      </select>
                      <button
                        onClick={loadChallenges}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        Filter
                      </button>
                    </div>
                  </div>

                  {/* Challenge list */}
                  <div className="space-y-3">
                    {loadingChallenges ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                        Loading your challenges...
                      </div>
                    ) : challenges.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-900">No challenges match this view</p>
                        <p className="text-xs text-slate-500">Create a new draft or import a sanitized GitHub issue.</p>
                        <button
                          onClick={openCreateEditor}
                          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
                        >
                          Create first draft
                        </button>
                      </div>
                    ) : (
                      challenges.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                                  v{c.version || 1}
                                </span>
                                <ReviewStatusBadge status={c.review_status} />
                                <AvailabilityStatusBadge status={c.availability_status} />
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {c.difficulty} · {c.category || 'general'} · {c.framework || 'Node.js'} ·{' '}
                                {c.test_cases_count ?? 0} test cases · {c.open_feedback_count ?? 0} open reports
                              </p>
                              {c.last_validated_at && (
                                <p
                                  className={`text-[11px] font-medium ${
                                    c.last_validation_passed ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  Validation: {c.last_validation_passed ? 'Passed' : 'Needs fixes'}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                onClick={() => openEditEditor(c.id)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleValidate(c.id)}
                                disabled={validatingId === c.id}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                              >
                                <Cpu className="w-3.5 h-3.5" />
                                {validatingId === c.id ? 'Validating...' : 'Validate'}
                              </button>
                              {(c.review_status === 'draft' || c.review_status === 'changes_requested') && (
                                <button
                                  onClick={() => handleSubmitForReview(c.id)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Submit for review
                                </button>
                              )}
                              {c.availability_status === 'published' && (
                                <Link
                                  to={`/challenge/${c.slug}`}
                                  className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View
                                </Link>
                              )}
                            </div>
                          </div>

                          {c.review_notes && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                              <span className="font-bold text-slate-900">Review note:</span> {c.review_notes}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: FEEDBACK INBOX */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Learner feedback & issue inbox</h2>
                  <p className="text-xs text-slate-500">Triage reported bugs, unclear descriptions, or broken tests on your challenges.</p>
                </div>
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {loadingFeedback ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Loading feedback reports...
                </div>
              ) : feedbackList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No learner feedback reports in this view.
                </div>
              ) : (
                feedbackList.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                          <FeedbackStatusBadge status={item.status} />
                          <SeverityBadge severity={item.severity} />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Challenge: <span className="font-semibold text-slate-700">{item.challenge?.title}</span> · Reported by{' '}
                          {item.reporter?.name || 'Learner'} · {item.category.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                      <input
                        value={triageNotes[item.id] ?? item.resolution_note ?? ''}
                        onChange={(e) => setTriageNotes({ ...triageNotes, [item.id]: e.target.value })}
                        placeholder="Resolution note or reply to learner..."
                        className="sm:col-span-6 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={triageVersions[item.id] ?? (item.linked_challenge_version ? String(item.linked_challenge_version) : '')}
                        onChange={(e) => setTriageVersions({ ...triageVersions, [item.id]: e.target.value })}
                        placeholder="Fixed in v#"
                        className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
                      />
                      <div className="sm:col-span-4 flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleUpdateFeedback(item, 'in_progress')}
                          className="px-2.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100"
                        >
                          In progress
                        </button>
                        <button
                          onClick={() => handleUpdateFeedback(item, 'resolved')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CLASSROOMS & LEARNER SUPPORT */}
          {activeTab === 'classrooms' && (
            <div className="space-y-6">
              {/* Create classroom */}
              <form
                onSubmit={handleCreateClassroom}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New classroom name</label>
                  <input
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. CS 302 Debugging Cohort"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description (optional)</label>
                  <input
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    placeholder="Focus topics or semester..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create classroom
                  </button>
                </div>
              </form>

              {loadingClassrooms ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Loading classrooms...
                </div>
              ) : classrooms.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  Create your first classroom above to enroll learners and assign practice challenges.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Class selector */}
                  <div className="md:col-span-4 space-y-2">
                    {classrooms.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClassroomId(c.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          selectedClassroomId === c.id
                            ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {c.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {c.learners_count ?? 0} learners · {c.assignments_count ?? 0} assignments
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected classroom detail */}
                  <div className="md:col-span-8 space-y-5">
                    {classroomProgress && (
                      <>
                        {/* Enroll & Assign Forms */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{classroomProgress.classroom.name}</h3>
                              <p className="text-[11px] text-slate-500">{classroomProgress.privacy_notice}</p>
                            </div>
                          </div>

                          <form onSubmit={handleEnrollLearner} className="flex gap-2">
                            <input
                              type="email"
                              required
                              value={enrollEmail}
                              onChange={(e) => setEnrollEmail(e.target.value)}
                              placeholder="Enroll learner by email (e.g. learner@bugquest.ai)"
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Enroll
                            </button>
                          </form>

                          <form onSubmit={handleAssignChallenge} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-100">
                            <select
                              required
                              value={assignChallengeId}
                              onChange={(e) => setAssignChallengeId(e.target.value)}
                              className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            >
                              <option value="">Select published challenge to assign...</option>
                              {publishedCatalog.map((ch) => (
                                <option key={ch.id} value={ch.id}>
                                  {ch.title} ({ch.difficulty})
                                </option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={assignDueAt}
                              onChange={(e) => setAssignDueAt(e.target.value)}
                              className="sm:col-span-3 px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            />
                            <input
                              value={assignNote}
                              onChange={(e) => setAssignNote(e.target.value)}
                              placeholder="Optional note..."
                              className="sm:col-span-2 px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            />
                            <button
                              type="submit"
                              className="sm:col-span-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                            >
                              Assign
                            </button>
                          </form>

                          {classroomProgress.assignments.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <p className="text-[11px] font-bold text-slate-700">Assigned practice</p>
                              <div className="flex flex-wrap gap-2">
                                {classroomProgress.assignments.map((a) => (
                                  <span
                                    key={a.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-800"
                                  >
                                    {a.challenge?.title}
                                    {a.due_at && (
                                      <span className="text-blue-600 flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(a.due_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Scoped Learner Progress Table */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900">Scoped learner progress</h4>
                          </div>
                          {classroomProgress.learners.length === 0 ? (
                            <p className="p-6 text-center text-xs text-slate-500">
                              No learners enrolled in this classroom yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                  <tr>
                                    <th className="px-4 py-2.5 font-semibold">Learner</th>
                                    <th className="px-4 py-2.5 font-semibold">Assigned</th>
                                    <th className="px-4 py-2.5 font-semibold">Solved</th>
                                    <th className="px-4 py-2.5 font-semibold">Skill avg</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {classroomProgress.learners.map((l) => (
                                    <tr key={l.id}>
                                      <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-900">{l.name}</p>
                                        <p className="text-[11px] text-slate-500">{l.email}</p>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                              className="h-full bg-teal-600 rounded-full"
                                              style={{ width: `${l.completion_rate}%` }}
                                            />
                                          </div>
                                          <span className="text-[11px] font-semibold text-slate-700">
                                            {l.assigned_completed}/{l.assigned_total}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 font-semibold text-slate-700">{l.challenges_solved}</td>
                                      <td className="px-4 py-3 font-semibold text-blue-700">{l.avg_skill_score}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      <ByobImportModal
        isOpen={byobOpen}
        onClose={() => setByobOpen(false)}
        onImported={() => {
          setByobOpen(false);
          setActiveTab('challenges');
          loadChallenges();
          loadOverview();
          showNotice('success', 'Imported GitHub issue as a draft challenge.');
        }}
      />
    </DashboardShell>
  );
};
