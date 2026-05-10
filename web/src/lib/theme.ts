export const colors = {
  bg: '#F4F4F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FC',
  border: '#E5E7EB',

  text: '#1A1A2E',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',

  primary: '#1E3A8A',
  primarySoft: '#EEF2FF',
  primaryStrong: '#173A7A',

  accentOrange: '#F59E0B',
  accentOrangeSoft: '#FEF3C7',
  accentRed: '#DC2626',
  accentRedSoft: '#FEE2E2',
  accentGreen: '#10B981',
  accentGreenSoft: '#D1FAE5',
  accentBlue: '#3B82F6',
  accentBlueSoft: '#DBEAFE',
  accentPurple: '#7C3AED',
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
  card: '0 4px 14px rgba(11, 27, 69, 0.06)',
  raised: '0 16px 32px rgba(11, 27, 69, 0.10)',
};

export type Accent = 'primary' | 'orange' | 'red' | 'green' | 'blue' | 'purple';

export const accentColor: Record<Accent, string> = {
  primary: colors.primary,
  orange: colors.accentOrange,
  red: colors.accentRed,
  green: colors.accentGreen,
  blue: colors.accentBlue,
  purple: colors.accentPurple,
};

export const chartPalette = [
  colors.primary,
  colors.accentOrange,
  colors.accentGreen,
  colors.accentBlue,
  colors.accentPurple,
  colors.accentRed,
];
