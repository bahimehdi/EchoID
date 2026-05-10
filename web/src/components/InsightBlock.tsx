import Badge from './Badge';
import { Accent, accentColor, colors, fontSize, radius, spacing } from '../lib/theme';
import { Insight } from '../lib/insightsFixtures';

export default function InsightBlock({ insight, accent = 'primary' }: { insight: Insight; accent?: Accent }) {
  return (
    <div style={{ ...root, borderLeftColor: accentColor[accent] }}>
      <div style={header}>
        <strong style={headline}>{insight.headline}</strong>
        <Badge tone={accent === 'red' ? 'red' : accent === 'orange' ? 'orange' : accent === 'green' ? 'green' : 'primary'}>
          Confiance {Math.round(insight.confidence * 100)} %
        </Badge>
      </div>
      <p style={body}>{insight.body}</p>
      <p style={action}>{insight.action}</p>
    </div>
  );
}

const root: React.CSSProperties = {
  background: colors.surfaceMuted,
  borderLeft: `4px solid ${colors.primary}`,
  borderRadius: radius.md,
  marginTop: spacing.lg,
  padding: spacing.lg,
};

const header: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.sm,
  justifyContent: 'space-between',
};

const headline: React.CSSProperties = {
  color: colors.text,
  fontSize: fontSize.base,
};

const body: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.md,
  lineHeight: 1.55,
  margin: `${spacing.sm}px 0 0`,
};

const action: React.CSSProperties = {
  color: colors.primary,
  fontSize: fontSize.md,
  fontWeight: 700,
  lineHeight: 1.45,
  margin: `${spacing.sm}px 0 0`,
};
