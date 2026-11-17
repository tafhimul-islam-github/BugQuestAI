export interface User {
  id: number;
  name: string;
  email: string;
  role: 'learner' | 'educator' | 'admin';
  target_role?: string;
  bio?: string;
  settings?: Record<string, any>;
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
    }) =>
      request<{ message: string; submission: Submission }>('/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
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
};
