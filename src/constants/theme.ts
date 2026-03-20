// ─── Primitive tokens ────────────────────────────────────────────────────────
// 5 base colors. Swap hex here to rebrand — never reference these directly in UI.

const palette = {
  brand:   '#FE99D9',   // pink accent
  brand2: '#dfe5f3',   // light blue accent (currently unused)
  black:   '#000000',
  dark:    '#0a0a0a',   // near-black surface
  grey:    '#666666',   // mid grey
  white:   '#FFFFFF',
} as const;

// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const darkColors = {
  // Backgrounds
  bgPrimary:   palette.black,
  bgSecondary: palette.dark,
  bgTertiary:  '#1A1A1A',
  bgBrand:     palette.brand,
  bgBlack:     palette.black,

  // Text
  textPrimary:   palette.white,
  textSecondary: '#D9D9D9',
  textMuted:     '#ABABAB',
  textOnBrand:   palette.white,

  // UI
  accent:     palette.brand,
  border:     palette.grey,
  card:       '#1A1A1A',

  // Legacy aliases (kept for backward compat — map to semantic equivalents)
  background: palette.black,
  surface:    palette.dark,
} as const;

export const lightColors = {
  // Backgrounds
  bgPrimary:   '#F5F0EB',
  bgSecondary: '#EDE8E2',
  bgTertiary:  '#E2DDD7',
  bgBrand:     palette.brand,
  bgBlack:     palette.black,

  // Text
  textPrimary:   '#111111',
  textSecondary: '#444444',
  textMuted:     '#888888',
  textOnBrand:   palette.white,

  // UI
  accent:     palette.brand,
  border:     '#C8C3BD',
  card:       '#E2DDD7',

  // Legacy aliases
  background: '#F5F0EB',
  surface:    '#EDE8E2',
} as const;

export type AppColors = typeof darkColors;

// Backward-compat alias
export const colors = darkColors;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

// ─── Radius ───────────────────────────────────────────────────────────────────

export const radius = {
  sm:   6,
  md:   12,
  lg:   20,
  xl:   28,
  full: 9999,
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const fonts = {
  sans: 'Author',
  serif: 'Telma',
  s: 'S',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
//
//   display  32  Satoshi bold    — screen-level titles (results, onboarding)
//   brand    22  Telma serif     — "Who here" / "Vem här" phrase only
//   heading  16  Satoshi bold    — section headings, category titles, settings rows
//   body     16  Satoshi regular — descriptive text under headings
//   caption  12  Satoshi regular — secondary info, deck descriptions
//   badge    10  Satoshi medium  — uppercase micro-labels, counters, tab text
//   card     28  Telma serif     — question card text

export const typography = {
  display: { fontFamily: fonts.sans,  fontSize: 24, fontWeight: '900' as const, lineHeight: 38, letterSpacing: -0.5 },
  brand:   { fontFamily: fonts.sans, fontSize: 24, fontWeight: '900' as const, lineHeight: 28, letterSpacing: 0 },  // "Who here" / "Vem här" only
  heading: { fontFamily: fonts.sans,  fontSize: 16, fontWeight: '700' as const, lineHeight: 20, letterSpacing: 0 },
  body:    { fontFamily: fonts.sans,  fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontFamily: fonts.sans,  fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  badge:   { fontFamily: fonts.sans,  fontSize: 10, fontWeight: '100' as const, lineHeight: 14, letterSpacing: 1 },
  card:    { fontFamily: fonts.sans,  fontSize: 24, fontWeight: '100' as const, lineHeight: 24, letterSpacing: 0.1, textTransform: 'uppercase' as const },
} as const;

// ─── Dimensions ───────────────────────────────────────────────────────────────

export const dimensions = {
  cardHeight:    400,
  buttonHeight:   52,
  iconTouchSize:  44,
  checkboxSize:   22,
  iconContainer:  32,
  dotSize:         5,
  rowHeight:      80,
} as const;

// ─── Animation ────────────────────────────────────────────────────────────────

export const animation = {
  press:  60,
  quick: 160,
  base:  200,
} as const;
