import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { session } from '../lib/api';

export default function Shell({ title, children }: { title: string; children: ReactNode }) {
  const u = session.user();
  const nav = useNavigate();
  const signOut = () => {
    session.clear();
    nav('/login', { replace: true });
  };
  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', background: '#1E293B', borderBottom: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <strong style={{ fontSize: 18 }}>EchoID Nexus</strong>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>
            {u?.fullName ?? u?.email} · {u?.role}
          </span>
          <button onClick={signOut} style={btn}>Déconnexion</button>
        </div>
      </header>
      <main style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>{children}</main>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: '#0F172A', color: '#F87171', border: '1px solid #334155',
  borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer',
};
