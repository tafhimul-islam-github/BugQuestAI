import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  api,
  AuditLogItem,
  ChallengeFeedbackItem,
  ManagedChallenge,
  PlatformSettingItem,
  User,
} from '../api/client';
import {
  AvailabilityStatusBadge,
  FeedbackStatusBadge,
  ReviewStatusBadge,
  SeverityBadge,
} from '../components/PanelBadges';
import { DashboardShell, DashboardNavItem } from '../components/DashboardShell';
import { AdminChallengePage } from './AdminChallengePage';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  MessageSquareWarning,
  BarChart3,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Search,
  Activity,
  History,
  Archive,
  Ban,
  RotateCcw,
  Globe,
  X,
  Plus,
  Check,
  FileWarning,
  FileCode2,
} from 'lucide-react';

type AdminTab = 'overview' | 'moderation' | 'authoring' | 'users' | 'feedback' | 'analytics' | 'settings';

const resolveAdminTabFromPath = (pathname: string): AdminTab => {
  if (pathname.startsWith('/admin/challenges')) return 'authoring';
  if (pathname.startsWith('/admin/moderation')) return 'moderation';
  if (pathname.startsWith('/admin/users')) return 'users';
  if (pathname.startsWith('/admin/feedback')) return 'feedback';
  if (pathname.startsWith('/admin/analytics')) return 'analytics';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'overview';
};

