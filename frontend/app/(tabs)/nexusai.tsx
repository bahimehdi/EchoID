import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api, unwrap } from '../../lib/api';
import type { ExplainResponse, OcrResponse, ExplanationLevel } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Header from '../../components/Header';
import VideoCard, { VideoCardProps } from '../../components/VideoCard';

type VideosPayload = {
  conceptSlug: string;
  videos: Array<VideoCardProps>;
  isFallback: boolean;
};

type ChatMsg =
  | { role: 'user'; text: string }
  | {
      role: 'assistant';
      text: string;
      keyPoints?: string[];
      isFallback?: boolean;
      videos?: VideoCardProps[];
    }
  | { role: 'system'; text: string };

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Display text + the exact concept_slug from the curated fixture catalogue.
// Tapping a chip dispatches the slug directly; free-text input still goes
// through the slugifier but won't match these (it falls back to the generic
// answer).
const SUGGESTIONS: Array<{ display: string; slug: string }> = [
  { display: '1er principe de la thermodynamique', slug: 'thermo-1er-principe' },
  { display: 'Diagonalisation d’une matrice',      slug: 'algebre-diagonalisation' },
  { display: 'Récursivité en Python',              slug: 'algo-recursivite' },
  { display: 'Théorème de Bayes',                  slug: 'proba-bayes' },
  { display: 'Transformée de Fourier discrète',    slug: 'signal-fourier' },
  { display: 'Lentilles minces',                   slug: 'optique-lentilles-minces' },
  { display: 'Lois de Newton',                     slug: 'mecanique-newton' },
  { display: 'Théorème de Gauss',                  slug: 'electrostatique-gauss' },
  { display: 'Limites et continuité',              slug: 'analyse-limites' },
  { display: 'Séries numériques',                  slug: 'analyse-series' },
  { display: 'Équilibres chimiques',               slug: 'chimie-equilibre' },
  { display: 'Amplificateur opérationnel',         slug: 'electronique-amplificateur-op' },
];

export default function NexusAI() {
  const [level, setLevel] = useState<ExplanationLevel>('beginner');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: 'Bonjour ! Je suis NexusAI, ton assistant pédagogique. Pose-moi une question, choisis un concept, ou importe un document à analyser.' },
  ]);
  const scroller = useRef<ScrollView | null>(null);

  useEffect(() => {
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const ask = async (opts?: { display?: string; slug?: string }) => {
    const display = (opts?.display ?? input).trim();
    if (!display) return;
    setInput('');
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', text: display }]);
    try {
      // Curated slug if the user tapped a suggestion; otherwise slugified input.
      const slug = opts?.slug ?? slugify(display);
      const r = await unwrap<ExplainResponse>(
        api.post('/api/ai/explain', { conceptSlug: slug, level }),
      );
      // Use the explainer's mapping back to its own video catalogue when present.
      const vidSlug = r.videosSlug ?? slug;
      let videos: VideoCardProps[] = [];
      try {
        const vp = await unwrap<VideosPayload>(api.post('/api/ai/videos', { conceptSlug: vidSlug }));
        // Filter out fallback / placeholder videos: they have no videoId.
        videos = (vp.videos ?? []).filter((v) => !!v.videoId);
      } catch { /* videos optional; explanation still shown */ }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: r.explanation,
          keyPoints: r.keyPoints,
          isFallback: r.isFallback,
          videos,
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Le service AI est momentanément indisponible.' },
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
    setMessages((prev) => [...prev, { role: 'user', text: `📎 ${file.name}` }]);
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
      <Header title="Université Ibn Tofaïl" />
      <View style={styles.contextRow}>
        <Pill label="Algorithmique Avancée" />
        <Pill label="Chap. 2 — Graphes" />
      </View>

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 24 }}
        style={{ flex: 1 }}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === 'user' ? styles.msgRowUser : null]}>
            {m.role === 'system' ? (
              <Text style={styles.systemMsg}>{m.text}</Text>
            ) : (
              <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                {m.role === 'assistant' && m.isFallback && (
                  <Text style={styles.fallbackTag}>Réponse générique</Text>
                )}
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
                <Text style={styles.videoSectionTitle}>
                  Vidéos pédagogiques sur ce concept
                </Text>
                {m.videos.map((v, j) => (
                  <VideoCard key={`${v.url}-${j}`} {...v} />
                ))}
              </View>
            )}
          </View>
        ))}

        {busy && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />}

        {messages.length <= 1 && (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.suggestionsLabel}>Concepts suggérés</Text>
            <View style={styles.suggestionsWrap}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s.slug}
                  onPress={() => ask({ display: s.display, slug: s.slug })}
                  style={styles.suggestion}
                >
                  <Text style={styles.suggestionText}>{s.display}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.levelRow}>
        {(['beginner', 'visual', 'advanced'] as ExplanationLevel[]).map((l) => (
          <Pressable key={l} onPress={() => setLevel(l)} style={[styles.levelBtn, level === l && styles.levelBtnActive]}>
            <Text style={[styles.levelText, level === l && styles.levelTextActive]}>
              {l === 'beginner' ? 'Débutant' : l === 'visual' ? 'Visuel' : 'Avancé'}
            </Text>
          </Pressable>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <Pressable onPress={upload} hitSlop={8} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>📎</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Pose une question à NexusAI…"
            placeholderTextColor={colors.textSubtle}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => ask({})}
            returnKeyType="send"
          />
          <Pressable onPress={() => ask({})} style={styles.sendBtn} disabled={busy}>
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  contextRow: {
    flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pill: { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },

  msgRow: { marginBottom: spacing.md },
  msgRowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg },
  bubbleAi: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...{ shadowColor: '#0B1B45', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 } },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { color: colors.text, fontSize: fontSize.md, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  fallbackTag: { color: colors.accentOrange, fontSize: fontSize.xs, fontWeight: '700', marginBottom: 6 },
  keyPoint: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  systemMsg: { color: colors.textSubtle, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', marginVertical: spacing.sm },

  videoSection: { marginTop: spacing.md, gap: spacing.xs },
  videoSectionTitle: {
    color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm,
  },

  suggestionsLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  suggestionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  suggestion: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  suggestionText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },

  levelRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  levelBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  levelBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  levelText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  levelTextActive: { color: '#fff' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 18 },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '900' },
});
