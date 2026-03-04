export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FAFAFA',
  cardBorder: '#E0E0E0',

  // Text
  textPrimary: '#CC0000',
  textSecondary: '#990000',
  textMuted: '#CCAAAA',

  // Accent — red
  accent: '#CC0000',
  accentSoft: '#FFE5E5',
  accentDim: '#CC000022',

  // Mode tints
  datingTint: '#CC0000',
  friendsTint: '#AA2222',
  soloTint: '#DD4444',

  // UI
  border: '#E8D0D0',
  overlay: 'rgba(255,255,255,0.92)',
  destructive: '#880000',
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
