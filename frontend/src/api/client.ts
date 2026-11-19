export interface User {
  id: number;
  name: string;
  email: string;
  role: 'learner' | 'educator' | 'admin';
  status?: 'active' | 'suspended';
  suspended_at?: string | null;
  suspended_reason?: string | null;
  last_login_at?: string | null;
  target_role?: string;
  bio?: string;
  settings?: Record<string, any>;
  submissions_count?: number;
  authored_challenges_count?: number;
  created_at?: string;
}

export type ReviewStatus = 'draft' | 'pending_review' | 'changes_requested' | 'approved';
export type AvailabilityStatus = 'unpublished' | 'published' | 'disabled' | 'archived';

export interface ManagedChallenge extends Challenge {
  author_id?: number | null;
  author?: { id: number; name: string; email?: string } | null;
  reviewer?: { id: number; name: string } | null;
  review_status: ReviewStatus;
  availability_status: AvailabilityStatus;
  reviewed_at?: string | null;
  review_notes?: string | null;
  version: number;
  published_at?: string | null;
  last_validated_at?: string | null;
  last_validation_passed?: boolean | null;
  is_active: boolean;
  test_cases_count?: number;
  submissions_count?: number;
  open_feedback_count?: number;
  test_cases?: Array<{ id?: number; input: string; expected_output: string; is_hidden: boolean; explanation?: string }>;
  versions?: Array<{
    id: number;
    version_number: number;
    change_summary?: string | null;
    editor?: { id: number; name: string } | null;
    created_at: string;
  }>;
  updated_at?: string;
}

export interface ChallengeFeedbackItem {
  id: number;
  challenge_id: number;
  reporter_id: number;
  category: 'bug_report' | 'unclear_description' | 'broken_test' | 'hint_request' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  resolution_note?: string | null;
  linked_challenge_version?: number | null;
  resolved_at?: string | null;
  created_at: string;
  challenge?: { id: number; title: string; slug: string; version?: number };
  reporter?: { id: number; name: string };
  resolver?: { id: number; name: string } | null;
}

export interface ClassroomItem {
  id: number;
  educator_id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  learners_count?: number;
  assignments_count?: number;
  assignments?: Array<{
    id: number;
    challenge_id: number;
    due_at?: string | null;
    note?: string | null;
    challenge?: { id: number; title: string; slug: string; difficulty: string };
  }>;
  created_at: string;
}

export interface ClassroomProgressResponse {
  classroom: { id: number; name: string; code: string; description?: string | null };
  assignments: Array<{
    id: number;
    challenge_id: number;
    due_at?: string | null;
    note?: string | null;
    challenge?: { id: number; title: string; slug: string; difficulty: string };
  }>;
  learners: Array<{
    id: number;
    name: string;
    email: string;
    target_role?: string;
    status?: string;
    total_submissions: number;
    challenges_solved: number;
    assigned_completed: number;
    assigned_total: number;
    completion_rate: number;
    avg_skill_score: number;
    last_activity_at?: string | null;
  }>;
  privacy_notice: string;
}

