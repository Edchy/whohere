export const colors = {
  // Backgrounds
  background: '#F7F2EC',
  surface: '#EFE8DF',
  card: '#E8E0D5',
  cardBorder: '#D8CEBC',

  // Text — red
  textPrimary: '#B83030',
  textSecondary: '#CC5555',
  textMuted: '#DC9898',

  // Accent — deep red
  accent: '#9E2020',
  accentSoft: '#F2E0E0',
  accentDim: '#B8303020',

  // Mode tints (very subtle)
  datingTint: '#B83030',   // red
  friendsTint: '#CC5555',  // mid red
  soloTint: '#C07070',     // soft red

  // UI
  border: '#D5CABC',
  overlay: 'rgba(247,242,236,0.95)',
  destructive: '#7A1515',
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
