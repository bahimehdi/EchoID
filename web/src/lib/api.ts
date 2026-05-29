import axios from 'axios';

const TOKEN_KEY = 'echoid_web_token';
const USER_KEY = 'echoid_web_user';

export const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  if (cfg.url?.startsWith('/api/auth/')) {
    return cfg;
  }
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export type Role = 'STUDENT' | 'PROFESSOR' | 'ADMIN';
export type WebUser = { id: string; email: string; role: Role; school?: string; fullName?: string };

export type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export async function unwrap<T>(p: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const r = await p;
  if (!r.data?.success) throw new Error(r.data?.message ?? 'API error');
  return r.data.data;
}

/** For endpoints that return raw JSON (arrays, non-envelope). */
export async function rawGet<T>(url: string): Promise<T> {
  const r = await api.get<T>(url);
  // Some AI-service endpoints wrap in { success, data } too
  const d: any = r.data;
  if (d && typeof d === 'object' && 'success' in d) {
    if (!d.success) throw new Error(d.message ?? 'API error');
    return d.data as T;
  }
  return r.data;
}

export const session = {
  save(token: string, user: WebUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  user(): WebUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as WebUser : null;
  },
  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
