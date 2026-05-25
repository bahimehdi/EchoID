import { Pressable, View, Text, Image, Linking, StyleSheet } from 'react-native';
import { colors, fontSize, radius, shadow, spacing } from '../lib/theme';

export type VideoCardProps = {
  title: string;
  channel: string;
  url: string;
  thumbnailUrl?: string | null;
  videoId?: string | null;
  durationSec?: number | null;
  viewCount?: number | null;
  likeCount?: number | null;
  score?: number | null;
  transcriptExcerpt?: string | null;
};

const compact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')} k`;
  return `${n}`;
};

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
};

const fallbackThumb = (url: string): string | null => {
  const m = url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/mqdefault.jpg` : null;
};

export default function VideoCard({ title, channel, url, thumbnailUrl, durationSec, viewCount, likeCount, score, transcriptExcerpt }: VideoCardProps) {
  const thumb = thumbnailUrl ?? fallbackThumb(url);
  return (
    <Pressable onPress={() => Linking.openURL(url)} style={styles.card}>
      <View style={styles.thumbWrap}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Text style={{ color: '#fff', fontSize: 28 }}>▶</Text>
          </View>
        )}
        {durationSec != null && durationSec > 0 && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{fmt(durationSec)}</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.channel} numberOfLines={1}>{channel}</Text>
        {(viewCount != null || likeCount != null) && (
          <View style={styles.metaRow}>
            {viewCount != null && <Text style={styles.metaText}>👁  {compact(viewCount)}</Text>}
            {likeCount != null && <Text style={styles.metaText}>👍  {compact(likeCount)}</Text>}
          </View>
        )}
        {score != null && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>🎯  Pertinence {Math.round(score * 100)}%</Text>
          </View>
        )}
        {transcriptExcerpt && (
          <Text style={styles.excerpt} numberOfLines={2}>{transcriptExcerpt}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  thumbWrap: { position: 'relative', backgroundColor: '#0B1B45' },
  thumb: { width: '100%', aspectRatio: 16 / 9 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  duration: {
    position: 'absolute', right: 6, bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '700' },
  playOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: {
    color: '#fff', fontSize: 22, fontWeight: '900',
    width: 44, height: 44, borderRadius: 22, lineHeight: 44, textAlign: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
    overflow: 'hidden',
  },
  body: { padding: spacing.md },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', lineHeight: 20 },
  channel: { color: colors.textMuted, fontSize: fontSize.sm },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: 4 },
  metaText: { color: colors.textSubtle, fontSize: fontSize.xs, fontWeight: '600' },
  excerpt: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic', marginTop: 4, lineHeight: 16 },
  scorePill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill,
  },
  scoreText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
});
