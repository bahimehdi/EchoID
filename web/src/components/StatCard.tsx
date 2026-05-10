import Card from './Card';
import Badge from './Badge';
import { Accent, colors, fontSize, spacing } from '../lib/theme';

export default function StatCard({
  label,
  value,
  detail,
  accent = 'primary',
}: {
  label: string;
  value: number | string;
  detail?: string;
  accent?: Accent;
}) {
  return (
    <Card accent={accent} padding={16}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
      {detail && (
        <div style={{ marginTop: spacing.sm }}>
          <Badge tone={accent === 'green' ? 'green' : accent === 'orange' ? 'orange' : accent === 'red' ? 'red' : 'primary'}>
            {detail}
          </Badge>
        </div>
      )}
    </Card>
  );
}

const labelStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.xs,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
};

const valueStyle: React.CSSProperties = {
  color: colors.text,
  fontSize: 30,
  fontWeight: 900,
  lineHeight: 1,
  marginTop: spacing.sm,
};
