// ─── Primitive tokens ────────────────────────────────────────────────────────
// Raw named values. No semantic meaning — never use these directly in UI code.
// "brand" is color-agnostic: swap the hex values here to change the brand color
// without touching any semantic token names or call sites.

const palette = {
  // Brand scale (oklch-derived, converted to sRGB hex — currently a warm red)
  brand900: '#6B0808',   // oklch(0.32 0.21 27) — deepest
  brand700: '#A01010',   // oklch(0.42 0.21 27)
  brand500: '#D42020',   // oklch(0.52 0.21 27) — base brand color
  brand400: '#E04040',   // oklch(0.58 0.18 27)
  brand300: '#CC6060',   // oklch(0.62 0.12 27)
  brand200: '#E88888',   // oklch(0.68 0.10 27)
  brand100: '#F5E0E0',   // oklch(0.90 0.04 27) — tint
  brand50:  '#FDF5F5',   // oklch(0.97 0.01 27) — near-white tint

  // Warm neutral scale (parchment/cream)
  neutral50:  '#FDFAF6',
  neutral100: '#F7F2EC',  // primary background
  neutral200: '#EFE8DF',
  neutral300: '#E8E0D5',
  neutral400: '#D8CEBC',
  neutral500: '#BFB4A4',
  neutral600: '#9C9080',
  neutral700: '#6E6458',
  neutral800: '#3D3530',
  neutral900: '#1A1208',

  // Absolute values
  white: '#FFFFFF',
  black: '#000000',
  blackSoft: '#111111',
} as const;

// ─── Semantic tokens ──────────────────────────────────────────────────────────
// Named by role, derived from palette. Never hardcode hex here.
//
// Two surface+text pairs underpin the whole UI:
//
//   Neutral surface  →  brand text      (cream bg, red text  — default)
//   Brand surface    →  neutral text    (red bg,   cream text — inverted)

export const colors = {
  // Backgrounds — neutral surfaces
  bgPrimary:   palette.neutral100,   // main app background
  bgSecondary: palette.neutral200,   // cards, sheets, elevated surfaces
  bgTertiary:  palette.neutral300,   // inset / nested surfaces
  bgBrand:     palette.brand500,     // brand-colored surface (buttons, card back)
  bgBrandSoft: palette.brand100,     // soft brand tint
  bgBlack:     palette.black,        // full-black overlay (discretion screen)

  // Text — on neutral surfaces (use brand color)
  textPrimary:   palette.brand500,   // high emphasis
  textSecondary: palette.brand400,   // medium emphasis
  textMuted:     palette.brand200,   // low emphasis / placeholder

  // Text — on brand surfaces (use neutral color)
  textOnBrand:      palette.neutral100,   // high emphasis on brand bg
  textOnBrandMuted: palette.neutral100 + '99',   // neutral100 @ 60% opacity
  textOnBlack:      palette.blackSoft,    // barely-visible hint text on black bg

  // Accent (interactive highlights, icons, active states)
  accent:    palette.brand500,
  accentDim: palette.brand500 + '20',   // brand500 @ 12% opacity

  // Mode tints
  datingTint:  palette.brand500,
  friendsTint: palette.brand400,
  soloTint:    palette.brand300,

  // UI chrome
  border:      palette.neutral400,
  overlay:     palette.neutral100 + 'F2',   // neutral100 @ 95% opacity
  destructive: palette.brand700,
  white:       palette.white,

  // Legacy aliases — kept so existing call sites don't break while we migrate
  background:  palette.neutral100,
  surface:     palette.neutral200,
  card:        palette.neutral300,
  cardBorder:  palette.neutral400,
  brandBg:     palette.brand500,
} as const;

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
  heading: 'Supreme-Extrabold',  // loaded via useFonts in app/_layout.tsx
  copy:    'Cas',                // loaded via useFonts in app/_layout.tsx
  ui:      undefined,            // system default
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
  display:      { fontSize: 36, fontWeight: '400' as const, lineHeight: 44, letterSpacing: -1 },
  heading:      { fontSize: 24, fontWeight: '400' as const, lineHeight: 32, letterSpacing: -0.3 },
  body:         { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium:   { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  caption:      { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:        { fontSize: 10, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 1 },
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
