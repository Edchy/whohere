export const colors = {
  // Backgrounds
  background: '#0D0D0D',
  surface: '#141414',
  card: '#1A1A1A',
  cardBorder: '#242424',

  // Text — warm off-white
  textPrimary: '#F5F0E8',
  textSecondary: '#8A8480',
  textMuted: '#4A4540',

  // Accent — warm gold/amber
  accent: '#C8A97A',
  accentSoft: '#3D2F1E',
  accentDim: '#C8A97A22',

  // Mode tints (very subtle)
  datingTint: '#C8A97A',   // warm amber
  friendsTint: '#A0A0A0',  // neutral
  soloTint: '#7A9FB0',     // slightly cooler blue

  // UI
  border: '#222222',
  overlay: 'rgba(0,0,0,0.92)',
  destructive: '#8B3A3A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const typography = {
  // Serif — for card questions
  cardQuestion: { fontSize: 28, fontWeight: '400' as const, lineHeight: 40, letterSpacing: 0.2 },
  cardPrefix: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, fontStyle: 'italic' as const, letterSpacing: 0.5 },

  // Sans — for UI
  displayLarge: { fontSize: 40, fontWeight: '300' as const, lineHeight: 48, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '300' as const, lineHeight: 36, letterSpacing: -0.3 },
  heading: { fontSize: 20, fontWeight: '400' as const, lineHeight: 28 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 1.2 },
};
