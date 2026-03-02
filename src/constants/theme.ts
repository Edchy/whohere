export const colors = {
  // Backgrounds
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#242424',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',

  // Accents
  accent: '#E8C547',       // warm yellow — main CTA
  accentSoft: '#F5E4A0',

  // Deck colors (used per deck)
  deckPurple: '#8B5CF6',
  deckPink: '#EC4899',
  deckOrange: '#F97316',
  deckTeal: '#14B8A6',
  deckBlue: '#3B82F6',
  deckRed: '#EF4444',

  // UI
  border: '#2A2A2A',
  overlay: 'rgba(0,0,0,0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

export const typography = {
  displayLarge: { fontSize: 36, fontWeight: '700' as const, lineHeight: 44 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  heading: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.8 },
};
