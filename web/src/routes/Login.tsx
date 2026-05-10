import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, session } from '../lib/api';
import { colors, fontSize, radius, shadow, spacing } from '../lib/theme';

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
      session.clear();
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
    <main style={page}>
      <section style={brandPanel}>
        <div style={logo}>UIT</div>
        <p style={eyebrow}>EchoID Nexus</p>
        <h1 style={title}>Console UIT</h1>
        <p style={subtitle}>Pilotage pédagogique pour enseignants et administrateurs ENSAK.</p>
      </section>

      <form onSubmit={submit} style={card}>
        <div>
          <p style={formEyebrow}>Connexion</p>
          <h2 style={formTitle}>Accès sécurisé</h2>
        </div>

        <button type="button" style={ssoBtn}>
          Continuer avec SSO UIT
        </button>

        <div style={divider}>
          <span style={line} />
          <span style={dividerText}>ou</span>
          <span style={line} />
        </div>

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

        <button type="submit" disabled={loading} style={{ ...btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}

const page: React.CSSProperties = {
  alignItems: 'center',
  background: colors.bg,
  boxSizing: 'border-box',
  color: colors.text,
  display: 'grid',
  gap: spacing.xxl,
  gridTemplateColumns: 'minmax(260px, 0.9fr) minmax(360px, 420px)',
  minHeight: '100vh',
  padding: 'clamp(24px, 5vw, 72px)',
};

const brandPanel: React.CSSProperties = {
  maxWidth: 560,
};

const logo: React.CSSProperties = {
  alignItems: 'center',
  background: colors.primary,
  borderRadius: radius.lg,
  boxShadow: shadow.raised,
  color: '#fff',
  display: 'grid',
  fontSize: fontSize.xl,
  fontWeight: 900,
  height: 74,
  justifyItems: 'center',
  letterSpacing: 0.8,
  width: 74,
};

const eyebrow: React.CSSProperties = {
  color: colors.primary,
  fontSize: fontSize.sm,
  fontWeight: 900,
  letterSpacing: 0.8,
  margin: `${spacing.xl}px 0 ${spacing.sm}px`,
  textTransform: 'uppercase',
};

const title: React.CSSProperties = {
  color: colors.text,
  fontSize: 48,
  fontWeight: 900,
  letterSpacing: 0,
  lineHeight: 1,
  margin: 0,
};

const subtitle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.lg,
  lineHeight: 1.55,
  margin: `${spacing.lg}px 0 0`,
  maxWidth: 440,
};

const card: React.CSSProperties = {
  background: colors.surface,
  borderRadius: radius.xl,
  boxShadow: shadow.raised,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.sm,
  padding: spacing.xxl,
  width: '100%',
};

const formEyebrow: React.CSSProperties = {
  color: colors.primary,
  fontSize: fontSize.xs,
  fontWeight: 900,
  letterSpacing: 0.7,
  margin: 0,
  textTransform: 'uppercase',
};

const formTitle: React.CSSProperties = {
  color: colors.text,
  fontSize: fontSize.xxl,
  fontWeight: 900,
  margin: `${spacing.xs}px 0 ${spacing.md}px`,
};

const ssoBtn: React.CSSProperties = {
  background: colors.primary,
  border: 0,
  borderRadius: radius.md,
  color: '#fff',
  cursor: 'pointer',
  fontSize: fontSize.md,
  fontWeight: 900,
  padding: '13px 16px',
};

const divider: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.md,
  margin: `${spacing.md}px 0 ${spacing.xs}px`,
};

const line: React.CSSProperties = {
  background: colors.border,
  flex: 1,
  height: 1,
};

const dividerText: React.CSSProperties = {
  color: colors.textSubtle,
  fontSize: fontSize.sm,
  fontWeight: 800,
};

const lbl: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.xs,
  fontWeight: 900,
  letterSpacing: 0.6,
  marginTop: spacing.sm,
  textTransform: 'uppercase',
};

const inp: React.CSSProperties = {
  background: colors.surfaceMuted,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  color: colors.text,
  fontSize: fontSize.md,
  outline: 'none',
  padding: '12px 14px',
};

const btn: React.CSSProperties = {
  background: colors.primary,
  border: 'none',
  borderRadius: radius.md,
  color: '#fff',
  cursor: 'pointer',
  fontSize: fontSize.md,
  fontWeight: 900,
  marginTop: spacing.lg,
  padding: '13px 16px',
};

const errStyle: React.CSSProperties = {
  background: colors.accentRedSoft,
  borderRadius: radius.md,
  color: colors.accentRed,
  fontSize: fontSize.sm,
  margin: `${spacing.sm}px 0 0`,
  padding: spacing.md,
};
