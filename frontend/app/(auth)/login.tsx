import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Image, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, fontSize, radius, shadow, spacing } from '../../lib/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [apogee, setApogee] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const setSession = useAuth((s) => s.setSession);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const r = await api.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken, user } = r.data.data;
      await setSession({ accessToken, refreshToken, user });
    } catch (e: any) {
      Alert.alert('Connexion échouée', e?.response?.data?.message ?? 'Vérifie tes identifiants.');
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut — tap the SSO button to auto-fill the demo student account.
  const ssoDemo = () => {
    setEmail('mehdi.bahi@uit.ac.ma');
    setPassword('Demo!2026');
  };

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <View style={styles.brand}>
        <Text style={styles.appName}>EchoID Nexus</Text>
        <Image
          source={require('../../assets/uit-logo.png')}
          style={styles.uitLogo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Accès sécurisé à votre espace académique</Text>
      </View>

      <Pressable onPress={ssoDemo} style={styles.ssoBtn}>
        <View style={styles.ssoIcon} />
        <Text style={styles.ssoText}>Continuer avec @uit.ac.ma</Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email Universitaire</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            style={styles.input}
            placeholder="prenom.nom@uit.ac.ma"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Numéro APOGEE</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>▤</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 240464"
            placeholderTextColor={colors.textSubtle}
            keyboardType="number-pad"
            maxLength={6}
            value={apogee}
            onChangeText={(t) => setApogee(t.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Mot de passe</Text>
          <Pressable hitSlop={6}>
            <Text style={styles.linkText}>Mot de passe oublié ?</Text>
          </Pressable>
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>⚿</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={6}>
            <Text style={styles.eye}>{showPwd ? '⊙' : '⊘'}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Se connecter  →</Text>}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Besoin d’aide ?{' '}</Text>
        <Link href="/(auth)/register" style={styles.footerLink}>
          Contacter le support IT
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.xl, paddingTop: 56, backgroundColor: colors.bg, flexGrow: 1 },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  appName: { fontSize: fontSize.display, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  uitLogo: { width: 220, height: 90, marginVertical: spacing.md },
  tagline: { color: colors.textMuted, fontSize: fontSize.md },

  ssoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingVertical: 14, paddingHorizontal: spacing.lg, gap: spacing.md,
    borderWidth: 1, borderColor: colors.border, ...shadow.card,
  },
  ssoIcon: { width: 22, height: 22, borderRadius: 4, backgroundColor: colors.primary },
  ssoText: { color: colors.text, fontWeight: '700', fontSize: fontSize.base },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: fontSize.sm, marginHorizontal: spacing.md, textTransform: 'uppercase' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, gap: spacing.md, ...shadow.card,
  },
  label: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  inputIcon: { color: colors.textSubtle, fontSize: 16, marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 12, fontSize: fontSize.base, color: colors.text },
  eye: { color: colors.textMuted, fontSize: 18 },

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: fontSize.sm },
  footerLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
});
