import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function Index() {
  const { hydrated, accessToken } = useAuth();
  if (!hydrated) return null;
  return <Redirect href={accessToken ? '/(tabs)/home' : '/(auth)/login'} />;
}
