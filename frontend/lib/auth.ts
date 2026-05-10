import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'echoid_access_token';
const REFRESH_KEY = 'echoid_refresh_token';
const USER_KEY = 'echoid_user';

// expo-secure-store is iOS/Android only; on web fall back to localStorage so
// the same hooks work in `npx expo start --web` for the demo.
const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { globalThis.localStorage?.setItem(key, value); } catch { /* private mode */ }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { globalThis.localStorage?.removeItem(key); } catch { /* private mode */ }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export type Role = 'STUDENT' | 'PROFESSOR' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  school?: string;
  fullName?: string;
};

type AuthState = {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrate: () => Promise<void>;
  setSession: (p: { accessToken: string; refreshToken: string; user: AuthUser }) => Promise<void>;
  clear: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  user: null,

  hydrate: async () => {
    const [access, refresh, userJson] = await Promise.all([
      storage.getItemAsync(ACCESS_KEY),
      storage.getItemAsync(REFRESH_KEY),
      storage.getItemAsync(USER_KEY),
    ]);
    set({
      hydrated: true,
      accessToken: access,
      refreshToken: refresh,
      user: userJson ? (JSON.parse(userJson) as AuthUser) : null,
    });
  },

  setSession: async ({ accessToken, refreshToken, user }) => {
    await Promise.all([
      storage.setItemAsync(ACCESS_KEY, accessToken),
      storage.setItemAsync(REFRESH_KEY, refreshToken),
      storage.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    set({ accessToken, refreshToken, user });
  },

  clear: async () => {
    await Promise.all([
      storage.deleteItemAsync(ACCESS_KEY),
      storage.deleteItemAsync(REFRESH_KEY),
      storage.deleteItemAsync(USER_KEY),
    ]);
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

export async function readAccessToken(): Promise<string | null> {
  return storage.getItemAsync(ACCESS_KEY);
}
