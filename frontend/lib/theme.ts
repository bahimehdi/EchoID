// Design tokens extracted from EchoID Figma. Keep all visual values here so
// screens stay consistent and re-skinning is one file's worth of work.

export const colors = {
  bg: '#F4F4F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FC',
  border: '#E5E7EB',

  text: '#1A1A2E',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',

  primary: '#1E3A8A',           // UIT navy — buttons, links, active tab text
  primarySoft: '#EEF2FF',       // input bg, badge tint
  primaryStrong: '#173A7A',     // pressed state

  accentOrange: '#F59E0B',
  accentOrangeSoft: '#FEF3C7',
  accentRed: '#DC2626',
  accentRedSoft: '#FEE2E2',
  accentGreen: '#10B981',
  accentGreenSoft: '#D1FAE5',
  accentBlue: '#3B82F6',
  accentPurpleSoft: '#EDE9FE',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 34,
};

export const shadow = {
  card: {
    shadowColor: '#0B1B45',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fab: {
    shadowColor: '#0B1B45',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};

// Wd score thresholds shared with backend's WdResponseDto.status mapping.
export const wdColor = (score: number): string => {
  if (score < 0.05) return colors.accentGreen;
  if (score < 0.12) return colors.accentOrange;
  if (score < 0.20) return '#F97316';
  return colors.accentRed;
};

// Progress-bar color based on % completion (Mes Cours design).
export const progressColor = (pct: number): string => {
  if (pct >= 80) return colors.primary;
  if (pct >= 40) return colors.accentOrange;
  return colors.accentRed;
};
