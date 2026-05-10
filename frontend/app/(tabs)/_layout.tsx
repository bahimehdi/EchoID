import { Tabs } from 'expo-router';
import BottomTabBar from '../../components/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="courses" options={{ title: 'Cours' }} />
      <Tabs.Screen name="nexusai" options={{ title: 'NexusAI' }} />
      <Tabs.Screen name="workload" options={{ title: 'Analyse' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