export const AdminPanelPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => resolveAdminTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(resolveAdminTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    const pathMap: Record<AdminTab, string> = {
      overview: '/admin',
      moderation: '/admin/moderation',
      authoring: '/admin/challenges',
      users: '/admin/users',
      feedback: '/admin/feedback',
      analytics: '/admin/analytics',
      settings: '/admin/settings',
    };
    if (location.pathname !== pathMap[tab]) {
      navigate(pathMap[tab]);
    }
  };
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Moderation
  const [challenges, setChallenges] = useState<ManagedChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [modSearch, setModSearch] = useState('');
  const [modReviewFilter, setModReviewFilter] = useState('all');
  const [modAvailFilter, setModAvailFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [changeReqTarget, setChangeReqTarget] = useState<ManagedChallenge | null>(null);
  const [changeReqNotes, setChangeReqNotes] = useState('');

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [historyModal, setHistoryModal] = useState<{ user: User; audit_events: AuditLogItem[]; recent_submissions: any[] } | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Feedback
  const [feedbackList, setFeedbackList] = useState<ChallengeFeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');
  const [feedbackNotes, setFeedbackNotes] = useState<Record<number, string>>({});

  // Analytics & Audit
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Settings
  const [settings, setSettings] = useState<PlatformSettingItem[]>([]);
  const [draftSettings, setDraftSettings] = useState<Record<string, any>>({});
  const [newChipInputs, setNewChipInputs] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const SETTING_META: Record<string, { title: string; group: string; placeholder?: string }> = {
    feature_ai_coach_enabled: { title: 'AI Debugging Coach', group: 'Platform Features' },
    feature_byob_import_enabled: { title: 'GitHub Issue Import (BYOB)', group: 'Platform Features' },
    feature_live_interviews_enabled: { title: 'Live Pair-Debugging Interviews', group: 'Platform Features' },
    feature_educator_registration_enabled: { title: 'Direct Educator Registration', group: 'Platform Features' },
    require_validation_before_review: { title: 'Require Validation Before Review', group: 'Review & Moderation Policy' },
    supported_languages: { title: 'Supported Programming Languages', group: 'Languages & Curriculum', placeholder: 'Add language (e.g. Go, Rust)...' },
    challenge_categories: { title: 'Challenge Defect Categories', group: 'Languages & Curriculum', placeholder: 'Add category (e.g. Memory Leaks)...' },
  };

  const CATEGORY_DISPLAY: Record<string, string> = {
    logic_state: 'Logic & State',
    boundary_off_by_one: 'Boundary & Off-By-One',
    auth_security: 'Authentication & Security',
    data_parsing: 'Data Validation & Parsing',
    concurrency_race: 'Concurrency & Race Conditions',
    api_integration: 'API & HTTP Integration',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
  };

  const formatHumanLabel = (raw: string): string => {
    if (CATEGORY_DISPLAY[raw]) return CATEGORY_DISPLAY[raw];
    return raw
      .replace(/^feature_/, '')
      .replace(/_enabled$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleAddChip = (key: string) => {
    const raw = (newChipInputs[key] || '').trim();
    if (!raw) return;
    const normalized = raw.toLowerCase().replace(/\s+/g, '_');
    const current: string[] = Array.isArray(draftSettings[key]) ? draftSettings[key] : [];
    if (!current.includes(normalized)) {
      setDraftSettings({ ...draftSettings, [key]: [...current, normalized] });
    }
    setNewChipInputs({ ...newChipInputs, [key]: '' });
  };

  const handleRemoveChip = (key: string, item: string) => {
    const current: string[] = Array.isArray(draftSettings[key]) ? draftSettings[key] : [];
    setDraftSettings({ ...draftSettings, [key]: current.filter((v) => v !== item) });
  };

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await api.admin.overview();
      setOverview(res);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load admin overview.');
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await api.admin.listChallenges({
        review_status: modReviewFilter !== 'all' ? modReviewFilter : undefined,
        availability_status: modAvailFilter !== 'all' ? modAvailFilter : undefined,
        search: modSearch || undefined,
      });
      setChallenges(res.challenges);
      setSelectedIds([]);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load challenges.');
    } finally {
      setLoadingChallenges(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.admin.listUsers({
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        status: userStatusFilter !== 'all' ? userStatusFilter : undefined,
        search: userSearch || undefined,
      });
      setUsers(res.data);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await api.admin.listFeedback({
        status: feedbackStatusFilter !== 'all' ? feedbackStatusFilter : undefined,
      });
      setFeedbackList(res.feedback);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load feedback.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const loadAnalyticsAndAudit = async () => {
    setLoadingAnalytics(true);
    try {
      const [anRes, auRes] = await Promise.all([
        api.admin.analytics(),
        api.admin.auditLogs({
          action: auditActionFilter !== 'all' ? auditActionFilter : undefined,
          search: auditSearch || undefined,
        }),
      ]);
      setAnalytics(anRes);
      setAuditLogs(auRes.data);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load analytics and audit logs.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.admin.getSettings();
      setSettings(res.settings);
      const map: Record<string, any> = {};
      res.settings.forEach((s) => {
        map[s.key] = s.value;
      });
      setDraftSettings(map);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load platform settings.');
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') loadChallenges();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'feedback') loadFeedback();
    if (activeTab === 'analytics') loadAnalyticsAndAudit();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'moderation') loadChallenges();
  }, [modReviewFilter, modAvailFilter]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [userRoleFilter, userStatusFilter]);

  useEffect(() => {
    if (activeTab === 'feedback') loadFeedback();
  }, [feedbackStatusFilter]);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalyticsAndAudit();
  }, [auditActionFilter]);

  // Challenge Moderation Handlers
  const handleModerate = async (
    id: number,
    action: 'approve' | 'publish' | 'disable' | 'archive' | 'restore'
  ) => {
    try {
      let res: any;
      if (action === 'approve') res = await api.admin.approveChallenge(id);
      if (action === 'publish') res = await api.admin.publishChallenge(id);
      if (action === 'disable') res = await api.admin.disableChallenge(id);
      if (action === 'archive') res = await api.admin.archiveChallenge(id);
      if (action === 'restore') res = await api.admin.restoreChallenge(id);
      showNotice('success', res.message);
      await loadChallenges();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Moderation action failed.');
    }
  };

  const handleSubmitRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReqTarget) return;
    try {
      const res = await api.admin.requestChanges(changeReqTarget.id, changeReqNotes);
      showNotice('success', res.message);
      setChangeReqTarget(null);
      setChangeReqNotes('');
      await loadChallenges();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not request changes.');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'publish' | 'disable' | 'archive' | 'restore') => {
    if (selectedIds.length === 0) return;
    try {
      const res = await api.admin.bulkChallenges(selectedIds, action);
      showNotice('success', res.message);
      await loadChallenges();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Bulk action failed.');
    }
  };

  // User Management Handlers
  const handleRoleChange = async (userId: number, role: 'learner' | 'educator' | 'admin') => {
    try {
      const res = await api.admin.updateUserRole(userId, role);
      showNotice('success', res.message);
      await loadUsers();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not update role.');
    }
  };

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendTarget) return;
    try {
      const res = await api.admin.updateUserStatus(suspendTarget.id, 'suspended', suspendReason || undefined);
      showNotice('success', res.message);
      setSuspendTarget(null);
      setSuspendReason('');
      await loadUsers();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not suspend user.');
    }
  };

  const handleReactivate = async (userId: number) => {
    try {
      const res = await api.admin.updateUserStatus(userId, 'active');
      showNotice('success', res.message);
      await loadUsers();
      await loadOverview();
    } catch (err: any) {
      showNotice('error', err.message || 'Could not reactivate user.');
    }
  };

  const handleViewHistory = async (userId: number) => {
    try {
      const res = await api.admin.userHistory(userId, 'Admin panel account history inspection');
      setHistoryModal(res);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load account history.');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.admin.updateSettings(draftSettings);
      setSettings(res.settings);
      showNotice('success', res.message);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const navItems: DashboardNavItem[] = [
    { id: 'overview', label: 'Overview', section: 'Governance', icon: LayoutDashboard },
    { id: 'moderation', label: 'Challenge Moderation', section: 'Content', icon: FileCheck2, badge: overview?.metrics?.pending_reviews_count },
    { id: 'authoring', label: 'Challenge Authoring', section: 'Content', icon: FileCode2 },
    { id: 'feedback', label: 'Feedback & Reports', section: 'Content', icon: MessageSquareWarning, badge: overview?.metrics?.unresolved_reports_count },
    { id: 'users', label: 'User Accounts', section: 'Directory', icon: Users },
    { id: 'analytics', label: 'Analytics & Audit Log', section: 'Operations', icon: BarChart3 },
    { id: 'settings', label: 'Platform Controls', section: 'Operations', icon: Settings2 },
  ];

  const tabMeta: Record<AdminTab, { title: string; description: string }> = {
    overview: { title: 'Platform Overview', description: 'Live governance metrics, operational health, and recent administrative activity.' },
    moderation: { title: 'Challenge Moderation', description: 'Review educator submissions, approve, publish, disable, archive, or run bulk actions.' },
    authoring: { title: 'Challenge Authoring', description: 'Create and validate new debugging quests directly inside the Admin Console.' },
    users: { title: 'User Accounts', description: 'Manage learner, educator, and admin accounts, role assignments, and suspensions.' },
    feedback: { title: 'Feedback & Reports', description: 'Oversee and resolve learner-reported challenge issues platform-wide.' },
    analytics: { title: 'Analytics & Audit Log', description: '14-day activity trends, difficulty pass rates, and searchable administrative audit history.' },
    settings: { title: 'Platform Controls', description: 'Safe, non-secret feature toggles, moderation policies, languages, and categories.' },
  };

  const maxDailySubs = Math.max(
    1,
    ...((analytics?.daily_activity || []).map((d: any) => d.submissions as number))
  );

  const operationalFooter = overview?.operational_status ? (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-2">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span>System Health</span>
      </div>
      {[
        { name: 'Database', state: overview.operational_status.database },
        { name: 'Code Judge', state: overview.operational_status.code_judge },
        { name: 'AI Service', state: overview.operational_status.ai_service },
      ].map((svc) => (
        <div key={svc.name} className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{svc.name}</span>
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                svc.state === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {svc.state === 'operational' ? 'Online' : 'Fallback'}
          </span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <DashboardShell
      portalTitle="Admin Console"
      portalSubtitle="Admin Console"
      accent="amber"
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={(id) => handleSelectTab(id as AdminTab)}
      pageTitle={tabMeta[activeTab].title}
      pageDescription={tabMeta[activeTab].description}
      sidebarFooter={operationalFooter}
      headerActions={
        <button
          type="button"
          onClick={() => handleSelectTab('authoring')}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Author Challenge</span>
        </button>
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
                  Loading platform metrics...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Learners', value: overview?.metrics?.learners_count ?? 0, sub: `${overview?.metrics?.suspended_users_count ?? 0} suspended` },
                      { label: 'Educators', value: overview?.metrics?.educators_count ?? 0, sub: `${overview?.metrics?.admins_count ?? 0} admins` },
                      { label: 'Published challenges', value: overview?.metrics?.active_challenges_count ?? 0, sub: `${overview?.metrics?.draft_challenges_count ?? 0} drafts` },
                      { label: 'Pending reviews', value: overview?.metrics?.pending_reviews_count ?? 0, sub: `${overview?.metrics?.changes_requested_count ?? 0} changes requested` },
                      { label: 'Unresolved reports', value: overview?.metrics?.unresolved_reports_count ?? 0, sub: `${overview?.metrics?.high_severity_reports_count ?? 0} high severity` },
                      { label: 'Pass rate', value: `${overview?.metrics?.acceptance_rate ?? 0}%`, sub: `${overview?.metrics?.total_submissions ?? 0} submissions` },
                    ].map((card) => (
                      <div key={card.label} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
                        <p className="text-xs font-medium text-slate-500">{card.label}</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Audit History */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900">Recent administrative activity</h2>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Search full audit log
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(overview?.recent_audit || []).length === 0 ? (
                        <p className="p-6 text-center text-xs text-slate-500">No audit events recorded yet.</p>
                      ) : (
                        overview.recent_audit.map((log: AuditLogItem) => (
                          <div key={log.id} className="px-5 py-3 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                                {log.action}
                              </span>
                              <span className="text-slate-800 font-medium">{log.summary}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {log.actor?.name || 'System'} · {new Date(log.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: CHALLENGE MODERATION */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={modSearch}
                    onChange={(e) => setModSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadChallenges()}
                    placeholder="Search challenges by title, category, or framework..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <select
                  value={modReviewFilter}
                  onChange={(e) => setModReviewFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                >
                  <option value="all">All review states</option>
                  <option value="pending_review">Pending review</option>
                  <option value="changes_requested">Changes requested</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={modAvailFilter}
                  onChange={(e) => setModAvailFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                >
                  <option value="all">All availability</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="disabled">Disabled</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={loadChallenges}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold"
                >
                  Apply
                </button>
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-semibold">{selectedIds.length} challenge(s) selected</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => handleBulkAction('approve')} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold">
                      Bulk approve
                    </button>
                    <button onClick={() => handleBulkAction('publish')} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold">
                      Bulk publish
                    </button>
                    <button onClick={() => handleBulkAction('disable')} className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 font-semibold">
                      Bulk disable
                    </button>
                    <button onClick={() => handleBulkAction('archive')} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold">
                      Bulk archive
                    </button>
                    <button onClick={() => handleBulkAction('restore')} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold">
                      Bulk restore
                    </button>
                  </div>
                </div>
              )}

              {loadingChallenges ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Loading moderation queue...
                </div>
              ) : challenges.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No challenges match these filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {challenges.map((c) => {
                    const checked = selectedIds.includes(c.id);
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setSelectedIds(
                                  e.target.checked
                                    ? [...selectedIds, c.id]
                                    : selectedIds.filter((id) => id !== c.id)
                                )
                              }
                              className="mt-1 rounded border-slate-300"
                            />
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
                                Author: <span className="font-semibold text-slate-700">{c.author?.name || 'Platform'}</span> ·{' '}
                                {c.difficulty} · {c.submissions_count ?? 0} submissions · {c.open_feedback_count ?? 0} open reports
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {c.review_status !== 'approved' && (
                              <button
                                onClick={() => handleModerate(c.id, 'approve')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            )}
                            {c.review_status === 'pending_review' && (
                              <button
                                onClick={() => {
                                  setChangeReqTarget(c);
                                  setChangeReqNotes('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
                              >
                                <FileWarning className="w-3.5 h-3.5" />
                                Request changes
                              </button>
                            )}
                            {c.review_status === 'approved' && c.availability_status !== 'published' && (
                              <button
                                onClick={() => handleModerate(c.id, 'publish')}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                Publish
                              </button>
                            )}
                            {c.availability_status === 'published' && (
                              <button
                                onClick={() => handleModerate(c.id, 'disable')}
                                className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 text-xs font-semibold flex items-center gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Disable
                              </button>
                            )}
                            {c.availability_status !== 'archived' && (
                              <button
                                onClick={() => handleModerate(c.id, 'archive')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                Archive
                              </button>
                            )}
                            {(c.availability_status === 'disabled' || c.availability_status === 'archived') && (
                              <button
                                onClick={() => handleModerate(c.id, 'restore')}
                                className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restore
                              </button>
                            )}
                          </div>
                        </div>

                        {c.review_notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            <span className="font-semibold text-slate-800">Review note:</span> {c.review_notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2B: CHALLENGE AUTHORING (EMBEDDED IN ADMIN CONSOLE) */}
          {activeTab === 'authoring' && <AdminChallengePage embedded />}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    placeholder="Search accounts by name or email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                >
                  <option value="all">All roles</option>
                  <option value="learner">Learner</option>
                  <option value="educator">Educator</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button
                  onClick={loadUsers}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold"
                >
                  Search
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
                {loadingUsers ? (
                  <p className="p-8 text-center text-xs text-slate-500">Loading accounts...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Account</th>
                          <th className="px-4 py-3 font-semibold">Role</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Activity</th>
                          <th className="px-4 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-500">{u.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
                              >
                                <option value="learner">learner</option>
                                <option value="educator">educator</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  u.status === 'suspended'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-slate-600">
                              {u.submissions_count ?? 0} subs · {u.authored_challenges_count ?? 0} authored
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleViewHistory(u.id)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1"
                                >
                                  <History className="w-3.5 h-3.5" />
                                  History
                                </button>
                                {u.status === 'suspended' ? (
                                  <button
                                    onClick={() => handleReactivate(u.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSuspendTarget(u);
                                      setSuspendReason('');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold"
                                  >
                                    Suspend
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FEEDBACK MODERATION */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Platform feedback & bug reports</h2>
                  <p className="text-xs text-slate-500">Oversee and resolve learner-reported challenge issues platform-wide.</p>
                </div>
                <select
                  value={feedbackStatusFilter}
                  onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
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
                  Loading reports...
                </div>
              ) : feedbackList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No reports found.
                </div>
              ) : (
                feedbackList.map((f) => (
                  <div key={f.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                        <FeedbackStatusBadge status={f.status} />
                        <SeverityBadge severity={f.severity} />
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {f.challenge?.title} · by {f.reporter?.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{f.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={feedbackNotes[f.id] ?? f.resolution_note ?? ''}
                        onChange={(e) => setFeedbackNotes({ ...feedbackNotes, [f.id]: e.target.value })}
                        placeholder="Resolution note..."
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                      />
                      <button
                        onClick={async () => {
                          const res = await api.admin.updateFeedback(f.id, {
                            status: 'resolved',
                            resolution_note: feedbackNotes[f.id] ?? f.resolution_note ?? undefined,
                          });
                          showNotice('success', res.message);
                          loadFeedback();
                          loadOverview();
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={async () => {
                          const res = await api.admin.updateFeedback(f.id, {
                            status: 'dismissed',
                            resolution_note: feedbackNotes[f.id] ?? f.resolution_note ?? undefined,
                          });
                          showNotice('success', res.message);
                          loadFeedback();
                          loadOverview();
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS & AUDIT LOG */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {loadingAnalytics ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Loading platform trends and audit history...
                </div>
              ) : (
                <>
                  {/* 14-day Activity Bar Visualization */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
                    <h2 className="text-sm font-bold text-slate-900">14-day submission & registration activity</h2>
                    <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 items-end h-32 pt-4">
                      {(analytics?.daily_activity || []).map((d: any) => {
                        const heightPct = Math.max(6, Math.round((d.submissions / maxDailySubs) * 100));
                        return (
                          <div key={d.date} className="flex flex-col items-center gap-1 h-full justify-end" title={`${d.date}: ${d.submissions} submissions, ${d.registrations} new users`}>
                            <div className="w-full bg-blue-100 rounded-t-md relative flex items-end overflow-hidden" style={{ height: `${heightPct}%` }}>
                              <div
                                className="w-full bg-blue-600 rounded-t-md"
                                style={{ height: d.submissions > 0 ? `${Math.round((d.accepted / d.submissions) * 100)}%` : '0%' }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">{d.date.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Light blue = total submissions, solid blue = accepted submissions. Hover bars for exact counts.
                    </p>
                  </div>

                  {/* Difficulty Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Pass rates by difficulty</h3>
                      <div className="space-y-2.5">
                        {(analytics?.difficulty_performance || []).map((row: any) => (
                          <div key={row.difficulty} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold capitalize text-slate-800">{row.difficulty}</span>
                              <span className="text-slate-600">
                                {row.pass_rate}% ({row.submissions} subs · {row.challenges} quests)
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.pass_rate}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Most reported challenges</h3>
                      {(analytics?.top_reported_challenges || []).length === 0 ? (
                        <p className="text-xs text-slate-500 py-4">No challenge issue reports recorded.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {analytics.top_reported_challenges.map((ch: any) => (
                            <div key={ch.id} className="py-2 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 truncate pr-3">{ch.title}</span>
                              <span className="text-[11px] font-semibold text-rose-700 shrink-0">
                                {ch.open_reports_count} open / {ch.total_reports_count} total
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Searchable Audit Log */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2.5">
                      <h3 className="text-sm font-bold text-slate-900 mr-auto">Audit log search</h3>
                      <input
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadAnalyticsAndAudit()}
                        placeholder="Search summary or action..."
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                      />
                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                      >
                        <option value="all">All actions</option>
                        <option value="challenge">Challenge actions</option>
                        <option value="user">User actions</option>
                        <option value="learner">Learner record access</option>
                        <option value="feedback">Feedback actions</option>
                        <option value="setting">Settings changes</option>
                      </select>
                      <button
                        onClick={loadAnalyticsAndAudit}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                      >
                        Search
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                            <th className="px-4 py-2.5 font-semibold">Actor</th>
                            <th className="px-4 py-2.5 font-semibold">Action</th>
                            <th className="px-4 py-2.5 font-semibold">Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="px-4 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                                {log.actor?.name || 'System'}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-blue-700 whitespace-nowrap">
                                {log.action}
                              </td>
                              <td className="px-4 py-2.5 text-slate-700">{log.summary}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 6: PLATFORM CONTROLS (SAFE SETTINGS) */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {(['Platform Features', 'Review & Moderation Policy', 'Languages & Curriculum'] as const).map((groupName) => {
                const groupItems = settings.filter(
                  (s) => (SETTING_META[s.key]?.group || 'Platform Features') === groupName
                );
                if (groupItems.length === 0) return null;

                return (
                  <div
                    key={groupName}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                      <h2 className="text-sm font-bold text-slate-900">{groupName}</h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {groupItems.map((setting) => {
                        const val = draftSettings[setting.key];
                        const isBool = typeof val === 'boolean';
                        const isList = Array.isArray(val);
                        const meta = SETTING_META[setting.key];
                        const displayTitle = meta?.title || formatHumanLabel(setting.key);

                        return (
                          <div
                            key={setting.key}
                            className="p-5 sm:px-6 flex flex-col gap-3.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1 max-w-2xl">
                                <p className="text-sm font-semibold text-slate-900">{displayTitle}</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{setting.description}</p>
                              </div>

                              {isBool && (
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={Boolean(val)}
                                  onClick={() =>
                                    setDraftSettings({ ...draftSettings, [setting.key]: !val })
                                  }
                                  className="inline-flex items-center gap-3 shrink-0 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                                >
                                  <span
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                      val ? 'bg-emerald-600' : 'bg-slate-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                        val ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </span>
                                  <span
                                    className={`text-xs font-semibold w-16 text-left ${
                                      val ? 'text-emerald-700' : 'text-slate-500'
                                    }`}
                                  >
                                    {val ? 'Enabled' : 'Disabled'}
                                  </span>
                                </button>
                              )}
                            </div>

                            {isList && (
                              <div className="space-y-3 pt-1">
                                <div className="flex flex-wrap gap-2">
                                  {(val as string[]).map((item) => (
                                    <span
                                      key={item}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                                    >
                                      <span>{formatHumanLabel(item)}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveChip(setting.key, item)}
                                        aria-label={`Remove ${formatHumanLabel(item)}`}
                                        className="p-0.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center gap-2 max-w-md">
                                  <input
                                    type="text"
                                    value={newChipInputs[setting.key] || ''}
                                    onChange={(e) =>
                                      setNewChipInputs({ ...newChipInputs, [setting.key]: e.target.value })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddChip(setting.key);
                                      }
                                    }}
                                    placeholder={meta?.placeholder || 'Add item...'}
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddChip(setting.key)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 px-6 py-4 shadow-card">
                <p className="text-xs text-slate-500">
                  All changes are recorded in the platform audit log. API keys and credentials are never exposed here.
                </p>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
                >
                  {savingSettings ? 'Saving changes...' : 'Save platform controls'}
                </button>
              </div>
            </form>
          )}
      </div>

      {/* Modal: Request Changes */}
      {changeReqTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitRequestChanges}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Request changes</h3>
              <button type="button" onClick={() => setChangeReqTarget(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-slate-600">
              Explain what the educator needs to fix on <span className="font-semibold text-slate-900">{changeReqTarget.title}</span>.
            </p>
            <textarea
              required
              minLength={5}
              rows={4}
              value={changeReqNotes}
              onChange={(e) => setChangeReqNotes(e.target.value)}
              placeholder="Provide clear, actionable review feedback..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChangeReqTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                Send change request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Suspend Account */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSuspendSubmit}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Suspend account</h3>
              <button type="button" onClick={() => setSuspendTarget(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-slate-600">
              Suspending <span className="font-semibold text-slate-900">{suspendTarget.email}</span> immediately revokes active sessions.
            </p>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension (recorded in audit log)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSuspendTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                Confirm suspension
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Account History */}
      {historyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Account history: {historyModal.user.name}</h3>
                <p className="text-[11px] text-slate-500">{historyModal.user.email} · Access logged for governance</p>
              </div>
              <button onClick={() => setHistoryModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Recent submissions (metadata only)</h4>
                {historyModal.recent_submissions.length === 0 ? (
                  <p className="text-slate-500">No submissions yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {historyModal.recent_submissions.map((s: any) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                        <span className="font-semibold text-slate-800">{s.challenge?.title || `Challenge #${s.challenge_id}`}</span>
                        <span className="text-slate-600">
                          {s.status} ({s.pass_count}/{s.total_count})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Audit trail</h4>
                {historyModal.audit_events.length === 0 ? (
                  <p className="text-slate-500">No audit events for this account.</p>
                ) : (
                  <div className="space-y-1.5">
                    {historyModal.audit_events.map((ev) => (
                      <div key={ev.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-mono text-[10px] text-blue-700 mr-2">{ev.action}</span>
                        <span className="text-slate-700">{ev.summary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};
