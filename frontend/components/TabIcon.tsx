import { Text, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

const GLYPHS: Record<string, string> = {
  home: '⌂',
  courses: '☱',
  alerts: '◔',
  profile: '◉',
  nexus: '✦',
  analyse: '▤',
};

export default function TabIcon({ name, focused }: { name: keyof typeof GLYPHS; focused: boolean }) {
  return (
    <Text style={[styles.icon, { color: focused ? colors.primary : colors.textMuted }]}>
      {GLYPHS[name]}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 22, fontWeight: '700' },
});
