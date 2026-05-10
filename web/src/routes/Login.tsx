import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, session } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await api.post('/api/auth/login', { email, password });
      const env = r.data;
      if (!env.success) throw new Error(env.message ?? 'Connexion échouée');
      const { accessToken, user } = env.data;
      if (user.role !== 'PROFESSOR' && user.role !== 'ADMIN') {
        throw new Error('Cette console est réservée aux enseignants et administrateurs.');
      }
      session.save(accessToken, user);
      nav(user.role === 'ADMIN' ? '/admin' : '/professor', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} style={card}>
        <h1 style={{ margin: 0, fontSize: 28 }}>EchoID Nexus</h1>
        <p style={{ color: '#94A3B8', marginTop: 4 }}>Console enseignants & administrateurs</p>

        <label style={lbl}>Email</label>
        <input
          style={inp}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="prenom.nom@uit.ac.ma"
          required
        />

        <label style={lbl}>Mot de passe</label>
        <input
          style={inp}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={errStyle}>{error}</p>}

        <button type="submit" disabled={loading} style={btn}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#1E293B', borderRadius: 16, padding: 32, width: 380,
  display: 'flex', flexDirection: 'column', gap: 8,
};
const lbl: React.CSSProperties = { color: '#94A3B8', fontSize: 12, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 };
const inp: React.CSSProperties = {
  background: '#0F172A', color: '#F8FAFC', border: '1px solid #334155',
  borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none',
};
const btn: React.CSSProperties = {
  background: '#6366F1', color: '#fff', border: 'none', borderRadius: 8,
  padding: '12px 16px', fontWeight: 700, cursor: 'pointer', marginTop: 16,
};
const errStyle: React.CSSProperties = { color: '#F87171', fontSize: 13, marginTop: 8 };
