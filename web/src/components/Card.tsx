import { ReactNode } from 'react';

export default function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section style={card}>
      <header style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</h3>
        {subtitle && <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: 12 }}>{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

const card: React.CSSProperties = {
  background: '#1E293B', borderRadius: 14, padding: 18, border: '1px solid #1f2a44',
};
