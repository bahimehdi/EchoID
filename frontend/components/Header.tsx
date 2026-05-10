import { View, Text, Pressable, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { useAuth } from '../lib/auth';
import { colors, fontSize, spacing } from '../lib/theme';

export default function Header({ title = 'Portail UIT', onMenu, onSearch }: {
  title?: string; onMenu?: () => void; onSearch?: () => void;
}) {
  const user = useAuth((s) => s.user);
  return (
    <View style={styles.root}>
      <Pressable onPress={onMenu} style={styles.iconBtn} hitSlop={8}>
        <Text style={styles.icon}>≡</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>
        {onSearch && (
          <Pressable onPress={onSearch} style={styles.iconBtn} hitSlop={8}>
            <Text style={styles.icon}>⌕</Text>
          </Pressable>
        )}
        <Avatar name={user?.fullName ?? user?.email} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  title: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },
  iconBtn: { padding: 4 },
  icon: { fontSize: 22, color: colors.text },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
