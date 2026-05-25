import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { api, unwrap } from '../../lib/api';
import type { CourseDto, CourseDetailDto, AssignmentDto } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import Header from '../../components/Header';

const semesterTag = (s: string) => (s === 'S1' ? 'S3 - INFO' : s === 'S2' ? 'S4 - INFO' : s);

const ICONS = ['{ }', '☱', '⌬', '◧', '∑', '⚙', '⌖', '✎'];

export default function Courses() {
  const [refreshing, setRefreshing] = useState(false);
  const [openChapterFor, setOpenChapterFor] = useState<string | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string>>({});

  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: () => unwrap<CourseDto[]>(api.get('/api/courses')),
  });

  const detailQueries = useQuery({
    queryKey: ['course-details', courses.data?.map((c) => c.id)],
    queryFn: async () => {
      const ids = courses.data ?? [];
      const results: Record<string, CourseDetailDto> = {};
      for (const c of ids) {
        try {
          results[c.id] = await unwrap<CourseDetailDto>(api.get(`/api/courses/${c.id}`));
        } catch { }
      }
      return results;
    },
    enabled: !!courses.data && courses.data.length > 0,
  });

  const assignmentQueries = useQuery({
    queryKey: ['assignments', courses.data?.map((c) => c.id)],
    queryFn: async () => {
      const ids = courses.data ?? [];
      const results: Record<string, AssignmentDto[]> = {};
      for (const c of ids) {
        try {
          results[c.id] = await unwrap<AssignmentDto[]>(api.get(`/api/courses/${c.id}/assignments`));
        } catch { }
      }
      return results;
    },
    enabled: !!courses.data && courses.data.length > 0,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([courses.refetch(), detailQueries.refetch(), assignmentQueries.refetch()]);
    setRefreshing(false);
  }, [courses, detailQueries, assignmentQueries]);

  const nextAssignment = (courseId: string) => {
    const assignments = assignmentQueries.data?.[courseId];
    if (!assignments || assignments.length === 0) return null;
    const upcoming = assignments
      .filter((a) => new Date(a.dueAt) > new Date())
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    return upcoming[0] ?? assignments[0];
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.h1}>Mes Cours</Text>
        <Text style={styles.h1Sub}>Semestre d’Automne 2026 – 2027</Text>

        {(courses.isLoading || detailQueries.isLoading) && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}

        {courses.data?.map((c, i) => {
          const sections = detailQueries.data?.[c.id]?.sections ?? [];
          const defaultChapter = sections.length > 0 ? sections[0].title : 'Chapitre 1';
          const selectedChapter = selectedChapters[c.id] ?? defaultChapter;
          const chapterOpen = openChapterFor === c.id;
          const assignment = nextAssignment(c.id);
          const done = assignment == null;

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
              <Text style={styles.courseProf}>{c.lmsSource === 'MOODLE' ? 'Moodle' : 'Google Classroom'}</Text>
              <View style={styles.chapterBlock}>
                <Text style={styles.chapterLabel}>Chapitres</Text>
                <Pressable
                  style={styles.chapterSelect}
                  onPress={() => setOpenChapterFor(chapterOpen ? null : c.id)}
                >
                  <Text style={styles.chapterSelectText}>{selectedChapter}</Text>
                  <Text style={styles.chapterChevron}>{chapterOpen ? '⌃' : '⌄'}</Text>
                </Pressable>
                {chapterOpen && sections.length > 0 && (
                  <View style={styles.chapterMenu}>
                    {sections.map((section) => (
                      <Pressable
                        key={section.id}
                        style={[styles.chapterOption, selectedChapter === section.title && styles.chapterOptionActive]}
                        onPress={() => {
                          setSelectedChapters((prev) => ({ ...prev, [c.id]: section.title }));
                          setOpenChapterFor(null);
                        }}
                      >
                        <Text style={[styles.chapterOptionText, selectedChapter === section.title && styles.chapterOptionTextActive]}>
                          {section.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              {assignment && (
                <View style={styles.assignmentBox}>
                  <Text style={styles.assignmentLabel}>Prochain devoir</Text>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <Text style={styles.assignmentDue}>{fmtDate(assignment.dueAt)}</Text>
                </View>
              )}
              {assignment && (
                <View style={{ marginTop: spacing.md }}>
                  <ProgressBar pct={Math.min(100, (assignment.complexity ?? 0) * 25)} />
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.round(diff / 86400000);
  if (days < 0) return 'En retard';
  if (days === 0) return 'Aujourd\'hui';
  if (days === 1) return 'Demain';
  return `À rendre dans ${days} jours`;
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
