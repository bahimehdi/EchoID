import { ReactNode } from 'react';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type Tone = 'primary' | 'orange' | 'red' | 'green' | 'gray' | 'blue' | 'purple';

const TONE: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primarySoft, fg: colors.primary },
  orange: { bg: colors.accentOrangeSoft, fg: colors.accentOrange },
  red: { bg: colors.accentRedSoft, fg: colors.accentRed },
  green: { bg: colors.accentGreenSoft, fg: colors.accentGreen },
  gray: { bg: colors.surfaceMuted, fg: colors.textMuted },
  blue: { bg: colors.accentBlueSoft, fg: colors.accentBlue },
  purple: { bg: colors.accentPurpleSoft, fg: colors.accentPurple },
};

export default function Badge({ children, tone = 'primary' }: { children: ReactNode; tone?: Tone }) {
  const { bg, fg } = TONE[tone];
  return <span style={{ ...root, background: bg, color: fg }}>{children}</span>;
}

const root: React.CSSProperties = {
  alignSelf: 'flex-start',
  borderRadius: radius.pill,
  display: 'inline-flex',
  fontSize: fontSize.xs,
  fontWeight: 800,
  letterSpacing: 0.4,
  lineHeight: 1,
  padding: `${spacing.sm - 2}px ${spacing.md}px`,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};
