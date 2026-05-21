import { View, Text, Pressable, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { api, unwrap } from '../../lib/api';
import type { UserProfileDto } from '../../lib/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Header from '../../components/Header';

const profileImage = require('../../assets/pfp-user.png');

const SCHOOL_LABEL: Record<string, string> = {
  ENSA: 'ENSA Kénitra',
  EST: 'EST Kénitra',
  FAC: 'Faculté des Sciences',
  OTHER: 'UIT',
};

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Génie Informatique – 2ème Année',
  PROFESSOR: 'Professeur',
  ADMIN: 'Administrateur',
};

export default function Profile() {
  const { user, clear } = useAuth();

  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: () => unwrap<UserProfileDto>(api.get('/api/users/me')),
  });

  const fullName = profile.data?.fullName ?? user?.fullName ?? 'Étudiant';
  const school = profile.data?.school ?? user?.school ?? 'ENSA';
  const filiere = ROLE_LABEL[profile.data?.role ?? user?.role ?? ''] ?? '';

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}>
        {profile.isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}

        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Image source={profileImage} style={styles.profileImage} resizeMode="cover" />
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.role}>{filiere}</Text>
          <View style={{ marginTop: spacing.sm }}>
            <Badge tone="primary">● {profile.data?.emailVerified ? 'Actif' : 'En attente'}</Badge>
          </View>
        </View>

        <Section title="🎓  Informations Académiques">
          <Row label="Email" value={profile.data?.email ?? user?.email ?? '-'} />
          <Row label="Établissement" value={SCHOOL_LABEL[school] ?? school} />
          <Row label="Rôle" value={ROLE_LABEL[profile.data?.role ?? user?.role ?? ''] ?? profile.data?.role ?? user?.role ?? '-'} />
        </Section>

        <Section title="⚙  Préférences">
          <NavRow label="Langue de l’interface" right="Français ›" icon="🌐" />
          <NavRow label="Notifications Push" right="Activé ›" icon="🔔" />
          <NavRow label="Sécurité & Mot de passe" right="›" icon="🔒" />
        </Section>

        <Section title="?  Assistance">
          <NavRow label="Contacter l’administration" sub="Scolarité et requêtes" icon="✉" />
          <NavRow label="Guide de l’étudiant" sub="Règlement et procédures" icon="📖" />
        </Section>

        <Pressable onPress={() => clear()} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>↪  Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>{children}</View>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function NavRow({ label, sub, right, icon }: { label: string; sub?: string; right?: string; icon?: string }) {
  return (
    <Pressable style={styles.navRow}>
      {icon && (
        <View style={styles.navIcon}>
          <Text style={styles.navIconText}>{icon}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.navLabel}>{label}</Text>
        {sub && <Text style={styles.navSub}>{sub}</Text>}
      </View>
      {right && <Text style={styles.navRight}>{right}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  name: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: spacing.md },
  role: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  rowValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },

  navRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  navIcon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  navIconText: { fontSize: 14 },
  navLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  navSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  navRight: { color: colors.textMuted, fontSize: fontSize.sm },

  signOutBtn: {
    marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.accentRed, alignItems: 'center',
  },
  signOutText: { color: colors.accentRed, fontWeight: '800', fontSize: fontSize.md },
});
