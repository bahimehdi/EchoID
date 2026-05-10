import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, fontSize } from '../lib/theme';

/**
 * 75% style donut from the Figma — broken-arc segments around a centered
 * percentage value + tiny caption.
 */
export default function Donut({
  pct,
  size = 160,
  stroke = 14,
  color = colors.primary,
  trackColor = '#E5E7EB',
  caption,
}: {
  pct: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  caption?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  // Visual treatment: 3 broken arcs covering p% in total. Each arc is p/3 long,
  // separated by a small gap. Approximated with strokeDasharray.
  const arcLen = (p / 100) * c / 3;
  const gap = c * 0.04;
  const dashArray = `${arcLen} ${gap}`;

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
          {p > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={0}
            />
          )}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{Math.round(p)}%</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  caption: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
});
