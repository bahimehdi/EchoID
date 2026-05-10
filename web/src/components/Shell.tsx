import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { session } from '../lib/api';
import { colors, fontSize, radius, shadow, spacing } from '../lib/theme';

export default function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const u = session.user();
  const nav = useNavigate();
  const signOut = () => {
    session.clear();
    nav('/login', { replace: true });
  };
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <header style={header}>
        <div style={brandWrap}>
          <div style={mark}>UIT</div>
          <div>
            <strong style={brand}>Portail UIT</strong>
            <span style={product}>EchoID Nexus</span>
          </div>
        </div>
        <div style={titleWrap}>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>
        <div style={userWrap}>
          <div style={avatar}>{initials(u?.fullName ?? u?.email)}</div>
          <span style={userText}>
            {u?.fullName ?? u?.email} · {u?.role}
          </span>
          <button onClick={signOut} style={btn}>Déconnexion</button>
        </div>
      </header>
      <main style={main}>{children}</main>
    </div>
  );
}

function initials(name?: string) {
  if (!name) return 'U';
  return name
    .split(/[.\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const header: React.CSSProperties = {
  alignItems: 'center',
  background: colors.bg,
  display: 'grid',
  gap: spacing.lg,
  gridTemplateColumns: 'minmax(220px, 1fr) minmax(280px, 1.4fr) minmax(280px, 1fr)',
  padding: `${spacing.lg}px ${spacing.xl}px ${spacing.md}px`,
};

const brandWrap: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.md,
};

const mark: React.CSSProperties = {
  alignItems: 'center',
  background: colors.primary,
  borderRadius: radius.md,
  boxShadow: shadow.card,
  color: '#fff',
  display: 'grid',
  fontSize: fontSize.sm,
  fontWeight: 900,
  height: 42,
  justifyItems: 'center',
  letterSpacing: 0.6,
  width: 42,
};

const brand: React.CSSProperties = {
  color: colors.primary,
  display: 'block',
  fontSize: fontSize.lg,
  fontWeight: 900,
};

const product: React.CSSProperties = {
  color: colors.textMuted,
  display: 'block',
  fontSize: fontSize.sm,
  marginTop: 1,
};

const titleWrap: React.CSSProperties = {
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  color: colors.text,
  fontSize: fontSize.xxl,
  fontWeight: 900,
  letterSpacing: 0,
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.md,
  margin: `${spacing.xs}px 0 0`,
};

const userWrap: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.sm,
  justifyContent: 'flex-end',
};

const avatar: React.CSSProperties = {
  alignItems: 'center',
  background: colors.primarySoft,
  borderRadius: radius.pill,
  color: colors.primary,
  display: 'grid',
  flex: '0 0 auto',
  fontSize: fontSize.sm,
  fontWeight: 900,
  height: 38,
  justifyItems: 'center',
  width: 38,
};

const userText: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.sm,
  maxWidth: 220,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const btn: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  color: colors.accentRed,
  cursor: 'pointer',
  fontSize: fontSize.sm,
  fontWeight: 800,
  padding: '9px 12px',
};

const main: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: 1320,
  padding: `${spacing.md}px ${spacing.xl}px ${spacing.xxl}px`,
};
