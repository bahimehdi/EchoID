import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, progressColor, radius, spacing } from '../lib/theme';

export default function ProgressBar({
  pct,
  label = 'Progression',
  color,
  height = 8,
}: {
  pct: number; // 0..100
  label?: string;
  color?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const c = color ?? progressColor(clamped);
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: c }]}>{Math.round(clamped)}%</Text>
      </View>
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${clamped}%`, height, backgroundColor: c }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '500' },
  value: { fontSize: fontSize.sm, fontWeight: '700' },
  track: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { borderRadius: radius.pill },
});
