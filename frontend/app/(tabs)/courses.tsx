import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, Pressable } from 'react-native';
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

const ASSIGNMENTS = [
  { label: 'Dernier devoir', title: 'TD 3 — Diagonalisation d’une matrice', due: 'À rendre vendredi, 18:00' },
  { label: 'Dernier devoir', title: 'Compte rendu — Cycle de Carnot', due: 'Déposé hier sur Moodle' },
  { label: 'Dernier devoir', title: 'Série 4 — Équilibres chimiques', due: 'Correction disponible' },
  { label: 'Dernier devoir', title: 'TP — Estimation et loi normale', due: 'À préparer pour lundi' },
  { label: 'Dernier devoir', title: 'Exercices — Transformée de Fourier', due: 'À rendre le 16 mai' },
  { label: 'Dernier devoir', title: 'Mini-projet — Analyse de fichiers CSV', due: 'Google Classroom' },
];

const CHAPTERS = ['Chapitre 1', 'Chapitre 2', 'Chapitre 3', 'Chapitre 4'];

export default function Courses() {
  const [refreshing, setRefreshing] = useState(false);
  const [openChapterFor, setOpenChapterFor] = useState<string | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string>>({});
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
          const selectedChapter = selectedChapters[c.id] ?? 'Chapitre 3';
          const chapterOpen = openChapterFor === c.id;
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
              <View style={styles.chapterBlock}>
                <Text style={styles.chapterLabel}>Chapitres</Text>
                <Pressable
                  style={styles.chapterSelect}
                  onPress={() => setOpenChapterFor(chapterOpen ? null : c.id)}
                >
                  <Text style={styles.chapterSelectText}>{selectedChapter}</Text>
                  <Text style={styles.chapterChevron}>{chapterOpen ? '⌃' : '⌄'}</Text>
                </Pressable>
                {chapterOpen && (
                  <View style={styles.chapterMenu}>
                    {CHAPTERS.map((chapter) => (
                      <Pressable
                        key={chapter}
                        style={[styles.chapterOption, selectedChapter === chapter && styles.chapterOptionActive]}
                        onPress={() => {
                          setSelectedChapters((prev) => ({ ...prev, [c.id]: chapter }));
                          setOpenChapterFor(null);
                        }}
                      >
                        <Text style={[styles.chapterOptionText, selectedChapter === chapter && styles.chapterOptionTextActive]}>
                          {chapter}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.assignmentBox}>
                <Text style={styles.assignmentLabel}>{ASSIGNMENTS[i % ASSIGNMENTS.length].label}</Text>
                <Text style={styles.assignmentTitle}>{ASSIGNMENTS[i % ASSIGNMENTS.length].title}</Text>
                <Text style={styles.assignmentDue}>{ASSIGNMENTS[i % ASSIGNMENTS.length].due}</Text>
              </View>
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
  chapterBlock: { marginTop: spacing.md },
  chapterLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  chapterSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterSelectText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  chapterChevron: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  chapterMenu: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  chapterOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  chapterOptionActive: { backgroundColor: colors.primarySoft },
  chapterOptionText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  chapterOptionTextActive: { color: colors.primary, fontWeight: '800' },
  assignmentBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assignmentLabel: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  assignmentTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', marginTop: 4 },
  assignmentDue: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
});
