const API_BASE_URL = 'http://localhost:8000/api';

export interface HealthResponse {
  status: string;
  message: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  region: string;
}

export interface Profile {
  highest_qualification: string;
  institution: string;
  field_of_study: string;
  graduation_year: number | null;
  years_of_experience: number;
  employment_status: 'student' | 'unemployed' | 'employed' | 'interning';
  career_interests: string[];
  technical_skills: string[];
  soft_skills: string[];
  languages: string[];
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  country: string;
  region: string;
}

export interface Resume {
  id: string;
  file: string;
  original_filename: string;
  file_size: number;
  created_at: string;
}

export interface ResumeAnalysis {
  qualifications: string[];
  technical_skills: string[];
  soft_skills: string[];
  experience_summary: string;
  potential_job_roles: string[];
  experience_level: 'entry' | 'junior' | 'mid' | 'senior';
  created_at: string;
}

export interface JobRecommendation {
  id: string;
  job_title: string;
  match_percentage: number;
  why_you_match: string;
  relevant_skills: string[];
  missing_skills: string[];
  typical_responsibilities: string[];
  experience_level: 'entry' | 'junior' | 'mid' | 'senior';
  created_at: string;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

function storeAccessToken(access: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// --- Refreshing ------------------------------------------------------------
// If two requests fail at the same moment (e.g. a page that fires several
// API calls at once), we don't want to send two refresh requests — the
// second one would arrive after SIMPLE_JWT's ROTATE_REFRESH_TOKENS has
// already invalidated the first refresh token. So every caller shares
// the same in-flight refresh promise instead of starting their own.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token available.');

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('Refresh token expired or invalid.');
      const data = await response.json();
      storeAccessToken(data.access);
      return data.access as string;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// --- Requests ----------------------------------------------------------

async function rawRequest<T>(path: string, options: RequestInit, token: string | null): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await rawRequest<T>(path, options, getAccessToken());

  // 401 here specifically means "your access token is bad/expired" — not
  // "wrong password" (that happens at login, before any token exists).
  // Only retry once, and only for requests that had a token to begin with,
  // so a failed login attempt doesn't get mistaken for an expired session.
  if (response.status === 401 && getAccessToken()) {
    try {
      const newAccess = await refreshAccessToken();
      response = await rawRequest<T>(path, options, newAccess);
    } catch {
      clearTokens();
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request to ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/resumes/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // No Content-Type here — the browser sets it automatically for
    // FormData, including the multipart boundary marker it needs.
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // DRF returns file errors as { file: ["message"] } — unwrap that
    // into a plain string so the UI doesn't have to know the shape.
    const message = body.file?.[0] || body.detail || 'Upload failed.';
    throw new Error(message);
  }

  return response.json();
}


export const api = {
  getHealth: () => request<HealthResponse>('/health/'),
  login: (email: string, password: string) =>
    request<AuthTokens>('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: RegisterPayload) =>
    request<User>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<User>('/auth/me/'),
  logout: () => request<void>('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') }),
  }),
  getProfile: () => request<Profile>('/profile/'),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>('/profile/', { method: 'PUT', body: JSON.stringify(data) }),
  uploadResume: (file: File) => uploadResume(file),
  getResumes: () => request<Resume[]>('/resumes/'),
  deleteResume: (id: string) => request<void>(`/resumes/${id}/`, { method: 'DELETE' }),
  analyzeResume: (id: string) => request<ResumeAnalysis>(`/resumes/${id}/analyze/`, { method: 'POST' }),
  getCareerRecommendations: () => request<JobRecommendation[]>('/careers/recommendations/'),
  generateCareerRecommendations: () =>
    request<JobRecommendation[]>('/careers/analyze/', { method: 'POST' }),
};