export interface AuditLogItem {
  id: number;
  actor_id?: number | null;
  actor?: { id: number; name: string; email?: string; role: string } | null;
  action: string;
  target_type?: string | null;
  target_id?: number | null;
  summary: string;
  metadata?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface PlatformSettingItem {
  key: string;
  value: any;
  category: string;
  description?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface PanelNotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read_at?: string | null;
  created_at: string;
}

export interface TestCase {
  id: number;
  input: string;
  expected_output: string;
  explanation?: string;
}

export interface RepositoryFile {
  path: string;
  content: string;
  is_editable?: boolean;
  language?: string;
}

export interface BugReport {
  issue_title?: string;
  symptoms?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  reproduction_steps?: string[];
  environment?: string;
  scope_boundary?: string;
}

export interface Hypothesis {
  suspected_file?: string;
  root_cause?: string;
  proposed_fix?: string;
  status?: 'investigating' | 'confirmed' | 'rejected';
  confidence?: number;
}

export interface CommunitySubmission {
  id: number;
  user_name: string;
  user_role?: string;
  is_own?: boolean;
  status: 'queued' | 'running' | 'accepted' | 'wrong_answer' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'error';
  language: string;
  pass_count: number;
  total_count: number;
  execution_time_ms?: number;
  memory_kb?: number;
  created_at: string;
}

export interface Challenge {
  id: number;
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  framework?: string;
  investigation_time_minutes?: number;
  description: string;
  bug_report?: BugReport;
  repository_files?: RepositoryFile[];
  entrypoint_test?: string;
  has_repository?: boolean;
  file_count?: number;
  input_spec?: string;
  output_spec?: string;
  constraints?: string[];
  public_examples?: Array<{ input: string; output: string; explanation?: string }>;
  starter_code?: Record<string, string>;
  supported_languages?: string[];
  topics?: string[];
  telemetry_traces?: {
    trace_id: string;
    root_service: string;
    total_duration_ms: number;
    error_count: number;
    warning_count: number;
    spans: Array<{
      id: string;
      parent_id: string | null;
      service: string;
      name: string;
      start_time_offset_ms: number;
      duration_ms: number;
      status: 'ok' | 'error' | 'cancelled';
      http_status?: number;
      tags?: Record<string, any>;
      error_event?: {
        type: string;
        message: string;
        stack?: string;
      };
    }>;
  };
  time_limit_ms?: number;
  memory_limit_mb?: number;
  editorial?: string;
  public_test_cases?: TestCase[];
  is_solved?: boolean;
  user_submissions?: Submission[];
  community_submissions?: CommunitySubmission[];
}

export interface Submission {
  id: number;
  challenge_id: number;
  language: string;
  code: string;
  modified_files?: RepositoryFile[];
  patch_diff?: string;
  hypothesis?: Hypothesis;
  telemetry?: {
    keystrokes_count?: number;
    paste_events_count?: number;
    total_pasted_chars?: number;
    active_coding_ms?: number;
    focus_lost_count?: number;
    typing_cadence_cpm?: number;
    integrity_confidence_score?: number;
    integrity_flags?: string[];
    is_verified_organic?: boolean;
    recorded_at?: string;
  };
  chaos_results?: {
    status: 'RESILIENT' | 'VULNERABLE';
    resilience_score: number;
    total_mutations: number;
    passed_mutations: number;
    mutations: Array<{
      name: string;
      description: string;
      passed: boolean;
      duration_ms: number;
      status: string;
      detail: string;
    }>;
    executed_at: string;
    verdict: string;
  };
  status: 'queued' | 'running' | 'accepted' | 'wrong_answer' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'error';
  pass_count: number;
  total_count: number;
  execution_time_ms?: number;
  memory_kb?: number;
  error_output?: string;
  public_test_results?: Array<{
    test_case_id: number;
    input?: string;
    expected_output?: string;
    actual_output?: string;
    status: 'passed' | 'failed' | 'runtime_error' | 'time_limit_exceeded';
    error?: string;
    stack?: string;
    execution_time_ms?: number;
  }>;
  created_at: string;
  challenge?: { id: number; title: string; slug: string; difficulty: string; category?: string };
}

export interface AiHint {
  id: number;
  hint_level: 'nudge' | 'direction' | 'debugging_guidance' | 'detailed_explanation';
  summary: string;
  likely_issue?: string;
  explanation: string;
  next_steps: string[];
  concept_tags: string[];
  confidence: number;
  created_at: string;
}

export interface SkillItem {
  id: number;
  topic: string;
  score: number;
  proficiency_level: string;
  challenges_passed: number;
  challenges_attempted: number;
  total_submissions: number;
  last_assessed: string;
  diagnostic_history?: Array<{
    challenge_slug: string;
    result: string;
    pass_ratio: string;
  }>;
}

export interface SkillProfile {
  overall_score: number;
  overall_proficiency: string;
  challenges_solved: number;
  challenges_total: number;
  skills: SkillItem[];
}

export interface RecommendationItem {
  id: number;
  topic: string;
  reason: string;
  created_at: string;
  challenge: {
    id: number;
    title: string;
    slug: string;
    difficulty: string;
    category?: string;
  };
}

export interface ReadinessReport {
  id: number;
  report_uuid: string;
  generated_at: string;
  overall_readiness_score: number;
  readiness_level: string;
  summary: string;
  skill_breakdown: Array<{
    topic: string;
    score: number;
    proficiency_level: string;
    challenges_passed: number;
  }>;
  recommendations: Array<{
    topic: string;
    reason: string;
  }>;
}

export interface PublicSharedReport {
  report_uuid: string;
  candidate_name: string;
  target_role?: string;
  generated_at: string;
  overall_readiness_score: number;
  readiness_level: string;
  summary: string;
  skill_breakdown: Array<{
    topic: string;
    score: number;
    proficiency_level: string;
    challenges_passed: number;
  }>;
  sharing_settings: {
    allow_diagnostics: boolean;
    allow_code_samples: boolean;
    views_count: number;
  };
}

export interface PostMortem {
  id: number;
  user_id: number;
  challenge_id: number;
  submission_id: number;
  root_cause_analysis: string;
  preventative_measures: string;
  score: number;
  feedback?: {
    root_cause_score?: number;
    remediation_score?: number;
    communication_score?: number;
    summary?: string;
    strengths?: string[];
    recommendations?: string[];
  };
  ai_evaluation?: any;
  created_at: string;
}

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('bugquest_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { name: string; email: string; password: string; role?: string; target_role?: string }) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: User }>('/auth/me'),
    updateProfile: (data: Partial<User>) =>
      request<{ user: User; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
  },

  challenges: {
    list: (params?: { difficulty?: string; topic?: string; category?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.difficulty) q.set('difficulty', params.difficulty);
      if (params?.topic) q.set('topic', params.topic);
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      return request<{ challenges: Challenge[]; topics: string[]; categories?: string[]; total: number }>(`/challenges?${q.toString()}`);
    },
    get: (slugOrId: string | number) =>
      request<{ challenge: Challenge }>(`/challenges/${slugOrId}`),
    adminCreate: (data: any) =>
      request<{ message: string; challenge: Challenge }>('/admin/challenges', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    importGithub: (data: { repo_url: string; issue_description: string; framework?: string; difficulty?: string }) =>
      request<{ message: string; challenge: Challenge }>('/admin/challenges/import-github', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    validateChallenge: (id: number) =>
      request<{
        valid: boolean;
        defect_reproduced: boolean;
        unmodified_status: string;
        unmodified_error?: string;
        reference_fix_passes: boolean;
        patched_status: string;
        patched_pass_count?: number;
        patched_total_count?: number;
        summary: string;
      }>(`/admin/challenges/${id}/validate`, {
        method: 'POST',
      }),
    reportFeedback: (
      challengeId: number,
      data: { category: string; severity?: string; title: string; description: string }
    ) =>
      request<{ message: string; feedback: ChallengeFeedbackItem }>(`/challenges/${challengeId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    list: () => request<{ notifications: PanelNotificationItem[]; unread_count: number }>('/notifications'),
    markRead: (id: number) => request<{ message: string }>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request<{ message: string }>('/notifications/read-all', { method: 'POST' }),
  },

  educator: {
    overview: () =>
      request<{
        summary: {
          total_challenges: number;
          drafts: number;
          pending_review: number;
          changes_requested: number;
          approved: number;
          published: number;
          open_feedback: number;
          resolved_feedback: number;
          classrooms_count: number;
          assigned_learners_count: number;
        };
        classrooms: ClassroomItem[];
        notifications: PanelNotificationItem[];
      }>('/educator/overview'),
    listChallenges: (params?: { review_status?: string; availability_status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.review_status) q.set('review_status', params.review_status);
      if (params?.availability_status) q.set('availability_status', params.availability_status);
      if (params?.search) q.set('search', params.search);
      return request<{ challenges: ManagedChallenge[] }>(`/educator/challenges?${q.toString()}`);
    },
    getChallenge: (id: number) => request<{ challenge: ManagedChallenge }>(`/educator/challenges/${id}`),
    createChallenge: (data: any) =>
      request<{ message: string; challenge: ManagedChallenge }>('/educator/challenges', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateChallenge: (id: number, data: any) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/educator/challenges/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    validateChallenge: (id: number) =>
      request<{ valid: boolean; mode?: string; summary: string; defect_reproduced?: boolean; reference_fix_passes?: boolean }>(
        `/educator/challenges/${id}/validate`,
        { method: 'POST' }
      ),
    submitForReview: (id: number) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/educator/challenges/${id}/submit-review`, {
        method: 'POST',
      }),
    listFeedback: (params?: { status?: string; severity?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.severity) q.set('severity', params.severity);
      return request<{ feedback: ChallengeFeedbackItem[] }>(`/educator/feedback?${q.toString()}`);
    },
    updateFeedback: (id: number, data: { status: string; resolution_note?: string; linked_challenge_version?: number }) =>
      request<{ message: string; feedback: ChallengeFeedbackItem }>(`/educator/feedback/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    listClassrooms: () => request<{ classrooms: ClassroomItem[] }>('/educator/classrooms'),
    createClassroom: (data: { name: string; description?: string }) =>
      request<{ message: string; classroom: ClassroomItem }>('/educator/classrooms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addLearner: (classroomId: number, email: string) =>
      request<{ message: string }>(`/educator/classrooms/${classroomId}/learners`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    removeLearner: (classroomId: number, learnerId: number) =>
      request<{ message: string }>(`/educator/classrooms/${classroomId}/learners/${learnerId}`, {
        method: 'DELETE',
      }),
    assignChallenge: (classroomId: number, data: { challenge_id: number; due_at?: string; note?: string }) =>
      request<{ message: string }>(`/educator/classrooms/${classroomId}/assignments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    removeAssignment: (classroomId: number, assignmentId: number) =>
      request<{ message: string }>(`/educator/classrooms/${classroomId}/assignments/${assignmentId}`, {
        method: 'DELETE',
      }),
    classroomProgress: (classroomId: number) =>
      request<ClassroomProgressResponse>(`/educator/classrooms/${classroomId}/progress`),
  },

  admin: {
    overview: () =>
      request<{
        metrics: {
          learners_count: number;
          educators_count: number;
          admins_count: number;
          suspended_users_count: number;
          active_challenges_count: number;
          pending_reviews_count: number;
          changes_requested_count: number;
          draft_challenges_count: number;
          disabled_challenges_count: number;
          archived_challenges_count: number;
          unresolved_reports_count: number;
          high_severity_reports_count: number;
          total_submissions: number;
          acceptance_rate: number;
        };
        operational_status: {
          database: string;
          code_judge: string;
          ai_service: string;
          checked_at: string;
        };
        recent_audit: AuditLogItem[];
      }>('/admin/overview'),
    listUsers: (params?: { role?: string; status?: string; search?: string; page?: number }) => {
      const q = new URLSearchParams();
      if (params?.role) q.set('role', params.role);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      return request<{ data: User[]; current_page: number; last_page: number; total: number }>(`/admin/users?${q.toString()}`);
    },
    updateUserRole: (id: number, role: 'learner' | 'educator' | 'admin') =>
      request<{ message: string; user: User }>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    updateUserStatus: (id: number, status: 'active' | 'suspended', reason?: string) =>
      request<{ message: string; user: User }>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    userHistory: (id: number, reason?: string) => {
      const q = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      return request<{ user: User; audit_events: AuditLogItem[]; recent_submissions: any[] }>(`/admin/users/${id}/history${q}`);
    },
    listChallenges: (params?: { review_status?: string; availability_status?: string; difficulty?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.review_status) q.set('review_status', params.review_status);
      if (params?.availability_status) q.set('availability_status', params.availability_status);
      if (params?.difficulty) q.set('difficulty', params.difficulty);
      if (params?.search) q.set('search', params.search);
      return request<{ challenges: ManagedChallenge[] }>(`/admin/challenges?${q.toString()}`);
    },
    approveChallenge: (id: number, review_notes?: string) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/admin/challenges/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ review_notes }),
      }),
    requestChanges: (id: number, review_notes: string) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/admin/challenges/${id}/request-changes`, {
        method: 'POST',
        body: JSON.stringify({ review_notes }),
      }),
    publishChallenge: (id: number) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/admin/challenges/${id}/publish`, { method: 'POST' }),
    disableChallenge: (id: number, reason?: string) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/admin/challenges/${id}/disable`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    archiveChallenge: (id: number) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/admin/challenges/${id}/archive`, { method: 'POST' }),
    restoreChallenge: (id: number, publish?: boolean) =>
      request<{ message: string; challenge: ManagedChallenge }>(`/admin/challenges/${id}/restore`, {
        method: 'POST',
        body: JSON.stringify({ publish: Boolean(publish) }),
      }),
    bulkChallenges: (challenge_ids: number[], action: 'approve' | 'publish' | 'disable' | 'archive' | 'restore') =>
      request<{ message: string; updated_count: number; skipped_ids: number[] }>('/admin/challenges/bulk', {
        method: 'POST',
        body: JSON.stringify({ challenge_ids, action }),
      }),
    listFeedback: (params?: { status?: string; severity?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.severity) q.set('severity', params.severity);
      return request<{ feedback: ChallengeFeedbackItem[] }>(`/admin/feedback?${q.toString()}`);
    },
    updateFeedback: (id: number, data: { status: string; resolution_note?: string }) =>
      request<{ message: string; feedback: ChallengeFeedbackItem }>(`/admin/feedback/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    analytics: () =>
      request<{
        daily_activity: Array<{ date: string; submissions: number; accepted: number; registrations: number }>;
        difficulty_performance: Array<{ difficulty: string; challenges: number; submissions: number; pass_rate: number }>;
        top_reported_challenges: Array<{ id: number; title: string; slug: string; availability_status: string; open_reports_count: number; total_reports_count: number }>;
      }>('/admin/analytics'),
    auditLogs: (params?: { action?: string; target_type?: string; search?: string; date_from?: string; date_to?: string; page?: number }) => {
      const q = new URLSearchParams();
      if (params?.action) q.set('action', params.action);
      if (params?.target_type) q.set('target_type', params.target_type);
      if (params?.search) q.set('search', params.search);
      if (params?.date_from) q.set('date_from', params.date_from);
      if (params?.date_to) q.set('date_to', params.date_to);
      if (params?.page) q.set('page', String(params.page));
      return request<{ data: AuditLogItem[]; current_page: number; last_page: number; total: number }>(`/admin/audit-logs?${q.toString()}`);
    },
    getSettings: () => request<{ settings: PlatformSettingItem[] }>('/admin/settings'),
    updateSettings: (settings: Record<string, any>) =>
      request<{ message: string; changed_keys: string[]; settings: PlatformSettingItem[] }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      }),
  },

  submissions: {
    create: (data: {
      challenge_id: number;
      language: string;
      code?: string;
      modified_files?: RepositoryFile[];
      hypothesis?: Hypothesis;
      patch_diff?: string;
      idempotency_key?: string;
      telemetry?: any;
    }) =>
      request<{ message: string; submission: Submission }>('/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    runChaosTest: (submissionId: number) =>
      request<{ message: string; chaos_results: any }>(`/submissions/${submissionId}/chaos-test`, {
        method: 'POST',
      }),
    list: (params?: { challenge_id?: number; status?: string; page?: number }) => {
      const q = new URLSearchParams();
      if (params?.challenge_id) q.set('challenge_id', String(params.challenge_id));
      if (params?.status) q.set('status', params.status);
      if (params?.page) q.set('page', String(params.page));
      return request<{ data: Submission[]; current_page: number; last_page: number; total: number }>(`/submissions?${q.toString()}`);
    },
    get: (id: number) =>
      request<{ submission: Submission }>(`/submissions/${id}`),
  },

  ai: {
    requestHint: (data: {
      challenge_id: number;
      hint_level: 'nudge' | 'direction' | 'debugging_guidance' | 'detailed_explanation';
      language: string;
      code?: string;
      error_context?: string;
      submission_id?: number;
    }) =>
      request<{ hint: AiHint }>('/ai/hint', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    history: (challengeId: number) =>
      request<{ history: AiHint[] }>(`/ai/history/${challengeId}`),
  },

  learning: {
    getProfile: () => request<{ profile: SkillProfile }>('/learning/profile'),
    getRecommendations: () => request<{ recommendations: RecommendationItem[] }>('/learning/recommendations'),
    dismissRecommendation: (id: number) =>
      request<{ message: string }>(`/learning/recommendations/${id}/dismiss`, {
        method: 'POST',
      }),
  },

  reports: {
    generate: () =>
      request<{ message: string; report: ReadinessReport }>('/reports/generate', {
        method: 'POST',
      }),
    list: () =>
      request<{ reports: ReadinessReport[] }>('/reports'),
    get: (uuid: string) =>
      request<{ report: ReadinessReport }>(`/reports/${uuid}`),
    createShare: (uuid: string, options: { allow_diagnostics?: boolean; allow_code_samples?: boolean; expires_days?: number }) =>
      request<{ message: string; share_token: string; share_url: string }>(`/reports/${uuid}/share`, {
        method: 'POST',
        body: JSON.stringify(options),
      }),
    revokeShare: (token: string) =>
      request<{ message: string }>(`/reports/share/${token}/revoke`, {
        method: 'POST',
      }),
    getPublicShared: (shareToken: string) =>
      request<{ shared_report: PublicSharedReport }>(`/reports/shared/${shareToken}`),
  },

  postMortem: {
    submit: (challengeId: number, data: { submission_id: number; root_cause_analysis: string; preventative_measures: string }) =>
      request<{ message: string; post_mortem: PostMortem }>(`/challenges/${challengeId}/post-mortem`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (challengeId: number) =>
      request<{ post_mortem: PostMortem | null }>(`/challenges/${challengeId}/post-mortem`),
  },

  interviews: {
    create: (data: { challenge_id: number; candidate_name?: string; candidate_email?: string }) =>
      request<{ message: string; session: any }>('/interviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (sessionCode: string) =>
      request<{ session: any }>(`/interviews/${sessionCode}`),
    evaluate: (sessionCode: string, data: { interviewer_notes?: string; evaluation_rubric: any; status?: string }) =>
      request<{ message: string; session: any }>(`/interviews/${sessionCode}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
