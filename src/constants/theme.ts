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

  // Text — on neutral surfaces (use brand color)
  textPrimary:   palette.brand500,   // high emphasis
  textSecondary: palette.brand400,   // medium emphasis
  textMuted:     palette.brand200,   // low emphasis / placeholder

  // Text — on brand surfaces (use neutral color)
  textOnBrand:      palette.neutral100,   // high emphasis on brand bg
  textOnBrandMuted: palette.neutral100 + '99',   // neutral100 @ 60% opacity

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

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  cardQuestion:  { fontSize: 28, fontWeight: '400' as const, lineHeight: 40, letterSpacing: 0.2 },
  cardPrefix:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, fontStyle: 'italic' as const, letterSpacing: 0.5 },

  displayLarge:  { fontSize: 40, fontWeight: '300' as const, lineHeight: 48, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '300' as const, lineHeight: 36, letterSpacing: -0.3 },
  heading:       { fontSize: 20, fontWeight: '400' as const, lineHeight: 28 },
  body:          { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium:    { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption:       { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:         { fontSize: 11, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 1.2 },
} as const;
