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

export interface Challenge {
  id: number;
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
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
}

export interface Submission {
  id: number;
  challenge_id: number;
  language: string;
  code: string;
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
    execution_time_ms?: number;
  }>;
  created_at: string;
  challenge?: { id: number; title: string; slug: string; difficulty: string };
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
  proficiency_level: 'developing' | 'demonstrating_progress' | 'consistent';
  challenges_passed: number;
  challenges_attempted: number;
  total_submissions: number;
  diagnostic_history: Array<{
    date: string;
    challenge_slug: string;
    result: string;
    pass_ratio: string;
    time_ms?: number;
  }>;
  last_assessed: string;
}

export interface SkillProfile {
  user_id: number;
  user_name: string;
  target_role: string;
  overall_score: number;
  overall_proficiency: string;
  challenges_solved: number;
  challenges_total: number;
  skills: SkillItem[];
  recent_activity: Array<{
    id: number;
    challenge_title: string;
    status: string;
    execution_time_ms?: number;
    created_at: string;
  }>;
}

export interface RecommendationItem {
  id: number;
  reason: string;
  topic: string;
  challenge: {
    id: number;
    slug: string;
    title: string;
    difficulty: string;
    topics?: string[];
  };
  created_at: string;
}

export interface ReadinessReport {
  id: number;
  report_uuid: string;
  title: string;
  overall_readiness_score: number;
  readiness_level: string;
  summary: string;
  methodology_notes: string;
  limitations_disclaimer: string;
  included_metrics: Record<string, any>;
  skill_breakdown: Array<{
    topic: string;
    score: number;
    proficiency_level: string;
    challenges_passed: number;
    total_submissions: number;
  }>;
  verified_evidence_count: number;
  generated_at: string;
}

export interface PublicSharedReport {
  title: string;
  candidate_name: string;
  target_role?: string;
  overall_readiness_score: number;
  readiness_level: string;
  summary: string;
  methodology_notes: string;
  limitations_disclaimer: string;
  verified_evidence_count: number;
  generated_at: string;
  skill_breakdown: Array<{
    topic: string;
    score: number;
    proficiency_level: string;
    challenges_passed: number;
    total_submissions: number;
  }>;
  sharing_settings: {
    allow_diagnostics: boolean;
    allow_code_samples: boolean;
    views_count: number;
    expires_at?: string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('bugquest_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('bugquest_token');
      localStorage.removeItem('bugquest_user');
    }
    const message = data.message || Object.values(data.errors || {})[0] || `Request failed with status ${response.status}`;
    throw new Error(String(message));
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
    list: (params?: { difficulty?: string; topic?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.difficulty) q.set('difficulty', params.difficulty);
      if (params?.topic) q.set('topic', params.topic);
      if (params?.search) q.set('search', params.search);
      return request<{ challenges: Challenge[]; topics: string[]; total: number }>(`/challenges?${q.toString()}`);
    },
    get: (slugOrId: string | number) =>
      request<{ challenge: Challenge }>(`/challenges/${slugOrId}`),
    adminCreate: (data: any) =>
      request<{ message: string; challenge: Challenge }>('/admin/challenges', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  submissions: {
    create: (data: { challenge_id: number; language: string; code: string; idempotency_key?: string }) =>
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
      code: string;
      error_context?: string;
      submission_id?: number;
    }) =>
      request<{ hint: AiHint }>('/ai/hint', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistory: (challengeId: number) =>
      request<{ history: AiHint[] }>(`/ai/history/${challengeId}`),
  },

  learning: {
    getProfile: () =>
      request<{ profile: SkillProfile }>('/learning/profile'),
    getRecommendations: () =>
      request<{ recommendations: RecommendationItem[] }>('/learning/recommendations'),
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
    createShare: (uuid: string, data: { allow_diagnostics?: boolean; allow_code_samples?: boolean; expires_days?: number }) =>
      request<{ message: string; share_token: string; share_url: string; expires_at: string }>(`/reports/${uuid}/share`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    revokeShare: (token: string) =>
      request<{ message: string }>(`/reports/share/${token}/revoke`, {
        method: 'POST',
      }),
    getPublicShared: (token: string) =>
      request<{ shared_report: PublicSharedReport }>(`/reports/shared/${token}`),
  },

  health: {
    check: () => request<{ status: string; platform: string; version: string; services: any }>('/health'),
  },
};
