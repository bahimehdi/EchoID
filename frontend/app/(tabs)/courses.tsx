import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { api, unwrap } from '../../lib/api';
import type { CourseDto } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import Header from '../../components/Header';

const semesterTag = (s: string) => (s === 'S1' ? 'S3 - INFO' : s === 'S2' ? 'S4 - INFO' : s);

// Stable per-course pseudo-progress so the demo looks alive but reproducible.
function progressFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 86) + 12; // 12..97
}

const ICONS = ['{ }', '☱', '⌬', '◧', '∑', '⚙', '⌖', '✎'];

export default function Courses() {
  const [refreshing, setRefreshing] = useState(false);
  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: () => unwrap<CourseDto[]>(api.get('/api/courses')),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await courses.refetch();
    setRefreshing(false);
  }, [courses]);

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.h1}>Mes Cours</Text>
        <Text style={styles.h1Sub}>Semestre d’Automne 2026 – 2027</Text>

        {courses.isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}

        {courses.data?.map((c, i) => {
          const pct = progressFor(c.id);
          const done = pct >= 99;
          return (
            <Card key={c.id} style={{ marginTop: spacing.lg }}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconBoxText}>{ICONS[i % ICONS.length]}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Badge tone={done ? 'green' : 'primary'}>
                    {done ? '✓ Terminé' : semesterTag(c.semester)}
                  </Badge>
                </View>
              </View>
              <Text style={styles.courseTitle}>{c.title}</Text>
              <Text style={styles.courseProf}>Prof. {['El Fassi', 'Benali', 'Chraibi', 'Amrani', 'Idrissi', 'Naciri'][i % 6]}</Text>
              <View style={{ marginTop: spacing.md }}>
                <ProgressBar pct={pct} />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  h1: { fontSize: fontSize.display, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  h1Sub: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  iconBoxText: { color: colors.primary, fontWeight: '900', fontSize: 18 },
  courseTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  courseProf: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
});
