// ─── Primitive tokens ────────────────────────────────────────────────────────
// 5 base colors. Swap hex here to rebrand — never reference these directly in UI.

const palette = {
  brand:    '#FE99D9',   // pink accent
  ink:      '#111111',   // near-black (never pure black)
  dim:      '#1A1A1A',   // dark surface
  smoke:    '#2E2E2E',   // dark secondary surface
  grey:     '#666666',   // mid grey
  silver:   '#AAAAAA',   // muted text
  fog:      '#F2EEE9',   // off-white (never pure white)
  mist:     '#E8E3DD',   // light secondary surface
  stone:    '#D6D0CA',   // light border / tertiary surface
  
} as const;

export const warmTones = {
  periwinkle: '#dfe5f3',  // light blue
  blush:      '#f9edf0',  // very light pink
  champagne:  '#e6c8b7',  // soft peach-cream
  cognac:     '#c3955b',  // warm brown
  amber:      '#ba6a36',  // burnt orange
  espresso:   '#261311',  // very dark brown
} as const;


// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const darkColors = {
  bgPrimary:   palette.ink,
  bgSecondary: palette.dim,
  bgCard:      warmTones.espresso,
  bgBrand:     palette.brand,
  bgBlack:     palette.ink,

  textPrimary:   palette.fog,
  textSecondary: palette.silver,
  textMuted:     palette.grey,
  textOnBrand:   palette.fog,

  accent:  palette.brand,
  border:  palette.smoke,
} as const;

export const lightColors = {
  bgPrimary:   palette.fog,
  bgSecondary: palette.mist,
  bgCard:      warmTones.blush,
  bgBrand:     palette.brand,
  bgBlack:     palette.ink,

  textPrimary:   palette.ink,
  textSecondary: palette.grey,
  textMuted:     palette.silver,
  textOnBrand:   palette.fog,

  accent:  palette.brand,
  border:  palette.stone,
} as const;

export type AppColors = { [K in keyof typeof darkColors]: string };

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
  card:    { fontFamily: fonts.sans,  fontSize: 24, fontWeight: '500' as const, lineHeight: 24, letterSpacing: 0.1, textTransform: 'uppercase' as const },
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
