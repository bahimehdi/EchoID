import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { readAccessToken, useAuth } from './auth';
import type { ApiEnvelope } from './types';

export async function unwrap<T>(p: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const r = await p;
  if (!r.data?.success) throw new Error(r.data?.message ?? 'API error');
  return r.data.data;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
  const token = await readAccessToken();
  if (token) {
    cfg.headers.set('Authorization', `Bearer ${token}`);
  }
  return cfg;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuth.getState();
  if (!refreshToken) return null;
  try {
    const r = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const { accessToken, refreshToken: newRefresh, user } = r.data.data;
    await useAuth.getState().setSession({ accessToken, refreshToken: newRefresh, user });
    return accessToken;
  } catch {
    await useAuth.getState().clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
    }
    throw err;
  },
);
