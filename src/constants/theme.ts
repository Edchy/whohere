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

// ─── Omnipollo palette (experimental) ────────────────────────────────────────
// const omnipolloBase = {
//   brand:    '#E8442A',   // red-orange accent — loud, primary
//   ink:      '#1A0818',   // near-black with purple tint
//   dim:      '#2A1040',   // dark surface — deep purple
//   smoke:    '#3D1A5A',   // dark secondary surface
//   grey:     '#7A5A90',   // mid purple-grey
//   silver:   '#B090C8',   // muted lavender text
//   fog:      '#FFF0FA',   // off-white with pink tint
//   mist:     '#F0E0FF',   // light secondary surface — lavender
//   stone:    '#D8B0F0',   // light border
// };
// const omnipolloTones = {
//   periwinkle: '#5B2DB0',  // deep purple
//   blush:      '#FFD0EE',  // very light pink
//   champagne:  '#E87AC5',  // omnipollo pink
//   cognac:     '#D43080',  // deep magenta
//   amber:      '#4BC8E8',  // cyan — secondary highlight
//   espresso:   '#1A0818',  // near-black
// };


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
  textSecondary: palette.ink,
  textMuted:     palette.grey,
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
  extraLight: 'AuthorExtralight',
  regular:    'AuthorRegular',
  bold:       'AuthorBold',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
//
//   display  — screen-level titles
//   brand    — "Who here" / "Vem här" phrase only
//   heading  — section headings, settings rows
//   body     — descriptive text
//   caption  — secondary info, deck descriptions
//   badge    — uppercase micro-labels, counters, tab text
//   card     — question card text

export const typography = {
  display: { fontFamily: fonts.bold,       fontSize: 32, lineHeight: 28, letterSpacing: -1 },
  brand:   { fontFamily: fonts.bold,       fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  heading: { fontFamily: fonts.bold,       fontSize: 16, lineHeight: 26, letterSpacing: 0 },
  body:    { fontFamily: fonts.regular,    fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.regular,    fontSize: 14, lineHeight: 18 },
  badge:   { fontFamily: fonts.regular,    fontSize: 10, lineHeight: 14, letterSpacing: 1 },
  card:    { fontFamily: fonts.extraLight,       fontSize: 28, lineHeight: 28, letterSpacing: 0.1 },
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

export const appName = 'stereotype';
export const cardPrefix = 'Vem här…';

export const animation = {
  press:  60,
  quick: 160,
  base:  200,
} as const;
