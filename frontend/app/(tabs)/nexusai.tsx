import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api, unwrap } from '../../lib/api';
import type { OcrResponse } from '../../lib/types';
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

const MODULES = [
  'Algèbre linéaire et calcul matriciel',
  'Thermodynamique générale',
  'Chimie',
  'Probabilités et statistiques',
  'Traitement du signal',
  'Algorithmique & Programmation (Python)',
];

const CHAPTERS = ['Chapitre 1', 'Chapitre 2', 'Chapitre 3', 'Chapitre 4'];

const DEMO_EXPLANATION = `Dans ton TD, le point décisif n’est pas seulement le fait que la matrice ait une seule valeur propre λ de multiplicité algébrique 3. Ce qui décide la diagonalisation, c’est la dimension de l’espace propre associé.

Tu dois résoudre (A - λI₃)X = 0. L’ensemble des solutions est Eλ = Ker(A - λI₃). Si dim(Eλ) = 3, alors tu as trois vecteurs propres linéairement indépendants dans R³ : la matrice est diagonalisable. Tu formes alors P avec ces trois vecteurs propres en colonnes, et D = diag(λ, λ, λ), donc A = PDP⁻¹.

Si dim(Eλ) vaut 1 ou 2, il manque des vecteurs propres pour former une base de R³ : la matrice n’est pas diagonalisable.

Cas important pour ton oral : une matrice 3x3 qui n’a qu’une seule valeur propre peut être diagonalisable seulement si son espace propre est de dimension 3. Dans ce cas, comme D = λI₃, on obtient même A = λI₃. Donc en pratique, si A n’est pas déjà égale à λI₃, elle ne sera pas diagonalisable dans ce scénario.`;

const DEMO_KEY_POINTS = [
  'Multiplicité algébrique : λ apparaît trois fois dans le polynôme caractéristique.',
  'Multiplicité géométrique : dim Ker(A - λI₃). C’est elle qu’il faut calculer.',
  'Diagonalisable ⇔ multiplicité géométrique = multiplicité algébrique = 3.',
  'Si la dimension est 3, P est formée avec trois vecteurs propres indépendants et D = λI₃.',
];

const DEMO_VIDEOS: VideoCardProps[] = [
  {
    title: 'Vidéo exacte — matrice 3x3 avec une seule valeur propre',
    channel: 'YouTube',
    url: 'https://www.youtube.com/watch?v=l1GM65A-VR4',
    videoId: 'l1GM65A-VR4',
    thumbnailUrl: 'https://i.ytimg.com/vi/l1GM65A-VR4/hqdefault.jpg',
  },
  {
    title: 'Diagonaliser une matrice 3×3 — exercice',
    channel: 'Maths-Et-Tiques',
    url: 'https://www.youtube.com/watch?v=EUtdnH4jQpo',
    videoId: 'EUtdnH4jQpo',
    thumbnailUrl: 'https://i.ytimg.com/vi/EUtdnH4jQpo/hqdefault.jpg',
  },
  {
    title: 'Polynôme caractéristique, valeurs propres et diagonalisation',
    channel: 'Maths Express',
    url: 'https://www.youtube.com/watch?v=300lX-fnIEg',
    videoId: '300lX-fnIEg',
    thumbnailUrl: 'https://i.ytimg.com/vi/300lX-fnIEg/hqdefault.jpg',
  },
];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function NexusAI() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [selectedChapter, setSelectedChapter] = useState('Chapitre 3');
  const [moduleOpen, setModuleOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scroller = useRef<ScrollView | null>(null);

  useEffect(() => {
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, busy]);

  const ask = async () => {
    const display = input.trim();
    if (!display || busy) return;

    setInput('');
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', text: display }]);

    try {
      await wait(3000);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: DEMO_EXPLANATION,
          keyPoints: DEMO_KEY_POINTS,
          videos: DEMO_VIDEOS,
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
            <Text style={styles.selectText}>{selectedModule}</Text>
            <Text style={styles.selectChevron}>{moduleOpen ? '⌃' : '⌄'}</Text>
          </Pressable>
          {moduleOpen && (
            <View style={styles.selectMenu}>
              {MODULES.map((module) => (
                <Pressable
                  key={module}
                  style={[styles.selectOption, selectedModule === module && styles.selectOptionActive]}
                  onPress={() => {
                    setSelectedModule(module);
                    setModuleOpen(false);
                  }}
                >
                  <Text style={[styles.selectOptionText, selectedModule === module && styles.selectOptionTextActive]}>
                    {module}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {selectedModule === MODULES[0] && (
            <View style={styles.chapterArea}>
              <Text style={[styles.selectorLabel, styles.chapterSelectorLabel]}>Chapitre</Text>
              <Pressable style={styles.selectBtn} onPress={() => setChapterOpen((v) => !v)}>
                <Text style={styles.selectText}>{selectedChapter}</Text>
                <Text style={styles.selectChevron}>{chapterOpen ? '⌃' : '⌄'}</Text>
              </Pressable>
              {chapterOpen && (
                <View style={styles.selectMenu}>
                  {CHAPTERS.map((chapter) => (
                    <Pressable
                      key={chapter}
                      style={[styles.selectOption, selectedChapter === chapter && styles.selectOptionActive]}
                      onPress={() => {
                        setSelectedChapter(chapter);
                        setChapterOpen(false);
                      }}
                    >
                      <Text style={[styles.selectOptionText, selectedChapter === chapter && styles.selectOptionTextActive]}>
                        {chapter}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {selectedChapter === 'Chapitre 3' && (
                <View style={styles.chapterBox}>
                  <Text style={styles.chapterLabel}>Concept du TD</Text>
                  <Text style={styles.chapterTitle}>Diagonalisation d’une matrice</Text>
                </View>
              )}
            </View>
          )}
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
  chapterBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  chapterLabel: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chapterTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800', marginTop: 2 },

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
