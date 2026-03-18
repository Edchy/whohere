// ─── Primitive tokens ────────────────────────────────────────────────────────
// Raw named values. No semantic meaning — never use these directly in UI code.
// "brand" is color-agnostic: swap the hex values here to change the brand color
// without touching any semantic token names or call sites.

const palette = {
  // Brand scale (red)
  brand500: '#FE99D9',   // pure brand red — base
  brand400: '#FF2F00',   // orange-red variant
  brand700: '#CC0000',   // darker red for destructive/hover

  // Neutral scale (black → white)
  neutral900: '#101010',   // near-black — primary surface
  neutral700: '#666666',   // mid grey
  neutral500: '#ABABAB',   // light grey
  neutral300: '#D9D9D9',   // very light grey
  neutral200: '#DDDDDD',   // very light grey 2
  neutral150: '#EDEDED',   // off-white
  neutral100: '#FAFAFA',   // near-white
  neutral50:  '#FFFFFF',   // pure white

  // Special use (badges only)
  green:      '#00D816',   // badge: positive/correct
  greenMint:  '#5CFFA8',   // badge: secondary positive
  yellow:     '#FFB700',   // badge: warning/highlight

  // Absolute
  black:      '#000000',
  white:      '#FFFFFF',
  transparent: 'rgba(0,0,0,0)',
} as const;

// ─── Semantic tokens ──────────────────────────────────────────────────────────
// Named by role, derived from palette. Never hardcode hex here.
//
// Two surface+text pairs underpin the whole UI:
//
//   Neutral surface  →  brand text      (cream bg, red text  — default)
//   Brand surface    →  neutral text    (red bg,   cream text — inverted)

export const darkColors = {
  // Backgrounds
  bgPrimary:   palette.black,              // main app background (#000)
  bgSecondary: palette.neutral900,         // cards, sheets (#101010)
  bgTertiary:  '#1A1A1A',                  // inset surfaces
  bgBrand:     palette.brand500,           // brand-colored surface (buttons)
  bgBrandSoft: palette.brand500 + '20',    // red @ 12% opacity
  bgBlack:     palette.black,              // discretion screen

  // Text — on dark surfaces (white/grey)
  textPrimary:   palette.white,            // high emphasis
  textSecondary: palette.neutral300,       // medium emphasis
  textMuted:     palette.neutral500,       // low emphasis

  // Text — on brand (red) surfaces
  textOnBrand:      palette.white,
  textOnBrandMuted: palette.white + '99',
  textOnBlack:      '#111111',             // barely-visible on black

  // Accent
  accent:     palette.brand500,            // #FF0000
  accentDim:  palette.brand500 + '20',
  accentSoft: palette.brand500 + '33',

  // Mode tints
  datingTint:  palette.brand500,           // red
  friendsTint: palette.brand400,           // orange-red
  soloTint:    palette.neutral500,         // grey

  // Badge colors (use sparingly)
  badgeGreen:  palette.green,
  badgeMint:   palette.greenMint,
  badgeYellow: palette.yellow,

  // UI chrome
  border:      palette.neutral700,         // #666
  overlay:     palette.black + 'F2',       // black @ 95%
  destructive: palette.brand700,
  white:       palette.white,

  // Legacy aliases
  background:  palette.black,
  surface:     palette.neutral900,
  card:        '#1A1A1A',
  cardBorder:  palette.neutral700,
  brandBg:     palette.brand500,
} as const;

export const lightColors = {
  // Backgrounds
  bgPrimary:   '#F5F0EB',
  bgSecondary: '#EDE8E2',
  bgTertiary:  '#E2DDD7',
  bgBrand:     palette.brand500,
  bgBrandSoft: palette.brand500 + '20',
  bgBlack:     palette.black,              // always black (discretion screen)

  // Text — on light surfaces (dark)
  textPrimary:   '#111111',
  textSecondary: '#444444',
  textMuted:     '#888888',

  // Text — on brand (red) surfaces
  textOnBrand:      palette.white,
  textOnBrandMuted: palette.white + '99',
  textOnBlack:      '#111111',

  // Accent
  accent:     palette.brand500,
  accentDim:  palette.brand500 + '20',
  accentSoft: palette.brand500 + '33',

  // Mode tints
  datingTint:  palette.brand500,
  friendsTint: palette.brand400,
  soloTint:    palette.neutral500,

  // Badge colors (use sparingly)
  badgeGreen:  palette.green,
  badgeMint:   palette.greenMint,
  badgeYellow: palette.yellow,

  // UI chrome
  border:      '#C8C3BD',
  overlay:     'rgba(245,240,235,0.95)',
  destructive: palette.brand700,
  white:       palette.white,

  // Legacy aliases
  background:  '#F5F0EB',
  surface:     '#EDE8E2',
  card:        '#E2DDD7',
  cardBorder:  '#D4CFC9',
  brandBg:     palette.brand500,
} as const;

export type AppColors = typeof darkColors;

// Backward-compat alias — components that have not yet migrated can still import `colors`
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
  heading:   'Pecita',           // loaded via useFonts in app/_layout.tsx
  copy:      'Raleway-Regular',  // loaded via useFonts in app/_layout.tsx
  ui:        'Raleway-Thin',     // system default
  question:  'Raleway-Regular',  // card question text — swap as needed
  black:     'Raleway-Bold',    // tile titles, heavy display text
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
// 5-level scale. Every font size in the app maps to one of these.
//
//   display  36  — home screen mode titles
//   heading  24  — screen headings, card questions
//   body     16  — descriptions, card prefix, row labels
//   caption  12  — secondary info, deck descriptions
//   label    10  — uppercase micro-labels, badges

export const typography = {
  display:      { fontFamily: fonts.heading, fontSize: 36, fontWeight: '400' as const, lineHeight: 44, letterSpacing: -1 },
  heading:      { fontFamily: fonts.heading, fontSize: 24, fontWeight: '400' as const, lineHeight: 32, letterSpacing: -0.3 },
  body:         { fontFamily: fonts.copy,    fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium:   { fontFamily: fonts.copy,    fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  caption:      { fontFamily: fonts.copy,    fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:        { fontFamily: fonts.ui,      fontSize: 10, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 1 },
} as const;

// ─── Dimensions ───────────────────────────────────────────────────────────────
// Fixed sizes for reusable UI elements. Use these instead of hardcoded px values.

export const dimensions = {
  cardHeight:    400,   // play screen card height
  buttonHeight:   52,   // primary action button height
  iconTouchSize:  44,   // minimum tappable icon area
  checkboxSize:   22,   // checkbox / radio circle diameter
  iconContainer:  32,   // icon wrapper in list rows
  dotSize:         5,   // navigation / pagination dot
  rowHeight:      80,   // standard list row height
} as const;

// ─── Animation ────────────────────────────────────────────────────────────────
// Shared durations (ms) for Animated / Reanimated transitions.

export const animation = {
  press:  60,   // press-in feedback
  quick: 160,   // fast transitions (card flip)
  base:  200,   // default transition (press-out, fade)
} as const;
