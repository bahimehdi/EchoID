import { ReactNode } from 'react';
import { Accent, accentColor, colors, fontSize, radius, shadow, spacing } from '../lib/theme';

export default function Card({
  title,
  subtitle,
  children,
  accent,
  padding = spacing.lg,
  style,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  accent?: Accent;
  padding?: number;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        ...card,
        borderLeft: accent ? `4px solid ${accentColor[accent]}` : '1px solid transparent',
        padding,
        ...style,
      }}
    >
      {(title || subtitle) && (
        <header style={{ marginBottom: spacing.md }}>
          {title && <h3 style={titleStyle}>{title}</h3>}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

const card: React.CSSProperties = {
  background: colors.surface,
  borderRadius: radius.lg,
  boxShadow: shadow.card,
  boxSizing: 'border-box',
};

const titleStyle: React.CSSProperties = {
  color: colors.primary,
  fontSize: fontSize.sm,
  fontWeight: 900,
  letterSpacing: 0.6,
  margin: 0,
  textTransform: 'uppercase',
};

const subtitleStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.sm,
  lineHeight: 1.45,
  margin: `${spacing.xs}px 0 0`,
};
