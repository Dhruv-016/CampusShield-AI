export const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

let cachedWorkingBase: string | null = null;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type StudentUser = {
  id: string;
  name: string;
  email: string | null;
  programme: string;
  semester: string;
  is_demo: boolean;
};

const TOKEN_KEY = "campuspilot_session_token";
const USER_KEY = "campuspilot_user";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): StudentUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: StudentUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Resilient candidate base URLs: same-origin proxy, 127.0.0.1, and localhost
  const candidateBases = Array.from(new Set([
    ...(cachedWorkingBase !== null ? [cachedWorkingBase] : []),
    "",
    "http://127.0.0.1:8000",
    API,
    "http://localhost:8000",
  ]));

  let res: Response | null = null;

  for (const base of candidateBases) {
    const url = `${base}/api/v1${path}`;
    try {
      res = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
        cache: "no-store",
      });
      // Any HTTP response (even 4xx/5xx) indicates network connectivity was established
      cachedWorkingBase = base;
      break;
    } catch {
      // Try next candidate base URL
      continue;
    }
  }

  if (!res) {
    throw new ApiError(
      0,
      "Cannot connect to the backend server. Please verify Uvicorn is running on port 8000 (uvicorn app.main:app --reload --port 8000)."
    );
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new ApiError(res.status, detail);
  }

  return res.json();
}

// Auth API endpoints
export async function authRegister(data: {
  name: string;
  email: string;
  password: string;
  programme?: string;
  semester?: string;
}): Promise<{ status: string; student: StudentUser; token: string }> {
  const res = await api<{ status: string; student: StudentUser; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.token) {
    setSessionToken(res.token);
    setStoredUser(res.student);
  }
  return res;
}

export async function authLogin(data: {
  email: string;
  password: string;
}): Promise<{ status: string; student: StudentUser; token: string }> {
  const res = await api<{ status: string; student: StudentUser; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.token) {
    setSessionToken(res.token);
    setStoredUser(res.student);
  }
  return res;
}

export async function authDemo(): Promise<{ status: string; student: StudentUser; token: string }> {
  const res = await api<{ status: string; student: StudentUser; token: string }>("/auth/demo", {
    method: "POST",
  });
  if (res.token) {
    setSessionToken(res.token);
    setStoredUser(res.student);
  }
  return res;
}

export async function authLogout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // continue clearing client state
  } finally {
    clearSession();
  }
}

export async function authMe(): Promise<{ authenticated: boolean; student: StudentUser | null }> {
  try {
    const res = await api<{ authenticated: boolean; student: StudentUser | null }>("/auth/me");
    if (res.authenticated && res.student) {
      setStoredUser(res.student);
    } else {
      clearSession();
    }
    return res;
  } catch {
    return { authenticated: false, student: null };
  }
}

export type ToolCall = { name: string; args: Record<string, unknown>; status: string; summary: string; duration_ms: number };
export type Source = { chunk_id: string; document_title: string; section_title: string; source_location: string; score: number; snippet: string };
export type TokenUsage = { input: number | null; output: number | null; total: number | null; source: "provider" | "partial" | "unavailable" };
export type ChatResponse = {
  answer: string; conversation_id: string; trace_id: string; route: string; router_source: string; tool_calls: ToolCall[]; sources: Source[];
  memory_used: { id: number; content: string }[]; memory_saved: { id: number; content: string } | null; notices: string[]; latency_ms: number;
  token_usage: TokenUsage; provider_status: string; error_category: string | null; context_meta: Record<string, number | boolean>; execution_summary: string[]; created_at: string;
  approval_request?: ActionApprovalItem | null;
};

export type ActionApprovalItem = {
  id?: string;
  approval_id?: string;
  student_id?: string;
  action_type: string;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  decided_at?: string | null;
  decided_by?: string | null;
  decision_reason?: string | null;
  execution_result?: Record<string, unknown> | null;
};

export type SecurityAuditItem = {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_email: string | null;
  action_category: string;
  action_name: string;
  target_resource: string;
  target_student_id: string | null;
  decision: "ALLOWED" | "BLOCKED_UNAUTHORIZED" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  reason: string;
  trace_id: string | null;
  execution_status: string;
};

export type AuditStats = {
  total_audited: number;
  unauthorized_blocked: number;
  pending_approvals: number;
  human_approved: number;
  authorized_allowed: number;
  secrets_leaked: number;
};

export type ComparisonMetric = {
  measure: string;
  assignment_1: string;
  assignment_2: string;
  delta: string;
  status: "improved" | "critical_pass" | "optimal" | "secure" | "comprehensive";
};

export type ComparisonResponse = {
  assignment_1: Record<string, string>;
  assignment_2: Record<string, string>;
  comparison_metrics: ComparisonMetric[];
};

export type Status = {
  app: string; version: string; environment: string; demo_mode: boolean; university_email_domain?: string; database: string; database_kind: string; llm_configured: boolean;
  llm_provider: string; llm_model: string | null; live_ai_note: string | null; local_tracing: string; langsmith: string; retrieval_mode: string;
  memory_enabled: boolean; demo_student_id: string;
};
export type MemoryItem = { id: number; category: string; content: string; enabled: boolean; created_at: string };
export type TraceItem = {
  id: string; created_at: string; route: string; status: string; latency_ms: number; tool_call_count: number; chunk_ids: string[]; error_category: string | null;
  token_source: string; total_tokens: number | null; provider_status: string; redacted_message: string;
  tool_calls?: ToolCall[]; events?: { stage: string; t_ms: number; detail: string }[]; context?: Record<string, unknown>; memory_ids?: number[];
  model?: string | null; retrieval_mode?: string | null; input_tokens?: number | null; output_tokens?: number | null; langsmith_status?: string; fallback_used?: boolean; router_source?: string;
};
export type EvalResult = {
  case_id: string; name: string; category: string; expected_route: string | null; actual_route: string | null; expected_tool: string | null;
  actual_tools: string[]; status: "passed" | "failed" | "blocked"; latency_ms: number | null; total_tokens: number | null; trace_id: string | null; evidence_ids: string[]; note: string;
};
export type EvalSummary = {
  run: { id: number; mode: string; started_at: string } | null;
  summary: null | { total_cases: number; executed: number; passed: number; failed: number; blocked: number; success_rate: number | null; avg_latency_ms: number | null;
    median_latency_ms: number | null; tool_selection_accuracy: number | null; token_total: number | null; token_cases: number;
    by_category: { category: string; passed: number; failed: number }[]; tool_usage: { tool: string; count: number }[] };
  results: EvalResult[];
};
