import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '../../lib/api';
import type { OcrResponse, ExplainResponse, ExplanationLevel, CourseDto, CourseDetailDto } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import VideoCard, { VideoCardProps } from '../../components/VideoCard';

type ChatMsg =
  | { role: 'user'; text: string }
  | {
      role: 'assistant';
      text: string;
      keyPoints?: string[];
      videos?: VideoCardProps[];
    }
  | { role: 'system'; text: string };

const LEVELS: { key: ExplanationLevel; label: string }[] = [
  { key: 'visual', label: 'Visuel' },
  { key: 'beginner', label: 'Débutant' },
  { key: 'advanced', label: 'Avancé' },
];

const TITLE_SLUG: Record<string, string> = {
  'Algèbre linéaire et calcul matriciel': 'algebre-diagonalisation',
  'Thermodynamique générale': 'thermo-1er-principe',
  'Chimie': 'chimie-equilibre',
  'Probabilités et statistiques': 'proba-bayes',
  'Traitement du signal': 'signal-fourier',
  'Algorithmique & Programmation (Python)': 'algo-recursivite',
};

function courseSlug(title: string): string {
  return TITLE_SLUG[title] ?? title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-+$/, '');
}

export default function NexusAI() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<ExplanationLevel>('visual');
  const [moduleOpen, setModuleOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scroller = useRef<ScrollView | null>(null);

  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: () => unwrap<CourseDto[]>(api.get('/api/courses')),
  });

  const moduleList = courses.data ?? [];
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const selectedCourse = moduleList.find((c) => c.id === selectedCourseId) ?? moduleList[0] ?? null;
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['course-detail', selectedCourse?.id],
    queryFn: () => unwrap<CourseDetailDto>(api.get(`/api/courses/${selectedCourse!.id}`)),
    enabled: !!selectedCourse?.id,
  });

  const sections = detail.data?.sections ?? [];
  useEffect(() => {
    if (sections.length > 0 && (!selectedChapter || !sections.some((s) => s.title === selectedChapter))) {
      setSelectedChapter(sections[0].title);
    }
  }, [sections, selectedChapter]);

  useEffect(() => {
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, busy]);

  const ask = async () => {
    const display = input.trim();
    if (!display || busy) return;

    const slug = selectedCourse ? courseSlug(selectedCourse.title) : 'algebre-diagonalisation';
    setInput('');
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', text: display }]);

    try {
      const [explainRes, videosRes] = await Promise.allSettled([
        unwrap<ExplainResponse>(api.post('/api/ai/explain', { conceptSlug: slug, level: selectedLevel })),
        api.post('/api/ai/videos', { conceptSlug: slug }),
      ]);

      const explain = explainRes.status === 'fulfilled' ? explainRes.value : null;

      let videos: VideoCardProps[] = [];
      if (videosRes.status === 'fulfilled') {
        const vData: any = videosRes.value.data?.data ?? videosRes.value.data;
        videos = (vData?.videos ?? []).map((v: any) => ({
          title: v.title ?? 'Vidéo',
          channel: v.channel ?? v.channelTitle ?? 'YouTube',
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          videoId: v.videoId,
          thumbnailUrl: v.thumbnailUrl ?? v.thumbnail ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          score: v.transcriptScore ?? v.score,
          transcriptExcerpt: v.matchedExcerpt,
        }));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: explain?.explanation ?? 'Désolé, l\'explication n\'est pas disponible pour le moment.',
          keyPoints: explain?.keyPoints,
          videos: videos.length > 0 ? videos : undefined,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'], copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const file = picked.assets[0];
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', text: `Document importé : ${file.name}` }]);
    const form = new FormData();
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' } as any);
    try {
      const r = await unwrap<OcrResponse>(api.post('/api/ai/ocr/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }));
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `J'ai extrait ce contenu (${Math.round(r.confidence * 100)}% de confiance) :\n\n${r.extractedText}`,
          keyPoints: r.indexedConcepts.map((s) => `Concept détecté : ${s}`),
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'system', text: 'L’OCR a échoué. Réessaye avec un autre fichier.' }]);
    } finally { setBusy(false); }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroller}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 24 }}
        style={{ flex: 1 }}
      >
        <View style={styles.selectorPanel}>
          <Text style={styles.selectorLabel}>Module</Text>
          <Pressable style={styles.selectBtn} onPress={() => setModuleOpen((v) => !v)}>
            <Text style={styles.selectText}>{selectedCourse?.title ?? 'Chargement...'}</Text>
            <Text style={styles.selectChevron}>{moduleOpen ? '⌃' : '⌄'}</Text>
          </Pressable>
          {moduleOpen && (
            <View style={styles.selectMenu}>
              {moduleList.map((course) => (
                <Pressable
                  key={course.id}
                  style={[styles.selectOption, selectedCourse?.id === course.id && styles.selectOptionActive]}
                  onPress={() => {
                    setSelectedCourseId(course.id);
                    setModuleOpen(false);
                  }}
                >
                  <Text style={[styles.selectOptionText, selectedCourse?.id === course.id && styles.selectOptionTextActive]}>
                    {course.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {sections.length > 0 && (
            <View style={styles.chapterArea}>
              <Text style={[styles.selectorLabel, styles.chapterSelectorLabel]}>Chapitre</Text>
              <Pressable style={styles.selectBtn} onPress={() => setChapterOpen((v) => !v)}>
                <Text style={styles.selectText}>{selectedChapter}</Text>
                <Text style={styles.selectChevron}>{chapterOpen ? '⌃' : '⌄'}</Text>
              </Pressable>
              {chapterOpen && (
                <View style={styles.selectMenu}>
                  {sections.map((section) => (
                    <Pressable
                      key={section.id}
                      style={[styles.selectOption, selectedChapter === section.title && styles.selectOptionActive]}
                      onPress={() => {
                        setSelectedChapter(section.title);
                        setChapterOpen(false);
                      }}
                    >
                      <Text style={[styles.selectOptionText, selectedChapter === section.title && styles.selectOptionTextActive]}>
                        {section.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
          <Text style={[styles.selectorLabel, { marginTop: spacing.md }]}>Niveau d’explication</Text>
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <Pressable
                key={l.key}
                style={[styles.levelBtn, selectedLevel === l.key && styles.levelBtnActive]}
                onPress={() => setSelectedLevel(l.key)}
              >
                <Text style={[styles.levelBtnText, selectedLevel === l.key && styles.levelBtnTextActive]}>
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === 'user' ? styles.msgRowUser : null]}>
            {m.role === 'system' ? (
              <Text style={styles.systemMsg}>{m.text}</Text>
            ) : (
              <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.bubbleText, m.role === 'user' && styles.bubbleTextUser]}>{m.text}</Text>
                {m.role === 'assistant' && m.keyPoints && m.keyPoints.length > 0 && (
                  <View style={{ marginTop: spacing.sm }}>
                    {m.keyPoints.map((kp, j) => (
                      <Text key={j} style={styles.keyPoint}>•  {kp}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
            {m.role === 'assistant' && m.videos && m.videos.length > 0 && (
              <View style={styles.videoSection}>
                <Text style={styles.videoSectionTitle}>Vidéo recommandée pour ce TD</Text>
                {m.videos.map((v, j) => (
                  <VideoCard key={`${v.url}-${j}`} {...v} />
                ))}
              </View>
            )}
          </View>
        ))}

        {busy && (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>NexusAI rédige la réponse...</Text>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <Pressable onPress={upload} hitSlop={8} style={styles.iconBtn} disabled={busy}>
            <Text style={styles.iconBtnText}>📎</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Pose une question à NexusAI…"
            placeholderTextColor={colors.textSubtle}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={ask}
            returnKeyType="send"
            editable={!busy}
            multiline
          />
          <Pressable onPress={ask} style={[styles.sendBtn, busy && styles.sendBtnDisabled]} disabled={busy}>
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  selectorPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  selectorLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: { flex: 1, color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  selectChevron: { color: colors.primary, fontSize: 18, fontWeight: '900', marginLeft: spacing.sm },
  selectMenu: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  selectOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  selectOptionActive: { backgroundColor: colors.primarySoft },
  selectOptionText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  selectOptionTextActive: { color: colors.primary, fontWeight: '800' },
  chapterArea: { marginTop: spacing.md },
  chapterSelectorLabel: { marginTop: 0 },

  msgRow: { marginBottom: spacing.md },
  msgRowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '88%', padding: spacing.md, borderRadius: radius.lg },
  bubbleAi: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...{ shadowColor: '#0B1B45', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 } },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { color: colors.text, fontSize: fontSize.md, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  keyPoint: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  systemMsg: { color: colors.textSubtle, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', marginVertical: spacing.sm },

  loadingCard: {
    alignSelf: 'center',
    minWidth: 210,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  loadingText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },

  levelRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  levelBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  levelBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  levelBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  levelBtnTextActive: { color: '#fff' },

  videoSection: { marginTop: spacing.md, gap: spacing.xs },
  videoSectionTitle: {
    color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm,
  },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 18 },
  input: {
    flex: 1,
    maxHeight: 96,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 8,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '900' },
});
