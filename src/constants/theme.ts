export const colors = {
  // Backgrounds
  background: '#F7F2EC',
  surface: '#EFE8DF',
  card: '#E8E0D5',
  cardBorder: '#D8CEBC',

  // Text — red  (oklch-derived, converted to sRGB hex)
  textPrimary: '#D42020',    // oklch(0.52 0.21 27)
  textSecondary: '#E04040',  // oklch(0.58 0.18 27)
  textMuted: '#E88888',      // oklch(0.68 0.10 27)

  // Accent — vivid red
  accent: '#D42020',         // oklch(0.52 0.21 27)
  accentSoft: '#F5E0E0',
  accentDim: '#D4202020',

  // Mode tints
  datingTint: '#D42020',     // oklch(0.52 0.21 27)
  friendsTint: '#E04040',    // oklch(0.58 0.18 27)
  soloTint: '#CC6060',       // oklch(0.62 0.12 27)

  // UI
  border: '#D5CABC',
  overlay: 'rgba(247,242,236,0.95)',
  destructive: '#A01010',    // oklch(0.42 0.20 27)
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
