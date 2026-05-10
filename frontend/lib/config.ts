import Constants from 'expo-constants';

const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL: string = fromEnv ?? fromExtra ?? 'http://localhost:8080';
