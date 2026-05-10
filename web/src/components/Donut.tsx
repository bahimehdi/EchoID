import { colors, fontSize } from '../lib/theme';

export default function Donut({
  pct,
  size = 132,
  stroke = 12,
  color = colors.primary,
  caption,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  caption?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  const arcLen = (p / 100) * c / 3;
  const gap = c * 0.04;

  return (
    <div style={{ ...root, width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
          {p > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${gap}`}
            />
          )}
        </g>
      </svg>
      <div style={center}>
        <strong style={value}>{Math.round(p)}%</strong>
        {caption && <span style={captionStyle}>{caption}</span>}
      </div>
    </div>
  );
}

const root: React.CSSProperties = {
  alignItems: 'center',
  display: 'grid',
  justifyItems: 'center',
  position: 'relative',
};

const center: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  inset: 0,
  justifyContent: 'center',
  position: 'absolute',
};

const value: React.CSSProperties = {
  color: colors.text,
  fontSize: fontSize.xl,
  fontWeight: 900,
};

const captionStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.sm,
  marginTop: 2,
};
