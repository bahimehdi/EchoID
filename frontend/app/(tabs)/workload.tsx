import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Polyline, Rect, Line as SvgLine } from 'react-native-svg';
import { api, unwrap } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { WdResponseDto } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Card from '../../components/Card';
import Header from '../../components/Header';
import Donut from '../../components/Donut';
import ProgressBar from '../../components/ProgressBar';

const STATUS_LABEL = { LOW: 'Optimale', MODERATE: 'Soutenable', HIGH: 'Élevée', CRITICAL: 'Surcharge' } as const;
const STATUS_HINT = {
  LOW: 'Charge confortable, marge pour approfondir.',
  MODERATE: 'Charge soutenable. Risque de surmenage faible.',
  HIGH: 'Charge élevée — programme tes révisions sans tarder.',
  CRITICAL: 'Surcharge détectée. Consulte la liste des échéances ci-dessous.',
} as const;

export default function Workload() {
  const user = useAuth((s) => s.user);
  const wq = useQuery({
    queryKey: ['workload', user?.id],
    queryFn: () => unwrap<WdResponseDto>(api.get(`/api/students/${user!.id}/workload`)),
    enabled: !!user?.id,
  });

  if (!user || wq.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (wq.error || !wq.data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.accentRed }}>Impossible de charger l’analyse.</Text>
      </View>
    );
  }

  const data = wq.data;
  const capacityPct = Math.min(100, Math.round((data.wdScore / 0.30) * 100));
  const validatedEcts = 12;
  const inProgressEcts = 18;
  const totalEcts = 30;

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}>
        <Text style={styles.h1}>Analyse de Charge de Travail</Text>
        <Text style={styles.h1Sub}>Semestre Automne 2026 – 2027</Text>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.cardTitle}>Capacité Actuelle</Text>
          <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
            <Donut pct={capacityPct} caption={STATUS_LABEL[data.status]} />
          </View>
          <Text style={styles.subText}>{STATUS_HINT[data.status]}</Text>
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Progression des Crédits ECTS</Text>
            <View style={styles.totalPill}>
              <Text style={styles.totalPillText}>Total: {totalEcts} ECTS</Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            <ProgressBar
              pct={(validatedEcts / totalEcts) * 100}
              label={`Validés (${validatedEcts} ECTS)`}
              color={colors.primary}
            />
            <ProgressBar
              pct={(inProgressEcts / totalEcts) * 100}
              label={`En cours (${inProgressEcts} ECTS)`}
              color="#93B0E5"
            />
          </View>
          <View style={styles.legendRow}>
            <LegendDot color={colors.primary} label="Validés" />
            <LegendDot color="#93B0E5" label="En cours" />
          </View>
        </Card>

        <Card style={{ marginTop: spacing.lg, padding: 0 }}>
          <View style={[styles.rowBetween, { padding: spacing.lg, paddingBottom: spacing.md }]}>
            <Text style={styles.cardTitle}>Échéances à venir</Text>
            <Text style={styles.linkText}>Voir tout →</Text>
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.thCell, { flex: 2 }]}>MODULE</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>TYPE</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>DATE LIMITE</Text>
          </View>
          {data.breakdown.slice(0, 4).map((b, i) => {
            const isHot = b.contribution > 0.15;
            return (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  isHot ? { backgroundColor: colors.accentOrangeSoft } : null,
                  i === data.breakdown.slice(0, 4).length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={[styles.tdCell, { flex: 2, color: isHot ? colors.accentOrange : colors.text, fontWeight: '700' }]} numberOfLines={2}>
                  {b.courseTitle}
                </Text>
                <Text style={[styles.tdCell, { flex: 1, color: isHot ? colors.accentOrange : colors.textMuted }]}>
                  {b.assignmentTitle}
                </Text>
                <Text style={[styles.tdCell, { flex: 1, color: isHot ? colors.accentOrange : colors.textMuted, fontWeight: isHot ? '700' : '500' }]}>
                  {`+ ${Math.round(b.ti)} j`}
                </Text>
              </View>
            );
          })}
          {data.status === 'CRITICAL' || data.status === 'HIGH' ? (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⓘ  Attention : tu as plusieurs échéances rapprochées. Pense à réviser ton emploi du temps pour éviter une surcharge.
              </Text>
            </View>
          ) : null}
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.cardTitle}>Tendance de la Charge (Estimée)</Text>
          <View style={{ marginTop: spacing.md }}>
            <TrendChart history={data.history} />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: spacing.lg }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{label}</Text>
    </View>
  );
}

function TrendChart({ history }: { history: WdResponseDto['history'] }) {
  // Take the last 8 points to mirror the Figma's S1..S8 axis.
  const pts = history.slice(-8);
  const W = 320, H = 160, P = 16;
  const max = Math.max(...pts.map((p) => p.wdScore), 0.3);
  const xStep = (W - 2 * P) / Math.max(1, pts.length - 1);
  const yFor = (v: number) => H - P - (v / max) * (H - 2 * P);
  const linePoints = pts.map((p, i) => `${P + i * xStep},${yFor(p.wdScore)}`).join(' ');
  const peakIdx = pts.reduce((m, p, i) => (p.wdScore > pts[m].wdScore ? i : m), 0);
  const labels = ['S1','S2','S3','S4','S5','S6','S7','S8'];
  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* baseline grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <SvgLine key={g} x1={P} y1={H - P - g * (H - 2 * P)} x2={W - P} y2={H - P - g * (H - 2 * P)}
                   stroke="#E5E7EB" strokeDasharray="2 4" strokeWidth={1} />
        ))}
        {/* bars */}
        {pts.map((p, i) => {
          const x = P + i * xStep - 10;
          const y = yFor(p.wdScore);
          const barColor = i === peakIdx ? colors.accentOrange : '#C7D6F0';
          return (
            <Rect key={i} x={x} y={y} width={20} height={H - P - y}
                  fill={barColor} rx={3} ry={3} opacity={0.85} />
          );
        })}
        {/* trend line */}
        <Polyline points={linePoints} fill="none" stroke={colors.primary} strokeWidth={2.5} />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, paddingHorizontal: P }}>
        {labels.slice(0, pts.length).map((l, i) => (
          <Text key={i} style={{ color: i === peakIdx ? colors.accentOrange : colors.textMuted, fontSize: fontSize.xs, fontWeight: i === peakIdx ? '800' : '500' }}>
            {l}{i === peakIdx ? ' (Actuelle)' : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  h1: { fontSize: fontSize.display, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  h1Sub: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 4 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  subText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPill: { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  totalPillText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  legendRow: { flexDirection: 'row', marginTop: spacing.md },

  tableHead: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, paddingVertical: 8, paddingHorizontal: spacing.lg },
  thCell: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  tdCell: { fontSize: fontSize.sm },

  warning: { backgroundColor: colors.accentOrangeSoft, padding: spacing.md, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.accentOrangeSoft },
  warningText: { color: colors.accentOrange, fontSize: fontSize.sm },
  linkText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
});
