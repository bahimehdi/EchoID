import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../lib/theme';

type Accent = 'primary' | 'orange' | 'red' | 'green' | 'blue' | undefined;

const ACCENT_COLOR: Record<Exclude<Accent, undefined>, string> = {
  primary: colors.primary,
  orange: colors.accentOrange,
  red: colors.accentRed,
  green: colors.accentGreen,
  blue: colors.accentBlue,
};

export default function Card({
  children,
  style,
  accent,
  padding = spacing.lg,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: Accent;
  padding?: number;
}) {
  return (
    <View
      style={[
        styles.root,
        accent ? { borderLeftWidth: 4, borderLeftColor: ACCENT_COLOR[accent] } : null,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
});
