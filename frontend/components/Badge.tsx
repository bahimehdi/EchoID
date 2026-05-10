import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type Tone = 'primary' | 'orange' | 'red' | 'green' | 'gray';

const TONE: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primarySoft, fg: colors.primary },
  orange: { bg: colors.accentOrangeSoft, fg: colors.accentOrange },
  red: { bg: colors.accentRedSoft, fg: colors.accentRed },
  green: { bg: colors.accentGreenSoft, fg: colors.accentGreen },
  gray: { bg: colors.surfaceMuted, fg: colors.textMuted },
};

export default function Badge({ children, tone = 'primary' }: { children: React.ReactNode; tone?: Tone }) {
  const { bg, fg } = TONE[tone];
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.4 },
});
