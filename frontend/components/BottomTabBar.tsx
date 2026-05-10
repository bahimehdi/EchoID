import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fontSize, radius, shadow, spacing } from '../lib/theme';

const NEXUS_KEY = 'nexusai';

const ICONS: Record<string, string> = {
  home: '⌂',
  courses: '☱',
  nexusai: '✦',
  workload: '▤',
  profile: '◉',
};

const LABELS: Record<string, string> = {
  home: 'ACCUEIL',
  courses: 'COURS',
  nexusai: 'NEXUSAI',
  workload: 'ANALYSE',
  profile: 'PROFIL',
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  // Force display order: home, courses, nexusai, workload, profile
  const ORDER = ['home', 'courses', 'nexusai', 'workload', 'profile'];
  const routes = ORDER
    .map((n) => state.routes.find((r) => r.name === n))
    .filter(Boolean) as typeof state.routes;

  return (
    <View style={styles.bar}>
      {routes.map((route) => {
        const focused = state.routes[state.index].name === route.name;
        const isCenter = route.name === NEXUS_KEY;
        const onPress = () => {
          if (!focused) navigation.navigate(route.name);
        };
        if (isCenter) {
          return (
            <View key={route.key} style={styles.centerSlot}>
              <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={[styles.fab, focused && styles.fabActive]}
              >
                <Text style={styles.fabIcon}>{ICONS[route.name]}</Text>
              </Pressable>
              <Text style={[styles.label, styles.centerLabel]}>{LABELS[route.name]}</Text>
            </View>
          );
        }
        return (
          <Pressable key={route.key} accessibilityRole="button" onPress={onPress} style={styles.tab}>
            <Text style={[styles.icon, { color: focused ? colors.primary : colors.textMuted }]}>
              {ICONS[route.name]}
            </Text>
            <Text style={[styles.label, { color: focused ? colors.primary : colors.textMuted, fontWeight: focused ? '800' : '600' }]}>
              {LABELS[route.name]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 4,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    gap: 6,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    ...shadow.fab,
  },
  fabActive: { backgroundColor: colors.primaryStrong },
  fabIcon: { color: '#fff', fontSize: 26, fontWeight: '900' },
  centerLabel: { color: colors.textMuted, fontWeight: '700' },
  icon: { fontSize: 22 },
  label: { fontSize: fontSize.xs, letterSpacing: 0.6 },
});
