import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { api, unwrap } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { CourseDto, WdResponseDto, NotificationDto } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Card from '../../components/Card';
import Donut from '../../components/Donut';
import ProgressBar from '../../components/ProgressBar';

const FR_DAYS_FULL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function buildMonth(date: Date) {
  const year = date.getFullYear(), month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Mon-first weekday index: 0=Mon..6=Sun
  const firstWd = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWd; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Home() {
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const monthCells = buildMonth(today);

  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: () => unwrap<CourseDto[]>(api.get('/api/courses')),
  });

  const workload = useQuery({
    queryKey: ['workload', user?.id],
    queryFn: () => unwrap<WdResponseDto>(api.get(`/api/students/${user!.id}/workload`)),
    enabled: !!user?.id,
  });

  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: () => unwrap<NotificationDto[]>(api.get('/api/notifications')),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([courses.refetch(), workload.refetch(), notifications.refetch()]);
    setRefreshing(false);
  }, [courses, workload, notifications]);

  const capacityPct = workload.data
    ? Math.min(100, Math.round((workload.data.wdScore / 0.30) * 100))
    : null;

  const greetingName = (user?.fullName ?? user?.email ?? '').split(' ')[0] || 'étudiant';

  const todayItems = courses.data?.slice(0, 3).map((c) => ({
    title: c.title,
    sub: 'Cours',
    time: null,
    accent: 'primary' as const,
    badge: null,
  }));

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Greeting */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>
          <Text style={styles.h1}>Bonjour, {greetingName}.</Text>
          <Text style={styles.h1Sub}>{user?.school ?? 'ENSA'} — {workload.data?.status === 'HIGH' || workload.data?.status === 'CRITICAL' ? 'Charge soutenue' : 'Charge équilibrée'}</Text>
        </View>

        {/* Calendar */}
        <Card style={{ marginHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{FR_MONTHS[today.getMonth()]} {today.getFullYear()}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
              <Text style={styles.chev}>‹</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </View>
          <View style={styles.weekHeader}>
            {FR_DAYS_FULL.map((d) => <Text key={d} style={styles.weekDay}>{d}</Text>)}
          </View>
          <View style={styles.calGrid}>
            {monthCells.map((d, i) => {
              const isToday = d === today.getDate();
              return (
                <View key={i} style={styles.calCell}>
                  {d ? (
                    <View style={isToday ? styles.calToday : null}>
                      <Text style={[styles.calNum, isToday && styles.calNumToday]}>{d}</Text>
                      {isToday && <View style={styles.calDots}>
                        <View style={[styles.calDot, { backgroundColor: colors.accentOrange }]} />
                        <View style={[styles.calDot, { backgroundColor: '#fff' }]} />
                      </View>}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>

        {/* Today's program */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <Card padding={spacing.lg}>
            <Text style={styles.sectionLabel}>PROGRAMME DU {today.getDate()} {FR_MONTHS[today.getMonth()].toUpperCase()}</Text>
            {todayItems?.map((item, i) => (
              <View
                key={i}
                  style={[
                    styles.programItem,
                    { borderLeftColor: colors.primary },
                    i > 0 && { marginTop: spacing.md },
                  ]}
                >
                  <View style={[styles.programIcon, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[styles.programIconText, { color: colors.primary }]}>
                      A
                    </Text>
                  </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.programTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.programSub} numberOfLines={1}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

          {/* Charge de travail */}
        <Pressable onPress={() => router.push('/(tabs)/workload')} style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <Card>
            <Text style={styles.cardTitle}>Charge de travail</Text>
            <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
              {capacityPct !== null ? (
                <Donut pct={capacityPct} caption={workload.data?.status === 'CRITICAL' ? 'surcharge' : 'capacité'} />
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Données indisponibles</Text>
              )}
            </View>
            <ProgressBar pct={courses.data ? Math.round((courses.data.length / 8) * 100) : 0}
                         label="Crédits validés" color={colors.accentOrange} />
            <Text style={styles.cardLink}>Voir l’analyse complète →</Text>
          </Card>
        </Pressable>

        {/* Notifications */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <Card>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Notifications récentes</Text>
              <Pressable onPress={() => router.push('/(tabs)/workload')}>
                <Text style={styles.linkText}>Voir tout</Text>
              </Pressable>
            </View>
            {notifications.data?.slice(0, 3).map((n, i) => (
              <View key={n.id} style={[styles.notifItem, i > 0 && { marginTop: spacing.md }]}>
                <View style={[styles.notifDot, { backgroundColor: n.isRead ? colors.textMuted : colors.accentOrange }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifBody}>{n.message}</Text>
                  <Text style={styles.notifWhen}>{n.type.replace('_', ' ')} • {timeAgo(n.sentAt)}</Text>
                </View>
              </View>
            ))}
            {notifications.isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />}
            {notifications.data?.length === 0 && (
              <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.sm }}>Aucune notification récente.</Text>
            )}
          </Card>
        </View>

        {(courses.isLoading || workload.isLoading) && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        )}
      </ScrollView>
    </View>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return `Il y a ${Math.round(days / 7)} sem`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  h1: { fontSize: fontSize.display, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  h1Sub: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  cardLink: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm, marginTop: spacing.md, textAlign: 'right' },
  chev: { fontSize: 20, color: colors.textMuted },
  linkText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8, marginBottom: spacing.md },

  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.sm },
  weekDay: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' },
  calNum: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  calToday: {
    backgroundColor: colors.primary,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  calNumToday: { color: '#fff', fontWeight: '800' },
  calDots: { position: 'absolute', bottom: -8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 2 },
  calDot: { width: 4, height: 4, borderRadius: 2 },

  programItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surfaceMuted, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderLeftWidth: 4,
  },
  programIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  programIconText: { fontSize: 16, fontWeight: '900' },
  programTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  programSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  programTime: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  programBadge: { fontSize: fontSize.xs, color: colors.accentOrange, fontWeight: '800', marginTop: 2 },

  notifItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  notifBody: { fontSize: fontSize.md, color: colors.text },
  notifWhen: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
