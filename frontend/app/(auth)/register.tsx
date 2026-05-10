import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { api } from '../../lib/api';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('ENSAK');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (!email.endsWith('@uit.ac.ma')) {
      Alert.alert('Email invalide', 'Tu dois utiliser une adresse @uit.ac.ma.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', { fullName, email, password, school, role: 'STUDENT' });
      Alert.alert(
        'Vérifie ta boîte mail',
        'Un lien de vérification vient de t’être envoyé. Ouvre-le pour activer ton compte.'
      );
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Inscription échouée', e?.response?.data?.message ?? 'Réessaye.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Réservé aux étudiants UIT — @uit.ac.ma</Text>

      <TextInput style={styles.input} placeholder="Nom complet" placeholderTextColor="#64748B" value={fullName} onChangeText={setFullName} />
      <TextInput
        style={styles.input}
        placeholder="prenom.nom@uit.ac.ma"
        placeholderTextColor="#64748B"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#64748B" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="École (ex. ENSAK)" placeholderTextColor="#64748B" value={school} onChangeText={setSchool} autoCapitalize="characters" />

      <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Créer mon compte</Text>}
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        Déjà un compte ? Se connecter
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 24, paddingTop: 64, backgroundColor: '#0F172A', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 24 },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  primaryBtn: { backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#A5B4FC', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
